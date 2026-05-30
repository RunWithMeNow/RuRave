using Microsoft.AspNetCore.Mvc;
using RuRave.Application.Common;
using RuRave.Application.Concerts;

namespace RuRave.Api.Controllers;

/// <summary>
/// Список концертов для главной страницы (фильтр по городу и поиск).
/// </summary>
[ApiController]
[Route("api/concerts")]
[Produces("application/json")]
public class ConcertsController(IConcertReadService concertReadService) : ControllerBase
{
    /// <summary>
    /// Возвращает страницу опубликованных концертов в выбранном городе.
    /// </summary>
    /// <param name="cityId" example="1">Идентификатор города (обязательный).</param>
    /// <param name="search" example="DK">Поиск по названию концерта или имени артиста (необязательно).</param>
    /// <param name="dateFrom" example="2026-06-01">Начало периода (YYYY-MM-DD), вместе с dateTo.</param>
    /// <param name="dateTo" example="2026-06-30">Конец периода (YYYY-MM-DD), вместе с dateFrom.</param>
    /// <param name="page" example="1">Номер страницы, начиная с 1.</param>
    /// <param name="pageSize" example="20">Размер страницы (1–50).</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResultDto<ConcertListItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PagedResultDto<ConcertListItemDto>>> GetConcerts(
        [FromQuery] int? cityId,
        [FromQuery] string? search,
        [FromQuery] string? dateFrom,
        [FromQuery] string? dateTo,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        if (cityId is null)
        {
            return Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Invalid query",
                detail: "Query parameter 'cityId' is required.");
        }

        var (parsedFrom, parsedTo) = ConcertQueryDates.ParseRange(dateFrom, dateTo);

        var request = new GetConcertsRequest
        {
            CityId = cityId.Value,
            Search = search,
            DateFrom = parsedFrom,
            DateTo = parsedTo,
            Page = page,
            PageSize = Math.Min(pageSize, ConcertQueryValidator.MaxPageSize)
        };

        var result = await concertReadService.GetConcertsAsync(request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Возвращает календарные даты (YYYY-MM-DD), в которые есть опубликованные концерты в городе.
    /// </summary>
    /// <param name="cityId" example="1">Идентификатор города.</param>
    /// <param name="from" example="2026-06-01">Начало окна календаря.</param>
    /// <param name="to" example="2026-06-30">Конец окна календаря.</param>
    /// <param name="search" example="DK">Учитывать текущий поиск (необязательно).</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    [HttpGet("dates")]
    [ProducesResponseType(typeof(ConcertDatesDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ConcertDatesDto>> GetConcertDates(
        [FromQuery] int? cityId,
        [FromQuery] string? from,
        [FromQuery] string? to,
        [FromQuery] string? search,
        CancellationToken cancellationToken = default)
    {
        if (cityId is null)
        {
            return Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Invalid query",
                detail: "Query parameter 'cityId' is required.");
        }

        var (parsedFrom, parsedTo) = ConcertQueryDates.ParseRequiredWindow(from, to);

        var request = new GetConcertDatesRequest
        {
            CityId = cityId.Value,
            From = parsedFrom,
            To = parsedTo,
            Search = search
        };

        var result = await concertReadService.GetConcertDatesAsync(request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Возвращает опубликованный концерт по идентификатору (страница «Подробнее»).
    /// </summary>
    /// <param name="id" example="1">Идентификатор концерта.</param>
    /// <param name="cancellationToken">Токен отмены.</param>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ConcertDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ConcertDetailDto>> GetConcertById(
        int id,
        CancellationToken cancellationToken = default)
    {
        var result = await concertReadService.GetConcertByIdAsync(id, cancellationToken);
        return Ok(result);
    }
}

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

        var request = new GetConcertsRequest
        {
            CityId = cityId.Value,
            Search = search,
            Page = page,
            PageSize = Math.Min(pageSize, ConcertQueryValidator.MaxPageSize)
        };

        var result = await concertReadService.GetConcertsAsync(request, cancellationToken);
        return Ok(result);
    }
}

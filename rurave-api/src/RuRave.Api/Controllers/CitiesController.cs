using Microsoft.AspNetCore.Mvc;
using RuRave.Application.Cities;
using RuRave.Application.Concerts;

namespace RuRave.Api.Controllers;

/// <summary>
/// Справочник городов для фильтра на главной странице.
/// </summary>
[ApiController]
[Route("api/cities")]
[Produces("application/json")]
public class CitiesController(ICityReadService cityReadService) : ControllerBase
{
    /// <summary>
    /// Возвращает все города, отсортированные по названию.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<CityListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CityListItemDto>>> GetCities(
        CancellationToken cancellationToken)
    {
        var cities = await cityReadService.GetCitiesAsync(cancellationToken);
        return Ok(cities);
    }

    /// <summary>
    /// Города, в которых есть опубликованные концерты в указанном периоде.
    /// </summary>
    [HttpGet("afisha-summary")]
    [ProducesResponseType(typeof(IReadOnlyList<CityAfishaSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IReadOnlyList<CityAfishaSummaryDto>>> GetAfishaSummary(
        [FromQuery] string? dateFrom,
        [FromQuery] string? dateTo,
        CancellationToken cancellationToken = default)
    {
        var (parsedFrom, parsedTo) = ConcertQueryDates.ParseRequiredRange(dateFrom, dateTo);
        var summary = await cityReadService.GetAfishaSummaryAsync(
            parsedFrom,
            parsedTo,
            cancellationToken);

        return Ok(summary);
    }

    /// <summary>
    /// Город по slug и сводка афиши за период.
    /// </summary>
    [HttpGet("{slug}")]
    [ProducesResponseType(typeof(CityDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CityDetailDto>> GetCityBySlug(
        string slug,
        [FromQuery] string? dateFrom,
        [FromQuery] string? dateTo,
        CancellationToken cancellationToken = default)
    {
        var (parsedFrom, parsedTo) = ConcertQueryDates.ParseRequiredRange(dateFrom, dateTo);
        var city = await cityReadService.GetCityBySlugAsync(
            slug,
            parsedFrom,
            parsedTo,
            cancellationToken);

        return Ok(city);
    }
}

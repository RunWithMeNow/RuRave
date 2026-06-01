using Microsoft.AspNetCore.Mvc;
using RuRave.Application.Concerts;
using RuRave.Application.Venues;

namespace RuRave.Api.Controllers;

/// <summary>
/// Площадки с афишей в городе и страница площадки.
/// </summary>
[ApiController]
[Route("api/venues")]
[Produces("application/json")]
public class VenuesController(IVenueReadService venueReadService) : ControllerBase
{
    /// <summary>
    /// Площадки в городе, у которых есть опубликованные концерты в указанном периоде.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<VenueListItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<VenueListItemDto>>> GetVenues(
        [FromQuery] int? cityId,
        [FromQuery] string? dateFrom,
        [FromQuery] string? dateTo,
        CancellationToken cancellationToken = default)
    {
        if (cityId is null)
        {
            return Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Invalid query",
                detail: "Query parameter 'cityId' is required.");
        }

        if (cityId.Value <= 0)
        {
            return Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Invalid query",
                detail: "CityId must be greater than zero.");
        }

        var (parsedFrom, parsedTo) = ConcertQueryDates.ParseRequiredRange(dateFrom, dateTo);
        var venues = await venueReadService.GetVenuesAsync(
            cityId.Value,
            parsedFrom,
            parsedTo,
            cancellationToken);

        return Ok(venues);
    }

    /// <summary>
    /// Площадка и концерты на ней в указанном периоде.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(VenueDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VenueDetailDto>> GetVenueById(
        int id,
        [FromQuery] string? dateFrom,
        [FromQuery] string? dateTo,
        CancellationToken cancellationToken = default)
    {
        var (parsedFrom, parsedTo) = ConcertQueryDates.ParseRequiredRange(dateFrom, dateTo);
        var venue = await venueReadService.GetVenueByIdAsync(id, parsedFrom, parsedTo, cancellationToken);
        return Ok(venue);
    }
}

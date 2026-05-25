using Microsoft.AspNetCore.Mvc;
using RuRave.Application.Cities;

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
}

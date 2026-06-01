namespace RuRave.Application.Cities;

public interface ICityReadService
{
    Task<IReadOnlyList<CityListItemDto>> GetCitiesAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CityAfishaSummaryDto>> GetAfishaSummaryAsync(
        DateOnly dateFrom,
        DateOnly dateTo,
        CancellationToken cancellationToken = default);

    Task<CityDetailDto> GetCityBySlugAsync(
        string slug,
        DateOnly dateFrom,
        DateOnly dateTo,
        CancellationToken cancellationToken = default);
}

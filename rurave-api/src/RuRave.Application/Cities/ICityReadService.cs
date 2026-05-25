namespace RuRave.Application.Cities;

public interface ICityReadService
{
    Task<IReadOnlyList<CityListItemDto>> GetCitiesAsync(CancellationToken cancellationToken = default);
}

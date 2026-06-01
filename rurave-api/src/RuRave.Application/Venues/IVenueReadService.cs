namespace RuRave.Application.Venues;

public interface IVenueReadService
{
    Task<IReadOnlyList<VenueListItemDto>> GetVenuesAsync(
        int cityId,
        DateOnly dateFrom,
        DateOnly dateTo,
        CancellationToken cancellationToken = default);

    Task<VenueDetailDto> GetVenueByIdAsync(
        int id,
        DateOnly dateFrom,
        DateOnly dateTo,
        CancellationToken cancellationToken = default);
}

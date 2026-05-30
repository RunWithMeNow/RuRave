using RuRave.Application.Common;

namespace RuRave.Application.Concerts;

public interface IConcertReadService
{
    Task<PagedResultDto<ConcertListItemDto>> GetConcertsAsync(
        GetConcertsRequest request,
        CancellationToken cancellationToken = default);

    Task<ConcertDetailDto> GetConcertByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<ConcertDatesDto> GetConcertDatesAsync(
        GetConcertDatesRequest request,
        CancellationToken cancellationToken = default);
}

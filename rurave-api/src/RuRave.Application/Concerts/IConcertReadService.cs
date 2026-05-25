using RuRave.Application.Common;

namespace RuRave.Application.Concerts;

public interface IConcertReadService
{
    Task<PagedResultDto<ConcertListItemDto>> GetConcertsAsync(
        GetConcertsRequest request,
        CancellationToken cancellationToken = default);
}

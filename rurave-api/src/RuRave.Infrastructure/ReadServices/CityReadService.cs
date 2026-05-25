using Microsoft.EntityFrameworkCore;
using RuRave.Application.Cities;
using RuRave.Infrastructure.Persistence;

namespace RuRave.Infrastructure.ReadServices;

public class CityReadService(AppDbContext db) : ICityReadService
{
    public async Task<IReadOnlyList<CityListItemDto>> GetCitiesAsync(
        CancellationToken cancellationToken = default)
    {
        return await db.Cities
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => new CityListItemDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug
            })
            .ToListAsync(cancellationToken);
    }
}

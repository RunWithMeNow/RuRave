using Microsoft.EntityFrameworkCore;
using RuRave.Application.Common;
using RuRave.Application.Concerts;
using RuRave.Application.Exceptions;
using RuRave.Domain.Enums;
using RuRave.Infrastructure.Persistence;

namespace RuRave.Infrastructure.ReadServices;

public class ConcertReadService(AppDbContext db) : IConcertReadService
{
    public async Task<PagedResultDto<ConcertListItemDto>> GetConcertsAsync(
        GetConcertsRequest request,
        CancellationToken cancellationToken = default)
    {
        ConcertQueryValidator.Validate(request);

        var cityExists = await db.Cities
            .AsNoTracking()
            .AnyAsync(c => c.Id == request.CityId, cancellationToken);

        if (!cityExists)
        {
            throw new CityNotFoundException(request.CityId);
        }

        var search = request.Search?.Trim();
        var hasSearch = !string.IsNullOrEmpty(search);

        // MVP: EF.Functions.Like — на SQL Server обычно CI-коллация (регистронезависимо).
        // Production: рассмотреть полнотекстовый поиск или явную collation.
        var searchPattern = hasSearch ? $"%{search}%" : null;

        var query = db.Concerts
            .AsNoTracking()
            .Where(c => c.Venue.CityId == request.CityId)
            .Where(c => c.Status == ConcertStatus.Published)
            .Where(c => c.TicketCategories.Any(tc => tc.IsActive));

        if (hasSearch)
        {
            query = query.Where(c =>
                EF.Functions.Like(c.Title, searchPattern!) ||
                c.ConcertArtists.Any(ca => EF.Functions.Like(ca.Artist.Name, searchPattern!)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var page = request.Page;
        var pageSize = request.PageSize;

        var rows = await query
            .OrderBy(c => c.StartsAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new
            {
                c.Id,
                c.ImageUrl,
                c.Title,
                c.StartsAt,
                Place = c.Venue.Name,
                Artists = c.ConcertArtists
                    .OrderBy(ca => ca.DisplayOrder)
                    .Select(ca => ca.Artist.Name)
                    .ToList(),
                MinPrice = c.TicketCategories
                    .Where(tc => tc.IsActive)
                    .Min(tc => tc.Price)
            })
            .ToListAsync(cancellationToken);

        var items = rows.Select(r => new ConcertListItemDto
        {
            Id = r.Id,
            ImageUrl = r.ImageUrl,
            Title = r.Title,
            StartsAt = r.StartsAt,
            Place = r.Place,
            Artists = r.Artists,
            ArtistDisplay = string.Join(", ", r.Artists),
            MinPrice = r.MinPrice
        }).ToList();

        return new PagedResultDto<ConcertListItemDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }
}

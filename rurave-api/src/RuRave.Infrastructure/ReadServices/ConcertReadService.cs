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

        var city = await db.Cities
            .AsNoTracking()
            .Where(c => c.Id == request.CityId)
            .Select(c => new { c.Id, c.TimeZoneId })
            .FirstOrDefaultAsync(cancellationToken);

        if (city is null)
        {
            throw new CityNotFoundException(request.CityId);
        }

        var search = request.Search?.Trim();
        var hasSearch = !string.IsNullOrEmpty(search);
        var searchPattern = hasSearch ? $"%{search}%" : null;

        var (rangeStart, rangeEndExclusive) = ConcertDateRange.ToBounds(
            city.TimeZoneId,
            request.DateFrom,
            request.DateTo);

        var query = BuildPublishedConcertsQuery(request.CityId, searchPattern, hasSearch);

        if (rangeStart.HasValue)
        {
            query = query.Where(c => c.StartsAt >= rangeStart.Value);
        }

        if (rangeEndExclusive.HasValue)
        {
            query = query.Where(c => c.StartsAt < rangeEndExclusive.Value);
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

    public async Task<ConcertDetailDto> GetConcertByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var row = await db.Concerts
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Where(c => c.Status == ConcertStatus.Published)
            .Where(c => c.TicketCategories.Any(tc => tc.IsActive))
            .Select(c => new
            {
                c.Id,
                c.ImageUrl,
                c.Title,
                c.Description,
                c.StartsAt,
                Place = c.Venue.Name,
                VenueAddress = c.Venue.Address,
                CityId = c.Venue.CityId,
                CityName = c.Venue.City.Name,
                Artists = c.ConcertArtists
                    .OrderBy(ca => ca.DisplayOrder)
                    .Select(ca => ca.Artist.Name)
                    .ToList(),
                ActiveTickets = c.TicketCategories
                    .Where(tc => tc.IsActive)
                    .OrderBy(tc => tc.SortOrder)
                    .Select(tc => new TicketCategoryItemDto
                    {
                        Name = tc.Name,
                        Price = tc.Price,
                        SortOrder = tc.SortOrder
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (row is null)
        {
            throw new ConcertNotFoundException(id);
        }

        var minPrice = row.ActiveTickets.Min(tc => tc.Price);

        return new ConcertDetailDto
        {
            Id = row.Id,
            ImageUrl = row.ImageUrl,
            Title = row.Title,
            Description = row.Description,
            StartsAt = row.StartsAt,
            Place = row.Place,
            VenueAddress = row.VenueAddress,
            MapSearchQuery = ConcertMapSearchQuery.Build(row.Place, row.VenueAddress),
            CityId = row.CityId,
            CityName = row.CityName,
            Artists = row.Artists,
            ArtistDisplay = string.Join(", ", row.Artists),
            MinPrice = minPrice,
            TicketCategories = row.ActiveTickets
        };
    }

    public async Task<ConcertDatesDto> GetConcertDatesAsync(
        GetConcertDatesRequest request,
        CancellationToken cancellationToken = default)
    {
        ConcertQueryValidator.ValidateDatesRequest(request);

        var city = await db.Cities
            .AsNoTracking()
            .Where(c => c.Id == request.CityId)
            .Select(c => new { c.Id, c.TimeZoneId })
            .FirstOrDefaultAsync(cancellationToken);

        if (city is null)
        {
            throw new CityNotFoundException(request.CityId);
        }

        var search = request.Search?.Trim();
        var hasSearch = !string.IsNullOrEmpty(search);
        var searchPattern = hasSearch ? $"%{search}%" : null;

        var (rangeStart, rangeEndExclusive) = ConcertDateRange.ToBounds(
            city.TimeZoneId,
            request.From,
            request.To);

        var query = BuildPublishedConcertsQuery(request.CityId, searchPattern, hasSearch);

        if (rangeStart.HasValue)
        {
            query = query.Where(c => c.StartsAt >= rangeStart.Value);
        }

        if (rangeEndExclusive.HasValue)
        {
            query = query.Where(c => c.StartsAt < rangeEndExclusive.Value);
        }

        var rows = await query
            .Select(c => new { c.StartsAt, CityTimeZoneId = c.Venue.City.TimeZoneId })
            .ToListAsync(cancellationToken);

        var dates = rows
            .Select(r => ConcertDateRange.ToLocalDate(r.StartsAt, r.CityTimeZoneId))
            .Where(d => d >= request.From && d <= request.To)
            .Distinct()
            .OrderBy(d => d)
            .Select(d => d.ToString("yyyy-MM-dd"))
            .ToList();

        return new ConcertDatesDto { Dates = dates };
    }

    private IQueryable<Domain.Entities.Concert> BuildPublishedConcertsQuery(
        int cityId,
        string? searchPattern,
        bool hasSearch)
    {
        var query = db.Concerts
            .AsNoTracking()
            .Where(c => c.Venue.CityId == cityId)
            .Where(c => c.Status == ConcertStatus.Published)
            .Where(c => c.TicketCategories.Any(tc => tc.IsActive));

        if (hasSearch)
        {
            query = query.Where(c =>
                EF.Functions.Like(c.Title, searchPattern!) ||
                c.ConcertArtists.Any(ca => EF.Functions.Like(ca.Artist.Name, searchPattern!)));
        }

        return query;
    }
}

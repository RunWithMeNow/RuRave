using Microsoft.EntityFrameworkCore;
using RuRave.Application.Concerts;
using RuRave.Application.Exceptions;
using RuRave.Application.Venues;
using RuRave.Infrastructure.Persistence;

namespace RuRave.Infrastructure.ReadServices;

public class VenueReadService(AppDbContext db) : IVenueReadService
{
    public async Task<IReadOnlyList<VenueListItemDto>> GetVenuesAsync(
        int cityId,
        DateOnly dateFrom,
        DateOnly dateTo,
        CancellationToken cancellationToken = default)
    {
        var city = await db.Cities
            .AsNoTracking()
            .Where(c => c.Id == cityId)
            .Select(c => new { c.Id, c.TimeZoneId })
            .FirstOrDefaultAsync(cancellationToken);

        if (city is null)
        {
            throw new CityNotFoundException(cityId);
        }

        var (rangeStart, rangeEndExclusive) = ConcertDateRange.ToBounds(
            city.TimeZoneId,
            dateFrom,
            dateTo);

        var rows = PublishedConcertQuery.ForCity(db.Concerts.AsNoTracking(), cityId);
        rows = PublishedConcertQuery.InStartsAtRange(rows, rangeStart, rangeEndExclusive);

        var grouped = await rows
            .GroupBy(c => new
            {
                c.VenueId,
                c.Venue.Name,
                c.Venue.Address,
                CityId = c.Venue.CityId,
                CityName = c.Venue.City.Name
            })
            .Select(g => new
            {
                g.Key.VenueId,
                g.Key.Name,
                g.Key.Address,
                g.Key.CityId,
                g.Key.CityName,
                ConcertCount = g.Count(),
                NextStartsAt = g.Min(c => c.StartsAt)
            })
            .OrderByDescending(v => v.ConcertCount)
            .ThenBy(v => v.Name)
            .ToListAsync(cancellationToken);

        return grouped.Select(v => new VenueListItemDto
        {
            Id = v.VenueId,
            Name = v.Name,
            Address = v.Address,
            CityId = v.CityId,
            CityName = v.CityName,
            ConcertCount = v.ConcertCount,
            NextStartsAt = v.NextStartsAt
        }).ToList();
    }

    public async Task<VenueDetailDto> GetVenueByIdAsync(
        int id,
        DateOnly dateFrom,
        DateOnly dateTo,
        CancellationToken cancellationToken = default)
    {
        var venue = await db.Venues
            .AsNoTracking()
            .Where(v => v.Id == id)
            .Select(v => new
            {
                v.Id,
                v.Name,
                v.Address,
                v.CityId,
                CityName = v.City.Name,
                CitySlug = v.City.Slug,
                CityImageUrl = v.City.ImageUrl,
                TimeZoneId = v.City.TimeZoneId
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (venue is null)
        {
            throw new VenueNotFoundException(id);
        }

        var (rangeStart, rangeEndExclusive) = ConcertDateRange.ToBounds(
            venue.TimeZoneId,
            dateFrom,
            dateTo);

        var query = PublishedConcertQuery.ForVenue(db.Concerts.AsNoTracking(), id);
        query = PublishedConcertQuery.InStartsAtRange(query, rangeStart, rangeEndExclusive);

        var rows = await query
            .OrderBy(c => c.StartsAt)
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

        var concerts = rows.Select(r => new ConcertListItemDto
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

        return new VenueDetailDto
        {
            Id = venue.Id,
            Name = venue.Name,
            Address = venue.Address,
            CityId = venue.CityId,
            CityName = venue.CityName,
            CitySlug = venue.CitySlug,
            CityImageUrl = venue.CityImageUrl,
            MapSearchQuery = ConcertMapSearchQuery.Build(venue.Name, venue.Address, venue.CityName),
            Concerts = concerts
        };
    }
}

using Microsoft.EntityFrameworkCore;
using RuRave.Application.Cities;
using RuRave.Application.Concerts;
using RuRave.Application.Exceptions;
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
                Slug = c.Slug,
                ImageUrl = c.ImageUrl
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CityAfishaSummaryDto>> GetAfishaSummaryAsync(
        DateOnly dateFrom,
        DateOnly dateTo,
        CancellationToken cancellationToken = default)
    {
        var cities = await db.Cities
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => new { c.Id, c.Name, c.Slug, c.ImageUrl, c.TimeZoneId })
            .ToListAsync(cancellationToken);

        var results = new List<CityAfishaSummaryDto>();

        foreach (var city in cities)
        {
            var stats = await GetCityConcertStatsAsync(
                city.Id,
                city.TimeZoneId,
                dateFrom,
                dateTo,
                cancellationToken);

            if (stats.ConcertCount == 0)
            {
                continue;
            }

            results.Add(new CityAfishaSummaryDto
            {
                Id = city.Id,
                Name = city.Name,
                Slug = city.Slug,
                ImageUrl = city.ImageUrl,
                ConcertCount = stats.ConcertCount,
                NextStartsAt = stats.NextStartsAt
            });
        }

        return results
            .OrderByDescending(c => c.ConcertCount)
            .ThenBy(c => c.Name)
            .ToList();
    }

    public async Task<CityDetailDto> GetCityBySlugAsync(
        string slug,
        DateOnly dateFrom,
        DateOnly dateTo,
        CancellationToken cancellationToken = default)
    {
        var normalizedSlug = slug.Trim();
        if (string.IsNullOrEmpty(normalizedSlug))
        {
            throw new CityBySlugNotFoundException(slug);
        }

        var city = await db.Cities
            .AsNoTracking()
            .Where(c => c.Slug == normalizedSlug)
            .Select(c => new { c.Id, c.Name, c.Slug, c.ImageUrl, c.TimeZoneId })
            .FirstOrDefaultAsync(cancellationToken);

        if (city is null)
        {
            throw new CityBySlugNotFoundException(normalizedSlug);
        }

        var stats = await GetCityConcertStatsAsync(
            city.Id,
            city.TimeZoneId,
            dateFrom,
            dateTo,
            cancellationToken);

        return new CityDetailDto
        {
            Id = city.Id,
            Name = city.Name,
            Slug = city.Slug,
            ImageUrl = city.ImageUrl,
            ConcertCount = stats.ConcertCount,
            NextStartsAt = stats.NextStartsAt
        };
    }

    private async Task<(int ConcertCount, DateTimeOffset? NextStartsAt)> GetCityConcertStatsAsync(
        int cityId,
        string timeZoneId,
        DateOnly dateFrom,
        DateOnly dateTo,
        CancellationToken cancellationToken)
    {
        var (rangeStart, rangeEndExclusive) = ConcertDateRange.ToBounds(
            timeZoneId,
            dateFrom,
            dateTo);

        var query = PublishedConcertQuery.ForCity(db.Concerts.AsNoTracking(), cityId);
        query = PublishedConcertQuery.InStartsAtRange(query, rangeStart, rangeEndExclusive);

        var concertCount = await query.CountAsync(cancellationToken);
        if (concertCount == 0)
        {
            return (0, null);
        }

        var nextStartsAt = await query.MinAsync(c => c.StartsAt, cancellationToken);
        return (concertCount, nextStartsAt);
    }
}

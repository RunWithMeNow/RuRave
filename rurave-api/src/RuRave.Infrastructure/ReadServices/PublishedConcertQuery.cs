using RuRave.Domain.Entities;
using RuRave.Domain.Enums;

namespace RuRave.Infrastructure.ReadServices;

internal static class PublishedConcertQuery
{
    public static IQueryable<Concert> ForCity(IQueryable<Concert> concerts, int cityId) =>
        concerts
            .Where(c => c.Venue.CityId == cityId)
            .Where(c => c.Status == ConcertStatus.Published)
            .Where(c => c.TicketCategories.Any(tc => tc.IsActive));

    public static IQueryable<Concert> ForVenue(IQueryable<Concert> concerts, int venueId) =>
        concerts
            .Where(c => c.VenueId == venueId)
            .Where(c => c.Status == ConcertStatus.Published)
            .Where(c => c.TicketCategories.Any(tc => tc.IsActive));

    public static IQueryable<Concert> InStartsAtRange(
        IQueryable<Concert> concerts,
        DateTimeOffset? rangeStart,
        DateTimeOffset? rangeEndExclusive)
    {
        if (rangeStart.HasValue)
        {
            concerts = concerts.Where(c => c.StartsAt >= rangeStart.Value);
        }

        if (rangeEndExclusive.HasValue)
        {
            concerts = concerts.Where(c => c.StartsAt < rangeEndExclusive.Value);
        }

        return concerts;
    }
}

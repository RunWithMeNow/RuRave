using RuRave.Domain.Entities;
using RuRave.Domain.Enums;
using RuRave.Infrastructure.Persistence;

namespace RuRave.Tests.Infrastructure;

public static class TestDatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        var cities = new[]
        {
            new City { Name = "Москва", Slug = "moskva", TimeZoneId = "Europe/Moscow" },
            new City { Name = "Санкт-Петербург", Slug = "sankt-peterburg", TimeZoneId = "Europe/Moscow" },
            new City { Name = "Новосибирск", Slug = "novosibirsk", TimeZoneId = "Asia/Novosibirsk" },
            new City { Name = "Казань", Slug = "kazan", TimeZoneId = "Europe/Moscow" },
            new City { Name = "Екатеринбург", Slug = "ekaterinburg", TimeZoneId = "Asia/Yekaterinburg" }
        };
        db.Cities.AddRange(cities);
        await db.SaveChangesAsync();

        var moscow = cities[0];
        var spb = cities[1];

        var circus = new Venue { CityId = moscow.Id, Name = "Циркус", Address = "Цветной бульвар, 13, Москва" };
        var ermitage = new Venue { CityId = spb.Id, Name = "Эрмитаж", Address = "Дворцовая наб., 2, Санкт-Петербург" };
        db.Venues.AddRange(circus, ermitage);
        await db.SaveChangesAsync();

        var dk = new Artist { Name = "DK", Slug = "dk" };
        var guest = new Artist { Name = "Guest", Slug = "guest" };
        var lida = new Artist { Name = "Lida", Slug = "lida" };
        db.Artists.AddRange(dk, guest, lida);
        await db.SaveChangesAsync();

        var festival = new Concert
        {
            Title = "Festival Night",
            Slug = "festival-night-moscow",
            StartsAt = new DateTimeOffset(2026, 8, 30, 18, 0, 0, TimeSpan.FromHours(3)),
            VenueId = circus.Id,
            ImageUrl = "https://example.com/festival.jpg",
            Description = "Ночной рейв-фестиваль с двумя хедлайнерами. Свет, бас и визуал на большой сцене.",
            Status = ConcertStatus.Published
        };
        var draft = new Concert
        {
            Title = "Draft Show",
            Slug = "draft-show",
            StartsAt = new DateTimeOffset(2026, 9, 1, 20, 0, 0, TimeSpan.FromHours(3)),
            VenueId = circus.Id,
            ImageUrl = "https://example.com/draft.jpg",
            Description = "Черновик — не публикуется в афише.",
            Status = ConcertStatus.Draft
        };
        var noTickets = new Concert
        {
            Title = "No Tickets Show",
            Slug = "no-tickets",
            StartsAt = new DateTimeOffset(2026, 9, 2, 20, 0, 0, TimeSpan.FromHours(3)),
            VenueId = circus.Id,
            ImageUrl = "https://example.com/no-tickets.jpg",
            Description = "Концерт без активных категорий билетов.",
            Status = ConcertStatus.Published
        };
        var lidaShow = new Concert
        {
            Title = "LidaSuperStar",
            Slug = "lida-spb",
            StartsAt = new DateTimeOffset(2026, 7, 17, 19, 30, 0, TimeSpan.FromHours(3)),
            VenueId = ermitage.Id,
            ImageUrl = "https://example.com/lida.jpg",
            Description = "Сольный концерт Lida в Санкт-Петербурге. Поддержка живого бэнд-сета.",
            Status = ConcertStatus.Published
        };

        db.Concerts.AddRange(festival, draft, noTickets, lidaShow);
        await db.SaveChangesAsync();

        db.ConcertArtists.AddRange(
            new ConcertArtist { ConcertId = festival.Id, ArtistId = dk.Id, DisplayOrder = 0, IsHeadliner = true },
            new ConcertArtist { ConcertId = festival.Id, ArtistId = guest.Id, DisplayOrder = 1, IsHeadliner = false },
            new ConcertArtist { ConcertId = draft.Id, ArtistId = dk.Id, DisplayOrder = 0, IsHeadliner = true },
            new ConcertArtist { ConcertId = lidaShow.Id, ArtistId = lida.Id, DisplayOrder = 0, IsHeadliner = true });

        db.TicketCategories.AddRange(
            new TicketCategory { ConcertId = festival.Id, Name = "Танцпол", Price = 3000m, SortOrder = 1, IsActive = true },
            new TicketCategory { ConcertId = festival.Id, Name = "Партер", Price = 5000m, SortOrder = 2, IsActive = true },
            new TicketCategory { ConcertId = festival.Id, Name = "Backstage", Price = 10000m, SortOrder = 3, IsActive = false },
            new TicketCategory { ConcertId = lidaShow.Id, Name = "Стандарт", Price = 3000m, SortOrder = 1, IsActive = true },
            new TicketCategory { ConcertId = noTickets.Id, Name = "Inactive", Price = 1000m, SortOrder = 1, IsActive = false });

        await db.SaveChangesAsync();
    }
}

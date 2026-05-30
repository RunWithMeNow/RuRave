using Microsoft.Extensions.DependencyInjection;
using RuRave.Application.Cities;
using RuRave.Application.Concerts;
using RuRave.Tests.Infrastructure;

namespace RuRave.Tests;

[Collection(SqlServerCollection.Name)]
public class ReadServicesTests(SqlServerTestFixture fixture)
{
    private ICityReadService Cities => fixture.Services.GetRequiredService<ICityReadService>();

    private IConcertReadService Concerts => fixture.Services.GetRequiredService<IConcertReadService>();

    [Fact]
    public async Task GetCities_ReturnsFiveCities()
    {
        var cities = await Cities.GetCitiesAsync();

        Assert.Equal(5, cities.Count);
        Assert.Equal(
            ["Екатеринбург", "Казань", "Москва", "Новосибирск", "Санкт-Петербург"],
            cities.Select(c => c.Name).ToArray());
    }

    [Fact]
    public async Task GetConcerts_ByCityId_ReturnsOnlyThatCity()
    {
        var allCities = await Cities.GetCitiesAsync();
        var moscowId = allCities.Single(c => c.Slug == "moskva").Id;
        var spbId = allCities.Single(c => c.Slug == "sankt-peterburg").Id;

        var moscow = await Concerts.GetConcertsAsync(new GetConcertsRequest { CityId = moscowId });
        var spb = await Concerts.GetConcertsAsync(new GetConcertsRequest { CityId = spbId });

        Assert.Single(moscow.Items);
        Assert.Equal("Festival Night", moscow.Items[0].Title);
        Assert.Equal("Циркус", moscow.Items[0].Place);

        Assert.Single(spb.Items);
        Assert.Equal("LidaSuperStar", spb.Items[0].Title);
        Assert.Equal("Эрмитаж", spb.Items[0].Place);
    }

    [Fact]
    public async Task GetConcerts_SearchByArtistName()
    {
        var moscowId = (await Cities.GetCitiesAsync()).Single(c => c.Slug == "moskva").Id;
        var spbId = (await Cities.GetCitiesAsync()).Single(c => c.Slug == "sankt-peterburg").Id;

        var moscowLida = await Concerts.GetConcertsAsync(new GetConcertsRequest
        {
            CityId = moscowId,
            Search = "lida"
        });

        var spbLida = await Concerts.GetConcertsAsync(new GetConcertsRequest
        {
            CityId = spbId,
            Search = "Lida"
        });

        Assert.Empty(moscowLida.Items);
        Assert.Single(spbLida.Items);
        Assert.Equal("LidaSuperStar", spbLida.Items[0].Title);
    }

    [Fact]
    public async Task GetConcerts_ExcludesDraft()
    {
        var moscowId = (await Cities.GetCitiesAsync()).Single(c => c.Slug == "moskva").Id;

        var result = await Concerts.GetConcertsAsync(new GetConcertsRequest { CityId = moscowId });

        Assert.DoesNotContain(result.Items, c => c.Title == "Draft Show");
    }

    [Fact]
    public async Task GetConcerts_MinPrice_IsMinimumOfActiveCategories()
    {
        var moscowId = (await Cities.GetCitiesAsync()).Single(c => c.Slug == "moskva").Id;

        var result = await Concerts.GetConcertsAsync(new GetConcertsRequest { CityId = moscowId });

        var festival = Assert.Single(result.Items);
        Assert.Equal(3000m, festival.MinPrice);
    }

    [Fact]
    public async Task GetConcerts_TwoArtists_JoinedInArtistDisplay()
    {
        var moscowId = (await Cities.GetCitiesAsync()).Single(c => c.Slug == "moskva").Id;

        var result = await Concerts.GetConcertsAsync(new GetConcertsRequest { CityId = moscowId });

        var festival = Assert.Single(result.Items);
        Assert.Equal(["DK", "Guest"], festival.Artists);
        Assert.Equal("DK, Guest", festival.ArtistDisplay);
    }

    [Fact]
    public async Task GetConcerts_ExcludesConcertsWithoutActiveTicketCategories()
    {
        var moscowId = (await Cities.GetCitiesAsync()).Single(c => c.Slug == "moskva").Id;

        var result = await Concerts.GetConcertsAsync(new GetConcertsRequest { CityId = moscowId });

        Assert.DoesNotContain(result.Items, c => c.Title == "No Tickets Show");
    }

    [Fact]
    public async Task GetConcerts_DateRange_FiltersByLocalDay()
    {
        var moscowId = (await Cities.GetCitiesAsync()).Single(c => c.Slug == "moskva").Id;

        var inRange = await Concerts.GetConcertsAsync(new GetConcertsRequest
        {
            CityId = moscowId,
            DateFrom = new DateOnly(2026, 8, 1),
            DateTo = new DateOnly(2026, 8, 31)
        });

        Assert.Single(inRange.Items);
        Assert.Equal("Festival Night", inRange.Items[0].Title);

        var outOfRange = await Concerts.GetConcertsAsync(new GetConcertsRequest
        {
            CityId = moscowId,
            DateFrom = new DateOnly(2026, 9, 1),
            DateTo = new DateOnly(2026, 9, 30)
        });

        Assert.Empty(outOfRange.Items);
    }

    [Fact]
    public async Task GetConcerts_DateRange_RequiresBothBounds()
    {
        var moscowId = (await Cities.GetCitiesAsync()).Single(c => c.Slug == "moskva").Id;

        await Assert.ThrowsAsync<RuRave.Application.Exceptions.InvalidQueryException>(() =>
            Concerts.GetConcertsAsync(new GetConcertsRequest
            {
                CityId = moscowId,
                DateFrom = new DateOnly(2026, 8, 1)
            }));
    }

    [Fact]
    public async Task GetConcertDates_ReturnsLocalConcertDays()
    {
        var moscowId = (await Cities.GetCitiesAsync()).Single(c => c.Slug == "moskva").Id;
        var spbId = (await Cities.GetCitiesAsync()).Single(c => c.Slug == "sankt-peterburg").Id;

        var moscowDates = await Concerts.GetConcertDatesAsync(new GetConcertDatesRequest
        {
            CityId = moscowId,
            From = new DateOnly(2026, 1, 1),
            To = new DateOnly(2026, 12, 31)
        });

        Assert.Equal(["2026-08-30"], moscowDates.Dates);

        var spbDates = await Concerts.GetConcertDatesAsync(new GetConcertDatesRequest
        {
            CityId = spbId,
            From = new DateOnly(2026, 1, 1),
            To = new DateOnly(2026, 12, 31)
        });

        Assert.Equal(["2026-07-17"], spbDates.Dates);
    }

    [Fact]
    public async Task GetConcertById_ReturnsDetail()
    {
        var moscowId = (await Cities.GetCitiesAsync()).Single(c => c.Slug == "moskva").Id;
        var list = await Concerts.GetConcertsAsync(new GetConcertsRequest { CityId = moscowId });
        var concertId = list.Items[0].Id;

        var detail = await Concerts.GetConcertByIdAsync(concertId);

        Assert.Equal("Festival Night", detail.Title);
        Assert.Equal("Циркус", detail.Place);
        Assert.Equal(moscowId, detail.CityId);
        Assert.Equal("Москва", detail.CityName);
        Assert.Equal(3000m, detail.MinPrice);
        Assert.Equal(2, detail.TicketCategories.Count);
        Assert.DoesNotContain(detail.TicketCategories, tc => tc.Name == "Backstage");
        Assert.Contains("рейв", detail.Description, StringComparison.OrdinalIgnoreCase);
        Assert.Equal("Цветной бульвар, 13, Москва", detail.VenueAddress);
        Assert.Equal("Цветной бульвар, 13, Москва", detail.MapSearchQuery);
    }

    [Fact]
    public async Task GetConcertById_NotFound_Throws()
    {
        await Assert.ThrowsAsync<RuRave.Application.Exceptions.ConcertNotFoundException>(
            () => Concerts.GetConcertByIdAsync(99999));
    }

    [Fact]
    public async Task GetConcertById_ExcludesDraft()
    {
        var moscowId = (await Cities.GetCitiesAsync()).Single(c => c.Slug == "moskva").Id;
        var list = await Concerts.GetConcertsAsync(new GetConcertsRequest { CityId = moscowId });
        var publishedId = Assert.Single(list.Items).Id;

        // Seeder order: festival, draft, noTickets, lidaShow — draft is publishedId + 1
        var draftId = publishedId + 1;

        await Assert.ThrowsAsync<RuRave.Application.Exceptions.ConcertNotFoundException>(
            () => Concerts.GetConcertByIdAsync(draftId));
    }

    [Fact]
    public async Task GetConcertById_ExcludesConcertsWithoutActiveTicketCategories()
    {
        var moscowId = (await Cities.GetCitiesAsync()).Single(c => c.Slug == "moskva").Id;
        var publishedId = (await Concerts.GetConcertsAsync(new GetConcertsRequest { CityId = moscowId }))
            .Items[0].Id;

        var noTicketsId = publishedId + 2;

        await Assert.ThrowsAsync<RuRave.Application.Exceptions.ConcertNotFoundException>(
            () => Concerts.GetConcertByIdAsync(noTicketsId));
    }
}

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
}

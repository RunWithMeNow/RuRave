using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using RuRave.Application.Cities;
using RuRave.Application.Common;
using RuRave.Application.Concerts;
using RuRave.Tests.Infrastructure;

namespace RuRave.Tests;

[Collection(ApiCollection.Name)]
public class ApiEndpointTests(ApiWebApplicationFactory factory)
{
    private readonly HttpClient _client = factory.CreateClient();

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    [Fact]
    public async Task GetCities_ReturnsOkWithFiveCities()
    {
        var response = await _client.GetAsync("/api/cities");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var cities = await response.Content.ReadFromJsonAsync<List<CityListItemDto>>(JsonOptions);
        Assert.NotNull(cities);
        Assert.Equal(5, cities.Count);
    }

    [Fact]
    public async Task GetConcerts_WithoutCityId_Returns400()
    {
        var response = await _client.GetAsync("/api/concerts");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetConcerts_WithCityId_ReturnsOkWithItems()
    {
        var citiesResponse = await _client.GetAsync("/api/cities");
        var cities = await citiesResponse.Content.ReadFromJsonAsync<List<CityListItemDto>>(JsonOptions);
        var moscowId = cities!.Single(c => c.Slug == "moskva").Id;

        var response = await _client.GetAsync($"/api/concerts?cityId={moscowId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var page = await response.Content.ReadFromJsonAsync<PagedResultDto<ConcertListItemDto>>(JsonOptions);
        Assert.NotNull(page);
        Assert.Single(page.Items);
        Assert.Equal("Festival Night", page.Items[0].Title);
        Assert.Equal(3000m, page.Items[0].MinPrice);
        Assert.Equal("DK, Guest", page.Items[0].ArtistDisplay);
    }

    [Fact]
    public async Task GetConcerts_CityNotFound_Returns404()
    {
        var response = await _client.GetAsync("/api/concerts?cityId=99999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetConcerts_SearchByArtist_ReturnsFilteredItems()
    {
        var cities = await (await _client.GetAsync("/api/cities"))
            .Content.ReadFromJsonAsync<List<CityListItemDto>>(JsonOptions);
        var spbId = cities!.Single(c => c.Slug == "sankt-peterburg").Id;

        var response = await _client.GetAsync($"/api/concerts?cityId={spbId}&search=lida");

        var page = await response.Content.ReadFromJsonAsync<PagedResultDto<ConcertListItemDto>>(JsonOptions);
        Assert.NotNull(page);
        Assert.Single(page.Items);
        Assert.Equal("LidaSuperStar", page.Items[0].Title);
    }
}

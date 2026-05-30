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
    public async Task GetConcerts_QueryDateFromTo_FiltersByHttpQueryString()
    {
        var cities = await (await _client.GetAsync("/api/cities"))
            .Content.ReadFromJsonAsync<List<CityListItemDto>>(JsonOptions);
        var moscowId = cities!.Single(c => c.Slug == "moskva").Id;

        var inRange = await _client.GetAsync(
            $"/api/concerts?cityId={moscowId}&dateFrom=2026-08-01&dateTo=2026-08-31");
        Assert.Equal(HttpStatusCode.OK, inRange.StatusCode);
        var august = await inRange.Content.ReadFromJsonAsync<PagedResultDto<ConcertListItemDto>>(JsonOptions);
        Assert.NotNull(august);
        Assert.Single(august!.Items);

        var outOfRange = await _client.GetAsync(
            $"/api/concerts?cityId={moscowId}&dateFrom=2026-09-01&dateTo=2026-09-30");
        Assert.Equal(HttpStatusCode.OK, outOfRange.StatusCode);
        var september = await outOfRange.Content.ReadFromJsonAsync<PagedResultDto<ConcertListItemDto>>(JsonOptions);
        Assert.NotNull(september);
        Assert.Empty(september!.Items);
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

    [Fact]
    public async Task GetConcertById_ReturnsOkWithDetail()
    {
        var cities = await (await _client.GetAsync("/api/cities"))
            .Content.ReadFromJsonAsync<List<CityListItemDto>>(JsonOptions);
        var moscowId = cities!.Single(c => c.Slug == "moskva").Id;

        var listResponse = await _client.GetAsync($"/api/concerts?cityId={moscowId}");
        var page = await listResponse.Content.ReadFromJsonAsync<PagedResultDto<ConcertListItemDto>>(JsonOptions);
        var concertId = page!.Items[0].Id;

        var response = await _client.GetAsync($"/api/concerts/{concertId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var detail = await response.Content.ReadFromJsonAsync<ConcertDetailDto>(JsonOptions);
        Assert.NotNull(detail);
        Assert.Equal("Festival Night", detail.Title);
        Assert.Equal(2, detail.TicketCategories.Count);
        Assert.False(string.IsNullOrWhiteSpace(detail.Description));
        Assert.False(string.IsNullOrWhiteSpace(detail.MapSearchQuery));
        Assert.Contains("Москва", detail.MapSearchQuery);
    }

    [Fact]
    public async Task GetConcertById_NotFound_Returns404()
    {
        var response = await _client.GetAsync("/api/concerts/99999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetConcertById_Draft_Returns404()
    {
        var cities = await (await _client.GetAsync("/api/cities"))
            .Content.ReadFromJsonAsync<List<CityListItemDto>>(JsonOptions);
        var moscowId = cities!.Single(c => c.Slug == "moskva").Id;
        var page = await (await _client.GetAsync($"/api/concerts?cityId={moscowId}"))
            .Content.ReadFromJsonAsync<PagedResultDto<ConcertListItemDto>>(JsonOptions);
        var draftId = page!.Items[0].Id + 1;

        var response = await _client.GetAsync($"/api/concerts/{draftId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}

using RuRave.Application.Concerts;

namespace RuRave.Tests;

public class ConcertMapSearchQueryTests
{
    [Fact]
    public void Build_ReturnsFullVenueAddressWithCity()
    {
        var result = ConcertMapSearchQuery.Build(
            "Циркус",
            "Цветной бульвар, 13, Москва",
            "Москва");

        Assert.Equal("Цветной бульвар, 13, Москва", result);
    }

    [Fact]
    public void Build_RemovesDuplicateCityPrefix_WhenCityRepeatedAtBothEnds()
    {
        var result = ConcertMapSearchQuery.Build(
            "Циркус",
            "Москва, Цветной бульвар, 13, Москва",
            "Москва");

        Assert.Equal("Цветной бульвар, 13, Москва", result);
    }

    [Fact]
    public void Build_FallsBackToPlace_WhenAddressMissing()
    {
        Assert.Equal("Циркус", ConcertMapSearchQuery.Build("Циркус", null, "Москва"));
    }
}

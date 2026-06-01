using RuRave.Application.Concerts;

namespace RuRave.Application.Venues;

public class VenueDetailDto
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Address { get; set; }

    public int CityId { get; set; }

    public string CityName { get; set; } = null!;

    public string CitySlug { get; set; } = null!;

    public string? CityImageUrl { get; set; }

    public string MapSearchQuery { get; set; } = null!;

    public IReadOnlyList<ConcertListItemDto> Concerts { get; set; } = [];
}

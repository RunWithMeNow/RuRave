namespace RuRave.Application.Venues;

public class VenueListItemDto
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Address { get; set; }

    public int CityId { get; set; }

    public string CityName { get; set; } = null!;

    public int ConcertCount { get; set; }

    public DateTimeOffset? NextStartsAt { get; set; }
}

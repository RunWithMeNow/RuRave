namespace RuRave.Application.Cities;

public class CityAfishaSummaryDto
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string? ImageUrl { get; set; }

    public int ConcertCount { get; set; }

    public DateTimeOffset? NextStartsAt { get; set; }
}

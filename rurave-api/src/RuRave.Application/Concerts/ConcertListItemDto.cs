namespace RuRave.Application.Concerts;

public class ConcertListItemDto
{
    public int Id { get; set; }

    public string ImageUrl { get; set; } = null!;

    public string Title { get; set; } = null!;

    public DateTimeOffset StartsAt { get; set; }

    public string Place { get; set; } = null!;

    public IReadOnlyList<string> Artists { get; set; } = [];

    public string ArtistDisplay { get; set; } = null!;

    public decimal MinPrice { get; set; }
}

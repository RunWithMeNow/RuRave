namespace RuRave.Application.Concerts;

public class ConcertDetailDto
{
    public int Id { get; set; }

    public string ImageUrl { get; set; } = null!;

    public string Title { get; set; } = null!;

    public string Description { get; set; } = null!;

    public DateTimeOffset StartsAt { get; set; }

    public string Place { get; set; } = null!;

    public string? VenueAddress { get; set; }

    public string MapSearchQuery { get; set; } = null!;

    public int CityId { get; set; }

    public string CityName { get; set; } = null!;

    public IReadOnlyList<string> Artists { get; set; } = [];

    public string ArtistDisplay { get; set; } = null!;

    public decimal MinPrice { get; set; }

    public IReadOnlyList<TicketCategoryItemDto> TicketCategories { get; set; } = [];
}

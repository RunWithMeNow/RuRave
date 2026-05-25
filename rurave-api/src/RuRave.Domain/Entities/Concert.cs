using RuRave.Domain.Enums;

namespace RuRave.Domain.Entities;

public class Concert
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public DateTimeOffset StartsAt { get; set; }

    public int VenueId { get; set; }

    public string ImageUrl { get; set; } = null!;

    public ConcertStatus Status { get; set; }

    public Venue Venue { get; set; } = null!;

    public ICollection<ConcertArtist> ConcertArtists { get; set; } = [];

    public ICollection<TicketCategory> TicketCategories { get; set; } = [];
}

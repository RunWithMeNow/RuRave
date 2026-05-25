namespace RuRave.Domain.Entities;

public class ConcertArtist
{
    public int ConcertId { get; set; }

    public int ArtistId { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsHeadliner { get; set; }

    public Concert Concert { get; set; } = null!;

    public Artist Artist { get; set; } = null!;
}

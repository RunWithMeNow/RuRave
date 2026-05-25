namespace RuRave.Domain.Entities;

public class Artist
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public ICollection<ConcertArtist> ConcertArtists { get; set; } = [];
}

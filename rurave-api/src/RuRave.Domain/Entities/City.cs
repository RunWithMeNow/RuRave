namespace RuRave.Domain.Entities;

public class City
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string TimeZoneId { get; set; } = null!;

    public ICollection<Venue> Venues { get; set; } = [];
}

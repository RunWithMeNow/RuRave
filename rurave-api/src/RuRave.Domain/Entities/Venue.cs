namespace RuRave.Domain.Entities;

public class Venue
{
    public int Id { get; set; }

    public int CityId { get; set; }

    public string Name { get; set; } = null!;

    public string? Address { get; set; }

    public City City { get; set; } = null!;

    public ICollection<Concert> Concerts { get; set; } = [];
}

namespace RuRave.Domain.Entities;

public class TicketCategory
{
    public int Id { get; set; }

    public int ConcertId { get; set; }

    public string Name { get; set; } = null!;

    public decimal Price { get; set; }

    public int SortOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public Concert Concert { get; set; } = null!;
}

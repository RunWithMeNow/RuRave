namespace RuRave.Application.Concerts;

public class TicketCategoryItemDto
{
    public string Name { get; set; } = null!;

    public decimal Price { get; set; }

    public int SortOrder { get; set; }
}

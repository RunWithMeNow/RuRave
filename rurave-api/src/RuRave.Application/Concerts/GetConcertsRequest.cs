namespace RuRave.Application.Concerts;

public class GetConcertsRequest
{
    public int CityId { get; set; }

    public string? Search { get; set; }

    public DateOnly? DateFrom { get; set; }

    public DateOnly? DateTo { get; set; }

    public int Page { get; set; } = 1;

    public int PageSize { get; set; } = 20;
}

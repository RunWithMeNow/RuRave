namespace RuRave.Application.Concerts;

public class GetConcertDatesRequest
{
    public int CityId { get; set; }

    public DateOnly From { get; set; }

    public DateOnly To { get; set; }

    public string? Search { get; set; }
}

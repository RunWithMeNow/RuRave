using RuRave.Application.Exceptions;

namespace RuRave.Application.Concerts;

public static class ConcertQueryValidator
{
    public const int MaxPageSize = 50;

    public static void Validate(GetConcertsRequest request)
    {
        if (request.CityId <= 0)
        {
            throw new InvalidQueryException("CityId must be greater than zero.");
        }

        if (request.Page < 1)
        {
            throw new InvalidQueryException("Page must be at least 1.");
        }

        if (request.PageSize is < 1 or > MaxPageSize)
        {
            throw new InvalidQueryException($"PageSize must be between 1 and {MaxPageSize}.");
        }

        ConcertDateRange.Validate(request.DateFrom, request.DateTo);
    }

    public static void ValidateDatesRequest(GetConcertDatesRequest request)
    {
        if (request.CityId <= 0)
        {
            throw new InvalidQueryException("CityId must be greater than zero.");
        }

        if (request.From > request.To)
        {
            throw new InvalidQueryException("'from' must be less than or equal to 'to'.");
        }

        var spanDays = request.To.DayNumber - request.From.DayNumber;
        if (spanDays > ConcertDateRange.MaxRangeDays)
        {
            throw new InvalidQueryException($"Date range must not exceed {ConcertDateRange.MaxRangeDays} days.");
        }
    }
}

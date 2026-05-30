using System.Globalization;
using RuRave.Application.Exceptions;

namespace RuRave.Application.Concerts;

public static class ConcertQueryDates
{
    public static (DateOnly? DateFrom, DateOnly? DateTo) ParseRange(string? dateFrom, string? dateTo)
    {
        var from = ParseOptional(dateFrom, "dateFrom");
        var to = ParseOptional(dateTo, "dateTo");
        ConcertDateRange.Validate(from, to);
        return (from, to);
    }

    public static (DateOnly From, DateOnly To) ParseRequiredWindow(string? from, string? to)
    {
        var fromDate = ParseOptional(from, "from")
            ?? throw new InvalidQueryException("Query parameter 'from' is required.");
        var toDate = ParseOptional(to, "to")
            ?? throw new InvalidQueryException("Query parameter 'to' is required.");

        if (fromDate > toDate)
        {
            throw new InvalidQueryException("'from' must be less than or equal to 'to'.");
        }

        var spanDays = toDate.DayNumber - fromDate.DayNumber;
        if (spanDays > ConcertDateRange.MaxRangeDays)
        {
            throw new InvalidQueryException($"Date range must not exceed {ConcertDateRange.MaxRangeDays} days.");
        }

        return (fromDate, toDate);
    }

    private static DateOnly? ParseOptional(string? value, string paramName)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        if (DateOnly.TryParse(value.Trim(), CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed))
        {
            return parsed;
        }

        throw new InvalidQueryException(
            $"Query parameter '{paramName}' must be a date in YYYY-MM-DD format.");
    }
}

using RuRave.Application.Exceptions;

namespace RuRave.Application.Concerts;

public static class ConcertDateRange
{
    // Диапазон «сегодня + 1 год» и выбор пользователя в календаре.
    public const int MaxRangeDays = 370;

    public static void Validate(DateOnly? dateFrom, DateOnly? dateTo)
    {
        if (dateFrom is null && dateTo is null)
        {
            return;
        }

        if (dateFrom is null || dateTo is null)
        {
            throw new InvalidQueryException("Both dateFrom and dateTo are required when filtering by date.");
        }

        if (dateFrom.Value > dateTo.Value)
        {
            throw new InvalidQueryException("dateFrom must be less than or equal to dateTo.");
        }

        var spanDays = dateTo.Value.DayNumber - dateFrom.Value.DayNumber;
        if (spanDays > MaxRangeDays)
        {
            throw new InvalidQueryException($"Date range must not exceed {MaxRangeDays} days.");
        }
    }

    public static (DateTimeOffset? RangeStart, DateTimeOffset? RangeEndExclusive) ToBounds(
        string timeZoneId,
        DateOnly? dateFrom,
        DateOnly? dateTo)
    {
        if (dateFrom is null && dateTo is null)
        {
            return (null, null);
        }

        var timeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
        DateTimeOffset? rangeStart = null;
        DateTimeOffset? rangeEndExclusive = null;

        if (dateFrom.HasValue)
        {
            var localStart = dateFrom.Value.ToDateTime(TimeOnly.MinValue);
            rangeStart = new DateTimeOffset(localStart, timeZone.GetUtcOffset(localStart));
        }

        if (dateTo.HasValue)
        {
            var localEndExclusive = dateTo.Value.AddDays(1).ToDateTime(TimeOnly.MinValue);
            rangeEndExclusive = new DateTimeOffset(localEndExclusive, timeZone.GetUtcOffset(localEndExclusive));
        }

        return (rangeStart, rangeEndExclusive);
    }

    public static DateOnly ToLocalDate(DateTimeOffset startsAt, string timeZoneId)
    {
        var timeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
        var local = TimeZoneInfo.ConvertTime(startsAt, timeZone);
        return DateOnly.FromDateTime(local.DateTime);
    }
}

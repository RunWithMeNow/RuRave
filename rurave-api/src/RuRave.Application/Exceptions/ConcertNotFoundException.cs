namespace RuRave.Application.Exceptions;

public class ConcertNotFoundException(int concertId)
    : Exception($"Concert with id {concertId} was not found.")
{
    public int ConcertId { get; } = concertId;
}

namespace RuRave.Application.Exceptions;

public class VenueNotFoundException(int venueId)
    : Exception($"Venue with id {venueId} was not found.")
{
    public int VenueId { get; } = venueId;
}

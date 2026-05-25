namespace RuRave.Application.Exceptions;

public class CityNotFoundException(int cityId)
    : Exception($"City with id {cityId} was not found.")
{
    public int CityId { get; } = cityId;
}

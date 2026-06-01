namespace RuRave.Application.Exceptions;

public class CityBySlugNotFoundException(string slug)
    : Exception($"City with slug '{slug}' was not found.")
{
    public string Slug { get; } = slug;
}

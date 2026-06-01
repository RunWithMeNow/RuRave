namespace RuRave.Application.Cities;

public static class CityImagePaths
{
    public const string DefaultRelativePath = "/cities/default.svg";

    /// <summary>
    /// Относительный путь к статике фронтенда: /cities/{slug}.svg
    /// </summary>
    public static string ForSlug(string slug) => $"/cities/{slug}.svg";
}

namespace RuRave.Application.Concerts;

public static class ConcertMapSearchQuery
{
    /// <summary>
    /// Строка для Nominatim/OSM: только адрес площадки (улица и дом), без отдельного города в начале.
    /// </summary>
    public static string Build(string place, string? venueAddress)
    {
        if (!string.IsNullOrWhiteSpace(venueAddress))
        {
            return venueAddress.Trim();
        }

        return place.Trim();
    }
}

namespace RuRave.Application.Concerts;

public static class ConcertMapSearchQuery
{
    /// <summary>
    /// Строка для Nominatim/OSM: адрес площадки как в БД (улица, дом, город).
    /// Город в начало не добавляется — только убирается лишний префикс «Город, …, Город».
    /// </summary>
    public static string Build(string place, string? venueAddress, string? cityName = null)
    {
        if (!string.IsNullOrWhiteSpace(venueAddress))
        {
            return WithoutDuplicateCityPrefix(venueAddress.Trim(), cityName);
        }

        return place.Trim();
    }

    /// <summary>
    /// «Москва, Цветной бульвар, 13, Москва» → «Цветной бульвар, 13, Москва».
    /// </summary>
    private static string WithoutDuplicateCityPrefix(string address, string? cityName)
    {
        var city = cityName?.Trim();
        if (string.IsNullOrEmpty(city))
        {
            return address;
        }

        var prefix = $"{city}, ";
        if (!address.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
        {
            return address;
        }

        var suffix = $", {city}";
        if (address.EndsWith(suffix, StringComparison.OrdinalIgnoreCase)
            && address.Length > prefix.Length + suffix.Length)
        {
            return address[prefix.Length..].TrimStart();
        }

        return address;
    }
}

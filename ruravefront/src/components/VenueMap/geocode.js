const CACHE_PREFIX = 'rurave-geocode:';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

const getUserAgent = () =>
    import.meta.env.VITE_APP_USER_AGENT?.trim() ||
    'RuRave/1.0 (student project; https://github.com/rurave)';

export async function geocodeAddress(mapSearchQuery) {
    const query = mapSearchQuery?.trim();
    if (!query) {
        return null;
    }

    const cacheKey = CACHE_PREFIX + query;
    try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (typeof parsed.lat === 'number' && typeof parsed.lon === 'number') {
                return parsed;
            }
        }
    } catch {
        // ignore corrupt cache
    }

    const url = new URL(NOMINATIM_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('accept-language', 'ru');

    const response = await fetch(url.toString(), {
        headers: {
            'Accept': 'application/json',
            'User-Agent': getUserAgent(),
        },
    });

    if (!response.ok) {
        throw new Error(`Геокодер вернул ${response.status}`);
    }

    const results = await response.json();
    if (!Array.isArray(results) || results.length === 0) {
        return null;
    }

    const lat = Number.parseFloat(results[0].lat);
    const lon = Number.parseFloat(results[0].lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return null;
    }

    const coords = { lat, lon };

    try {
        sessionStorage.setItem(cacheKey, JSON.stringify(coords));
    } catch {
        // quota exceeded — ignore
    }

    return coords;
}

export function openStreetMapSearchUrl(mapSearchQuery) {
    const url = new URL('https://www.openstreetmap.org/search');
    url.searchParams.set('query', mapSearchQuery);
    return url.toString();
}

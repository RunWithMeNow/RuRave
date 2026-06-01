const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';

function getBaseUrl() {
    if (envBaseUrl) return envBaseUrl;
    if (typeof window !== 'undefined') return window.location.origin;
    return '';
}

function buildUrl(path, params) {
    const baseUrl = getBaseUrl();
    const url = new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                url.searchParams.set(key, String(value));
            }
        });
    }
    return url.toString();
}

async function request(path, params) {
    if (!getBaseUrl()) {
        throw new Error('VITE_API_BASE_URL не задан. Скопируйте .env.example в .env');
    }

    const response = await fetch(buildUrl(path, params));

    if (!response.ok) {
        let message = `Ошибка ${response.status}`;
        try {
            const problem = await response.json();
            message = problem.detail || problem.title || message;
        } catch {
            // ignore parse errors
        }
        throw new Error(message);
    }

    return response.json();
}

export async function getCities() {
    return request('/api/cities');
}

export async function getConcerts({
    cityId,
    search,
    dateFrom,
    dateTo,
    page = 1,
    pageSize = 12,
}) {
    return request('/api/concerts', {
        cityId,
        search: search?.trim() || undefined,
        dateFrom,
        dateTo,
        page,
        pageSize,
    });
}

export async function getConcertDates({ cityId, from, to, search }) {
    return request('/api/concerts/dates', {
        cityId,
        from,
        to,
        search: search?.trim() || undefined,
    });
}

export async function getConcertById(id) {
    return request(`/api/concerts/${id}`);
}

export async function getCitiesAfishaSummary({ dateFrom, dateTo }) {
    return request('/api/cities/afisha-summary', { dateFrom, dateTo });
}

export async function getCityBySlug(slug, { dateFrom, dateTo }) {
    return request(`/api/cities/${encodeURIComponent(slug)}`, { dateFrom, dateTo });
}

export async function getVenues({ cityId, dateFrom, dateTo }) {
    return request('/api/venues', { cityId, dateFrom, dateTo });
}

export async function getVenueById(id, { dateFrom, dateTo }) {
    return request(`/api/venues/${id}`, { dateFrom, dateTo });
}

export function mapConcertDetailToView(concert) {
    const startsAt = new Date(concert.startsAt);
    const dateTime = startsAt.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return {
        id: concert.id,
        imgsrc: concert.imageUrl,
        title: concert.title,
        description: concert.description?.trim() ?? '',
        dateTime,
        place: concert.place,
        venueAddress: concert.venueAddress?.trim() || '',
        mapSearchQuery: concert.mapSearchQuery?.trim() ?? '',
        cityName: concert.cityName,
        artist: concert.artistDisplay,
        artists: concert.artists ?? [],
        cost: concert.minPrice,
        ticketCategories: (concert.ticketCategories ?? []).map((tc) => ({
            name: tc.name,
            price: tc.price,
            sortOrder: tc.sortOrder,
        })),
    };
}

export function mapConcertToEventCard(concert) {
    const date = new Date(concert.startsAt).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    return {
        id: concert.id,
        imgsrc: concert.imageUrl,
        title: concert.title,
        startsAt: concert.startsAt,
        date,
        place: concert.place,
        artist: concert.artistDisplay,
        cost: concert.minPrice,
    };
}

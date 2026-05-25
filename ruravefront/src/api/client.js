const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';

function buildUrl(path, params) {
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
    if (!baseUrl) {
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

export async function getConcerts({ cityId, search, page = 1, pageSize = 20 }) {
    return request('/api/concerts', {
        cityId,
        search: search?.trim() || undefined,
        page,
        pageSize,
    });
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
        date,
        place: concert.place,
        artist: concert.artistDisplay,
        cost: concert.minPrice,
    };
}

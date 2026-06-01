export const CITY_IMAGE_FALLBACK = '/cities/default.svg';

export const resolveCityImageUrl = (imageUrl) => {
    const value = imageUrl?.trim();
    if (!value) {
        return CITY_IMAGE_FALLBACK;
    }
    return value;
};

export const buildCityPath = (slug, dateRange) => {
    const params = new URLSearchParams();
    if (dateRange?.from) {
        params.set('dateFrom', dateRange.from);
    }
    if (dateRange?.to) {
        params.set('dateTo', dateRange.to);
    }
    const query = params.toString();
    return query ? `/city/${slug}?${query}` : `/city/${slug}`;
};

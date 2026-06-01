export const buildVenuePath = (venueId, dateRange) => {
    const params = new URLSearchParams();
    if (dateRange?.from) {
        params.set('dateFrom', dateRange.from);
    }
    if (dateRange?.to) {
        params.set('dateTo', dateRange.to);
    }
    const query = params.toString();
    return query ? `/venue/${venueId}?${query}` : `/venue/${venueId}`;
};

export const parseVenueDateRange = (searchParams, fallbackRange) => {
    const from = searchParams.get('dateFrom');
    const to = searchParams.get('dateTo');
    if (from && to) {
        return { from, to };
    }
    return fallbackRange;
};

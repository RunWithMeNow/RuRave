import { concertDayKey, isConcertInDateRange } from './dateRange.js';

/** Поиск по названию, артисту и площадке (как на API: title + artist). */
export const filterConcertsBySearch = (items, term) => {
    const query = term.trim().toLowerCase();
    if (!query) {
        return items;
    }
    return items.filter(
        (concert) =>
            concert.title?.toLowerCase().includes(query) ||
            concert.artist?.toLowerCase().includes(query) ||
            concert.place?.toLowerCase().includes(query)
    );
};

export const filterConcertsByDateRange = (items, range) => {
    if (!range?.from || !range?.to) {
        return items;
    }
    return items.filter((concert) =>
        isConcertInDateRange(concert.startsAt, range.from, range.to)
    );
};

/** Единые фильтры списка: период + поиск (для режима без города / подстраховки). */
export const applyConcertFilters = (items, { search = '', range } = {}) => {
    let result = items;
    if (range?.from && range?.to) {
        result = filterConcertsByDateRange(result, range);
    }
    result = filterConcertsBySearch(result, search);
    return result;
};

export const collectConcertDates = (items) => {
    const dates = new Set();
    items.forEach((concert) => {
        const key = concertDayKey(concert.startsAt);
        if (key) {
            dates.add(key);
        }
    });
    return [...dates];
};

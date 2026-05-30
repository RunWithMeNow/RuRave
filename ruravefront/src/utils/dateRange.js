export const CONCERTS_PAGE_SIZE = 12;

export const toIsoDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const parseIsoDate = (iso) => {
    const [year, month, day] = iso.split('-').map(Number);
    return new Date(year, month - 1, day);
};

export const getDefaultDateRange = () => {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setFullYear(to.getFullYear() + 1);
    return { from: toIsoDate(from), to: toIsoDate(to) };
};

/** Нормализует диапазон: пустые значения заменяются дефолтом. */
export const normalizeDateRange = (range) => {
    const defaults = getDefaultDateRange();
    if (!range?.from || !range?.to) {
        return defaults;
    }
    return { from: range.from, to: range.to };
};

export const formatDateRangeLabel = (fromIso, toIso) => {
    if (!fromIso || !toIso) {
        return 'Период';
    }
    const fmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });
    return `${fmt.format(parseIsoDate(fromIso))} — ${fmt.format(parseIsoDate(toIso))}`;
};

export const getMonthBounds = (year, monthIndex) => {
    const from = new Date(year, monthIndex, 1);
    const to = new Date(year, monthIndex + 1, 0);
    return { from: toIsoDate(from), to: toIsoDate(to) };
};

export const concertDayKey = (startsAtIso) => {
    if (!startsAtIso) {
        return '';
    }
    return startsAtIso.slice(0, 10);
};

export const isConcertInDateRange = (startsAtIso, fromIso, toIso) => {
    if (!fromIso || !toIso) {
        return true;
    }

    const day = concertDayKey(startsAtIso);
    if (!day) {
        return false;
    }

    return day >= fromIso && day <= toIso;
};

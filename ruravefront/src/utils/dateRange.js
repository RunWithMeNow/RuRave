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

/** Подпись виджета по умолчанию: только сегодня. */
export const getWidgetDefaultRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const iso = toIsoDate(today);
    return { from: iso, to: iso };
};

/** Фильтр афиши по умолчанию: сегодня — +1 год. */
export const getAfishaDefaultRange = () => {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setFullYear(to.getFullYear() + 1);
    return { from: toIsoDate(from), to: toIsoDate(to) };
};

/** @deprecated Используйте getAfishaDefaultRange или getWidgetDefaultRange */
export const getDefaultDateRange = getAfishaDefaultRange;

export const isSingleDayRange = (fromIso, toIso) =>
    !fromIso || !toIso || fromIso === toIso;

/** Нормализует выбранный в календаре диапазон (пустые границы → сегодня). */
export const normalizeDateRange = (range) => {
    const { from: today, to: todayEnd } = getWidgetDefaultRange();
    if (!range?.from && !range?.to) {
        return { from: today, to: todayEnd };
    }
    return {
        from: range.from || today,
        to: range.to || range.from || todayEnd,
    };
};

const dateLabelFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});

export const formatSingleDateLabel = (iso) => {
    if (!iso) {
        return dateLabelFormatter.format(new Date());
    }
    return dateLabelFormatter.format(parseIsoDate(iso));
};

export const formatDateRangeLabel = (fromIso, toIso) => {
    const rangeFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });
    return `${rangeFmt.format(parseIsoDate(fromIso))} — ${rangeFmt.format(parseIsoDate(toIso))}`;
};

/** Подпись на кнопке: одна дата или диапазон. */
export const formatDateFilterLabel = (fromIso, toIso) => {
    if (isSingleDayRange(fromIso, toIso)) {
        return formatSingleDateLabel(fromIso || toIso);
    }
    return formatDateRangeLabel(fromIso, toIso);
};

export const getMonthBounds = (year, monthIndex) => {
    const from = new Date(year, monthIndex, 1);
    const to = new Date(year, monthIndex + 1, 0);
    return { from: toIsoDate(from), to: toIsoDate(to) };
};

/** Пересечение видимого месяца календаря с применённым периодом афиши. */
export const intersectMonthWithRange = (year, monthIndex, range) => {
    const month = getMonthBounds(year, monthIndex);
    if (!range?.from || !range?.to) {
        return month;
    }

    const from = month.from > range.from ? month.from : range.from;
    const to = month.to < range.to ? month.to : range.to;

    if (from > to) {
        return null;
    }

    return { from, to };
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

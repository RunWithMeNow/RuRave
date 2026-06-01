/** Склонение для русского: one (1, 21…), few (2-4, 22-24…), many (остальное). */
export const pluralizeRu = (count, one, few, many) => {
    const n = Math.abs(count);
    const mod10 = n % 10;
    const mod100 = n % 100;

    if (mod10 === 1 && mod100 !== 11) {
        return one;
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
        return few;
    }
    return many;
};

export const formatConcertCount = (count) => {
    const word = pluralizeRu(count, 'концерт', 'концерта', 'концертов');
    return `${count} ${word}`;
};

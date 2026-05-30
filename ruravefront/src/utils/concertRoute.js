const CONCERT_PATH_RE = /^\/concert\/[^/]+$/;

export const isConcertDetailPath = (pathname) => CONCERT_PATH_RE.test(pathname);

export const getConcertBackgroundLocation = (location) => {
    if (location.state?.backgroundLocation) {
        return location.state.backgroundLocation;
    }

    if (isConcertDetailPath(location.pathname)) {
        return { pathname: '/', search: '', hash: '' };
    }

    return null;
};

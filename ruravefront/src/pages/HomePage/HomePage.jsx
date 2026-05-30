import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import EventList from '../../components/EventList/EventList.jsx';
import EventCardSkeletonList from '../../components/EventCardSkeleton/EventCardSkeletonList.jsx';
import LoadMoreButton from '../../components/LoadMoreButton/LoadMoreButton.jsx';
import HomeMessage from '../../components/HomeMessage/HomeMessage.jsx';
import Search from '../../components/Search/Search.jsx';
import Banner from '../../components/Banner/Banner.jsx';
import { getCities, getConcertDates, getConcerts, mapConcertToEventCard } from '../../api/client.js';
import {
    CONCERTS_PAGE_SIZE,
    concertDayKey,
    getDefaultDateRange,
    getMonthBounds,
    isConcertInDateRange,
    normalizeDateRange,
} from '../../utils/dateRange.js';
import bannerHero from '../../assets/images/banner-hero.png';
import './HomePage.css';
import '../../App.css';

const pickDefaultCity = (cities) => {
    const moscow = cities.find((c) => c.slug === 'moskva');
    return moscow ?? cities[0] ?? null;
};

const filterConcertsBySearch = (items, term) => {
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

const filterConcertsByDateRange = (items, range) => {
    if (!range?.from || !range?.to) {
        return items;
    }
    return items.filter((concert) =>
        isConcertInDateRange(concert.startsAt, range.from, range.to)
    );
};

const shuffleConcerts = (items) => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const HomePage = () => {
    const [cities, setCities] = useState([]);
    const [citiesLoading, setCitiesLoading] = useState(true);
    const [citiesError, setCitiesError] = useState(null);

    const [selectedCityId, setSelectedCityId] = useState(null);
    const [dateRange, setDateRange] = useState(getDefaultDateRange);
    const [concertDates, setConcertDates] = useState([]);

    const [concerts, setConcerts] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [concertsPage, setConcertsPage] = useState(1);
    const [concertsLoading, setConcertsLoading] = useState(false);
    const [concertsLoadingMore, setConcertsLoadingMore] = useState(false);
    const [concertsError, setConcertsError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');

    const [allConcertsRandom, setAllConcertsRandom] = useState([]);
    const [allConcertsLoading, setAllConcertsLoading] = useState(false);
    const [allConcertsVisibleCount, setAllConcertsVisibleCount] = useState(CONCERTS_PAGE_SIZE);

    const concertsLoadIdRef = useRef(0);
    const allConcertsLoadIdRef = useRef(0);

    const loadConcerts = useCallback(async (cityId, search, range, page, append) => {
        if (!cityId || !range?.from || !range?.to) {
            return;
        }

        const loadId = append ? concertsLoadIdRef.current : ++concertsLoadIdRef.current;

        if (append) {
            setConcertsLoadingMore(true);
        } else {
            setConcertsLoading(true);
            setConcertsError(null);
        }

        try {
            const result = await getConcerts({
                cityId,
                search: search || undefined,
                dateFrom: range.from,
                dateTo: range.to,
                page,
                pageSize: CONCERTS_PAGE_SIZE,
            });

            if (!append && loadId !== concertsLoadIdRef.current) {
                return;
            }

            const mapped = result.items.map(mapConcertToEventCard);
            const filtered = filterConcertsByDateRange(mapped, range);
            const apiIgnoredDates =
                !append && mapped.length > 0 && filtered.length < mapped.length;

            setConcerts((prev) => (append ? [...prev, ...filtered] : filtered));
            setTotalCount(apiIgnoredDates ? filtered.length : result.totalCount);
            setConcertsPage(page);
        } catch (err) {
            if (!append && loadId === concertsLoadIdRef.current) {
                setConcerts([]);
                setTotalCount(0);
                setConcertsError(err instanceof Error ? err.message : 'Не удалось загрузить концерты');
            }
        } finally {
            if (append) {
                setConcertsLoadingMore(false);
            } else if (loadId === concertsLoadIdRef.current) {
                setConcertsLoading(false);
            }
        }
    }, []);

    const loadAllConcertsRandom = useCallback(async (cityList, range) => {
        if (cityList.length === 0 || !range?.from || !range?.to) {
            setAllConcertsRandom([]);
            return;
        }

        const loadId = ++allConcertsLoadIdRef.current;
        setAllConcertsLoading(true);

        try {
            const pages = await Promise.all(
                cityList.map((city) =>
                    getConcerts({
                        cityId: city.id,
                        dateFrom: range.from,
                        dateTo: range.to,
                        pageSize: 100,
                    })
                )
            );

            if (loadId !== allConcertsLoadIdRef.current) {
                return;
            }

            const byId = new Map();
            pages.forEach((page) => {
                page.items.forEach((concert) => {
                    byId.set(concert.id, mapConcertToEventCard(concert));
                });
            });
            const merged = filterConcertsByDateRange([...byId.values()], range);
            setAllConcertsRandom(shuffleConcerts(merged));
            setAllConcertsVisibleCount(CONCERTS_PAGE_SIZE);
        } catch {
            if (loadId === allConcertsLoadIdRef.current) {
                setAllConcertsRandom([]);
                setAllConcertsVisibleCount(CONCERTS_PAGE_SIZE);
            }
        } finally {
            if (loadId === allConcertsLoadIdRef.current) {
                setAllConcertsLoading(false);
            }
        }
    }, []);

    const loadConcertDatesForMonth = useCallback(
        async (cityId, year, monthIndex, search) => {
            if (!cityId) {
                return;
            }

            const { from, to } = getMonthBounds(year, monthIndex);

            try {
                const result = await getConcertDates({
                    cityId,
                    from,
                    to,
                    search: search || undefined,
                });
                setConcertDates(result.dates ?? []);
            } catch {
                setConcertDates([]);
            }
        },
        []
    );

    const loadCities = useCallback(async () => {
        setCitiesLoading(true);
        setCitiesError(null);

        try {
            const data = await getCities();
            setCities(data);
            setSelectedCityId((prev) => {
                if (prev && data.some((city) => city.id === prev)) {
                    return prev;
                }
                const defaultCity = pickDefaultCity(data);
                return defaultCity?.id ?? null;
            });
        } catch (err) {
            setCitiesError(err instanceof Error ? err.message : 'Не удалось загрузить города');
        } finally {
            setCitiesLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCities();
    }, [loadCities]);

    useEffect(() => {
        if (selectedCityId) {
            loadConcerts(selectedCityId, searchTerm, dateRange, 1, false);
        } else {
            setConcerts([]);
            setTotalCount(0);
            setConcertsPage(1);
        }
    }, [selectedCityId, searchTerm, dateRange.from, dateRange.to, loadConcerts]);

    useEffect(() => {
        if (citiesLoading || citiesError || cities.length === 0 || selectedCityId) {
            return;
        }
        loadAllConcertsRandom(cities, dateRange);
    }, [
        cities,
        citiesLoading,
        citiesError,
        selectedCityId,
        dateRange.from,
        dateRange.to,
        loadAllConcertsRandom,
    ]);

    useEffect(() => {
        if (!selectedCityId) {
            return;
        }
        const now = new Date();
        loadConcertDatesForMonth(selectedCityId, now.getFullYear(), now.getMonth(), searchTerm);
    }, [selectedCityId, searchTerm, loadConcertDatesForMonth]);

    useEffect(() => {
        setAllConcertsVisibleCount(CONCERTS_PAGE_SIZE);
    }, [searchTerm, dateRange.from, dateRange.to]);

    const handleCityChange = (city) => {
        setSelectedCityId(city.id);
        setSearchTerm('');
        setDateRange(getDefaultDateRange());
    };

    const handleCityReset = () => {
        setSelectedCityId(null);
        setSearchTerm('');
        setDateRange(getDefaultDateRange());
        setConcerts([]);
        setTotalCount(0);
        setConcertsPage(1);
        setConcertsError(null);
        setConcertDates([]);
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleDateRangeChange = (range) => {
        concertsLoadIdRef.current += 1;
        allConcertsLoadIdRef.current += 1;
        setDateRange(normalizeDateRange(range));
    };

    const handleCalendarMonthChange = (year, monthIndex) => {
        if (selectedCityId) {
            loadConcertDatesForMonth(selectedCityId, year, monthIndex, searchTerm);
        }
    };

    const handleRetryCities = () => {
        loadCities();
    };

    const handleRetryConcerts = () => {
        if (selectedCityId) {
            loadConcerts(selectedCityId, searchTerm, dateRange, 1, false);
        }
    };

    const handleLoadMoreConcerts = () => {
        if (selectedCityId && !concertsLoadingMore) {
            loadConcerts(selectedCityId, searchTerm, dateRange, concertsPage + 1, true);
        }
    };

    const handleLoadMoreAllConcerts = () => {
        setAllConcertsVisibleCount((count) => count + CONCERTS_PAGE_SIZE);
    };

    const hasMoreConcerts = concerts.length > 0 && concerts.length < totalCount;

    const calendarConcertDates = useMemo(() => {
        if (selectedCityId) {
            return concertDates;
        }
        const dates = new Set();
        allConcertsRandom.forEach((concert) => {
            const key = concertDayKey(concert.startsAt);
            if (key) {
                dates.add(key);
            }
        });
        return [...dates];
    }, [selectedCityId, concertDates, allConcertsRandom]);

    const filteredAllConcerts = useMemo(() => {
        const bySearch = filterConcertsBySearch(allConcertsRandom, searchTerm);
        return filterConcertsByDateRange(bySearch, dateRange);
    }, [allConcertsRandom, searchTerm, dateRange.from, dateRange.to]);

    const visibleAllConcerts = filteredAllConcerts.slice(0, allConcertsVisibleCount);
    const hasMoreAllConcerts = allConcertsVisibleCount < filteredAllConcerts.length;

    const showNoResults =
        !concertsLoading &&
        !concertsError &&
        selectedCityId &&
        totalCount === 0;

    const showNoResultsAllConcerts =
        !selectedCityId &&
        !allConcertsLoading &&
        !citiesError &&
        filteredAllConcerts.length === 0;

    const showChooseCityMessage =
        !citiesLoading && !citiesError && !selectedCityId && !searchTerm.trim();

    const showRandomAllConcerts =
        !citiesLoading &&
        !citiesError &&
        !selectedCityId &&
        (allConcertsLoading || filteredAllConcerts.length > 0);

    const selectedCity = cities.find((city) => city.id === selectedCityId) ?? null;

    const concertsCountLabel = (() => {
        const n = totalCount;
        const mod10 = n % 10;
        const mod100 = n % 100;
        if (mod10 === 1 && mod100 !== 11) {
            return `${n} концерт`;
        }
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
            return `${n} концерта`;
        }
        return `${n} концертов`;
    })();

    return (
        <div className="home__container">
            <Banner
                imageUrl={bannerHero}
                alt="Концерт: толпа в зале, яркий свет сцены — RuRave"
            />
            <div className="home__content layout-container section-spacing">
                <Search
                    key={selectedCityId ?? 'no-city'}
                    onSearch={handleSearch}
                    cities={cities}
                    citiesLoading={citiesLoading}
                    selectedCityId={selectedCityId}
                    onCityChange={handleCityChange}
                    onCityReset={handleCityReset}
                    dateFrom={dateRange.from}
                    dateTo={dateRange.to}
                    onDateRangeChange={handleDateRangeChange}
                    concertDates={calendarConcertDates}
                    onCalendarMonthChange={handleCalendarMonthChange}
                />

                {citiesError && (
                    <HomeMessage
                        variant="error"
                        icon="error"
                        title={citiesError}
                        onRetry={handleRetryCities}
                    />
                )}

                {showChooseCityMessage && (
                    <HomeMessage
                        icon="calendar"
                        title="Выберите город"
                        hint="Или воспользуйтесь поиском и календарём — фильтры работают по всей афише"
                    />
                )}

                {showNoResultsAllConcerts && !allConcertsLoading && (
                    <HomeMessage
                        icon="search"
                        title={
                            searchTerm.trim()
                                ? `По запросу «${searchTerm}» ничего не найдено`
                                : 'В выбранный период концертов нет'
                        }
                        hint="Измените период, запрос или выберите город"
                    />
                )}

                {concertsLoading && selectedCityId && !citiesError && (
                    <section
                        className="home__concerts"
                        aria-busy="true"
                        aria-label="Загрузка концертов"
                    >
                        <EventCardSkeletonList />
                    </section>
                )}

                {concertsError && !citiesError && (
                    <HomeMessage
                        variant="error"
                        icon="error"
                        title={concertsError}
                        onRetry={handleRetryConcerts}
                    />
                )}

                {!concertsLoading && !concertsError && selectedCityId && totalCount > 0 && (
                    <section
                        key={`concerts-${selectedCityId}-${searchTerm}-${dateRange.from}-${dateRange.to}`}
                        className="home__concerts home__concerts--enter"
                        aria-labelledby="home-concerts-heading"
                    >
                        <header className="home__concerts-header">
                            <h2 id="home-concerts-heading" className="home__concerts-title">
                                Концерты
                                {selectedCity ? ` в ${selectedCity.name}` : ''}
                            </h2>
                            <p className="home__concerts-count">
                                {concerts.length < totalCount
                                    ? `Показано ${concerts.length} из ${totalCount}`
                                    : concertsCountLabel}
                            </p>
                        </header>
                        <EventList concerts={concerts} />
                        {hasMoreConcerts && (
                            <div className="home__concerts-load-more">
                                <LoadMoreButton
                                    onClick={handleLoadMoreConcerts}
                                    loading={concertsLoadingMore}
                                />
                            </div>
                        )}
                    </section>
                )}

                {showNoResults && searchTerm && (
                    <HomeMessage
                        icon="search"
                        title={`По запросу «${searchTerm}» ничего не найдено`}
                        hint="Измените запрос, период или выберите другой город"
                    />
                )}

                {showNoResults && !searchTerm && (
                    <HomeMessage
                        icon="calendar"
                        title="В выбранный период концертов нет"
                        hint="Смените даты в календаре или выберите другой город"
                    />
                )}

                {showRandomAllConcerts && (
                    <section
                        key={`all-${dateRange.from}-${dateRange.to}-${searchTerm}`}
                        className="home__all-concerts home__concerts--enter"
                        aria-labelledby="home-all-concerts-heading"
                        aria-busy={allConcertsLoading}
                    >
                        <header className="home__concerts-header">
                            <h2 id="home-all-concerts-heading" className="home__concerts-title">
                                {searchTerm.trim() ? 'Результаты поиска' : 'Все концерты'}
                            </h2>
                            {!allConcertsLoading && filteredAllConcerts.length > 0 && (
                                <p className="home__concerts-count">
                                    Показано {Math.min(allConcertsVisibleCount, filteredAllConcerts.length)} из{' '}
                                    {filteredAllConcerts.length}
                                </p>
                            )}
                        </header>
                        {allConcertsLoading ? (
                            <EventCardSkeletonList />
                        ) : (
                            <>
                                <EventList concerts={visibleAllConcerts} />
                                {hasMoreAllConcerts && (
                                    <div className="home__concerts-load-more">
                                        <LoadMoreButton onClick={handleLoadMoreAllConcerts} />
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
};

export default HomePage;

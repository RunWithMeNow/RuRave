import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AboutSection from '../../components/AboutSection/AboutSection.jsx';
import EventList from '../../components/EventList/EventList.jsx';
import EventCardSkeletonList from '../../components/EventCardSkeleton/EventCardSkeletonList.jsx';
import LoadMoreButton from '../../components/LoadMoreButton/LoadMoreButton.jsx';
import HomeMessage from '../../components/HomeMessage/HomeMessage.jsx';
import Search from '../../components/Search/Search.jsx';
import Banner from '../../components/Banner/Banner.jsx';
import { getCities, getConcertDates, getConcerts, mapConcertToEventCard } from '../../api/client.js';
import { applyConcertFilters, collectConcertDates } from '../../utils/concertFilters.js';
import {
    CONCERTS_PAGE_SIZE,
    getAfishaDefaultRange,
    getWidgetDefaultRange,
    intersectMonthWithRange,
    normalizeDateRange,
} from '../../utils/dateRange.js';
import { scrollToAboutSection, scrollToAfishaSection } from '../../utils/homeNavScroll.js';
import bannerHero from '../../assets/images/banner-hero.png';
import './HomePage.css';
import '../../App.css';

const pickDefaultCity = (cities) => {
    const moscow = cities.find((c) => c.slug === 'moskva');
    return moscow ?? cities[0] ?? null;
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
    const location = useLocation();

    const [cities, setCities] = useState([]);
    const [citiesLoading, setCitiesLoading] = useState(true);
    const [citiesError, setCitiesError] = useState(null);

    const [selectedCityId, setSelectedCityId] = useState(null);
    const [dateRange, setDateRange] = useState(getAfishaDefaultRange);
    const [widgetDateRange, setWidgetDateRange] = useState(getWidgetDefaultRange);
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
            const filtered = applyConcertFilters(mapped, { search, range });
            const apiIgnoredFilters =
                !append && mapped.length > 0 && filtered.length < mapped.length;

            setConcerts((prev) => (append ? [...prev, ...filtered] : filtered));
            setTotalCount(apiIgnoredFilters ? filtered.length : result.totalCount);
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

    const loadAllConcertsRandom = useCallback(async (cityList, range, search) => {
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
                        search: search?.trim() || undefined,
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
            const merged = applyConcertFilters([...byId.values()], { search, range });
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
        async (cityId, year, monthIndex, search, range) => {
            if (!cityId) {
                return;
            }

            const bounds = intersectMonthWithRange(year, monthIndex, range);
            if (!bounds) {
                setConcertDates([]);
                return;
            }

            try {
                const result = await getConcertDates({
                    cityId,
                    from: bounds.from,
                    to: bounds.to,
                    search: search?.trim() || undefined,
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
        if (location.hash === '#about') {
            scrollToAboutSection();
        } else if (location.hash === '#afisha') {
            scrollToAfishaSection();
        }
    }, [location.hash]);

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
        loadAllConcertsRandom(cities, dateRange, searchTerm);
    }, [
        cities,
        citiesLoading,
        citiesError,
        selectedCityId,
        searchTerm,
        dateRange.from,
        dateRange.to,
        loadAllConcertsRandom,
    ]);

    useEffect(() => {
        if (!selectedCityId) {
            return;
        }
        const now = new Date();
        loadConcertDatesForMonth(
            selectedCityId,
            now.getFullYear(),
            now.getMonth(),
            searchTerm,
            dateRange
        );
    }, [
        selectedCityId,
        searchTerm,
        dateRange.from,
        dateRange.to,
        loadConcertDatesForMonth,
    ]);

    useEffect(() => {
        setAllConcertsVisibleCount(CONCERTS_PAGE_SIZE);
    }, [searchTerm, dateRange.from, dateRange.to]);

    const applyDateFilterDefaults = useCallback(() => {
        concertsLoadIdRef.current += 1;
        allConcertsLoadIdRef.current += 1;
        setDateRange(getAfishaDefaultRange());
        setWidgetDateRange(getWidgetDefaultRange());
    }, []);

    const handleCityChange = (city) => {
        setSelectedCityId(city.id);
        setSearchTerm('');
        applyDateFilterDefaults();
        setConcerts([]);
        setTotalCount(0);
        setConcertsPage(1);
    };

    const handleCityReset = () => {
        setSelectedCityId(null);
        setSearchTerm('');
        applyDateFilterDefaults();
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
        const next = normalizeDateRange(range);
        concertsLoadIdRef.current += 1;
        allConcertsLoadIdRef.current += 1;
        setDateRange(next);
        setWidgetDateRange(next);
    };

    const handleCalendarMonthChange = (year, monthIndex) => {
        if (selectedCityId) {
            loadConcertDatesForMonth(
                selectedCityId,
                year,
                monthIndex,
                searchTerm,
                dateRange
            );
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
        return collectConcertDates(allConcertsRandom);
    }, [selectedCityId, concertDates, allConcertsRandom]);

    const filteredAllConcerts = allConcertsRandom;

    const visibleAllConcerts = filteredAllConcerts.slice(0, allConcertsVisibleCount);
    const hasMoreAllConcerts = allConcertsVisibleCount < filteredAllConcerts.length;

    const concertsInitialLoading = concertsLoading && concerts.length === 0;
    const concertsRefreshing = concertsLoading && concerts.length > 0;
    const allConcertsInitialLoading = allConcertsLoading && filteredAllConcerts.length === 0;
    const allConcertsRefreshing = allConcertsLoading && filteredAllConcerts.length > 0;

    const showCityConcertsList =
        selectedCityId &&
        !concertsError &&
        (concerts.length > 0 || concertsRefreshing);

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
            <div
                id="afisha"
                className="home__content"
                aria-label="Афиша концертов"
            >
                <Search
                    key={selectedCityId ?? 'no-city'}
                    searchTerm={searchTerm}
                    onSearch={handleSearch}
                    cities={cities}
                    citiesLoading={citiesLoading}
                    selectedCityId={selectedCityId}
                    onCityChange={handleCityChange}
                    onCityReset={handleCityReset}
                    dateFrom={widgetDateRange.from}
                    dateTo={widgetDateRange.to}
                    onDateRangeChange={handleDateRangeChange}
                    onDateFilterDefaults={applyDateFilterDefaults}
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

                {concertsInitialLoading && selectedCityId && !citiesError && (
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

                {showCityConcertsList && (
                    <section
                        key={`concerts-city-${selectedCityId}`}
                        className={`home__concerts home__concerts--enter${concertsRefreshing ? ' home__concerts--refreshing' : ''}`}
                        aria-labelledby="home-concerts-heading"
                        aria-busy={concertsRefreshing}
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
                        className={`home__all-concerts home__concerts--enter${allConcertsRefreshing ? ' home__concerts--refreshing' : ''}`}
                        aria-labelledby="home-all-concerts-heading"
                        aria-busy={allConcertsLoading}
                    >
                        <header className="home__concerts-header">
                            <h2 id="home-all-concerts-heading" className="home__concerts-title">
                                {searchTerm.trim() ? 'Результаты поиска' : 'Все концерты'}
                            </h2>
                            {!allConcertsInitialLoading && filteredAllConcerts.length > 0 && (
                                <p className="home__concerts-count">
                                    Показано {Math.min(allConcertsVisibleCount, filteredAllConcerts.length)} из{' '}
                                    {filteredAllConcerts.length}
                                </p>
                            )}
                        </header>
                        {allConcertsInitialLoading ? (
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
            <AboutSection />
        </div>
    );
};

export default HomePage;

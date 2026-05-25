import { useCallback, useEffect, useState } from 'react';
import EventList from '../../components/EventList/EventList.jsx';
import Search from '../../components/Search/Search.jsx';
import Banner from '../../components/Banner/Banner.jsx';
import { getCities, getConcerts, mapConcertToEventCard } from '../../api/client.js';
import './HomePage.css';
import '../../App.css';

const pickDefaultCity = (cities) => {
    const moscow = cities.find((c) => c.slug === 'moskva');
    return moscow ?? cities[0] ?? null;
};

const HomePage = () => {
    const [cities, setCities] = useState([]);
    const [citiesLoading, setCitiesLoading] = useState(true);
    const [citiesError, setCitiesError] = useState(null);

    const [selectedCityId, setSelectedCityId] = useState(null);

    const [concerts, setConcerts] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [concertsLoading, setConcertsLoading] = useState(false);
    const [concertsError, setConcertsError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');

    const loadConcerts = useCallback(async (cityId, search) => {
        if (!cityId) {
            return;
        }

        setConcertsLoading(true);
        setConcertsError(null);

        try {
            const result = await getConcerts({
                cityId,
                search: search || undefined,
            });
            setConcerts(result.items.map(mapConcertToEventCard));
            setTotalCount(result.totalCount);
        } catch (err) {
            setConcerts([]);
            setTotalCount(0);
            setConcertsError(err instanceof Error ? err.message : 'Не удалось загрузить концерты');
        } finally {
            setConcertsLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadCities = async () => {
            setCitiesLoading(true);
            setCitiesError(null);

            try {
                const data = await getCities();
                if (cancelled) {
                    return;
                }

                setCities(data);
                const defaultCity = pickDefaultCity(data);
                if (defaultCity) {
                    setSelectedCityId(defaultCity.id);
                }
            } catch (err) {
                if (!cancelled) {
                    setCitiesError(
                        err instanceof Error ? err.message : 'Не удалось загрузить города'
                    );
                }
            } finally {
                if (!cancelled) {
                    setCitiesLoading(false);
                }
            }
        };

        loadCities();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (selectedCityId) {
            loadConcerts(selectedCityId, searchTerm);
        }
    }, [selectedCityId, searchTerm, loadConcerts]);

    const handleCityChange = (city) => {
        setSelectedCityId(city.id);
        setSearchTerm('');
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleRetry = () => {
        if (citiesError) {
            window.location.reload();
            return;
        }
        if (selectedCityId) {
            loadConcerts(selectedCityId, searchTerm);
        }
    };

    const showNoResults =
        !concertsLoading &&
        !concertsError &&
        selectedCityId &&
        totalCount === 0;

    return (
        <div className="home__container">
            <Banner imageUrl="https://hq-oboi.ru/photo/temnyy_i_stilnye_abstrakciya_na_rabochiy_stol_1920x1200.jpg" />
            <Search
                key={selectedCityId ?? 'no-city'}
                onSearch={handleSearch}
                cities={cities}
                citiesLoading={citiesLoading}
                selectedCityId={selectedCityId}
                onCityChange={handleCityChange}
            />

            {citiesError && (
                <div className="home__status home__status--error">
                    <p>{citiesError}</p>
                    <button type="button" className="home__retry" onClick={handleRetry}>
                        Повторить
                    </button>
                </div>
            )}

            {concertsLoading && (
                <p className="home__status home__status--loading">Загрузка...</p>
            )}

            {concertsError && !citiesError && (
                <div className="home__status home__status--error">
                    <p>{concertsError}</p>
                    <button type="button" className="home__retry" onClick={handleRetry}>
                        Повторить
                    </button>
                </div>
            )}

            {!concertsLoading && !concertsError && selectedCityId && (
                <EventList concerts={concerts} />
            )}

            {showNoResults && searchTerm && (
                <div className="no-results">
                    <p>По запросу &quot;{searchTerm}&quot; ничего не найдено</p>
                </div>
            )}

            {showNoResults && !searchTerm && (
                <div className="no-results">
                    <p>В этом городе пока нет концертов</p>
                </div>
            )}
        </div>
    );
};

export default HomePage;

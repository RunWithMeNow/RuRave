import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import CityImage from '../../components/CityImage/CityImage.jsx';
import EventList from '../../components/EventList/EventList.jsx';
import HomeMessage from '../../components/HomeMessage/HomeMessage.jsx';
import LoadMoreButton from '../../components/LoadMoreButton/LoadMoreButton.jsx';
import {
    getCityBySlug,
    getConcerts,
    mapConcertToEventCard,
} from '../../api/client.js';
import {
    CONCERTS_PAGE_SIZE,
    formatDateRangeLabel,
    getAfishaDefaultRange,
} from '../../utils/dateRange.js';
import LoadingState from '../../components/LoadingState/LoadingState.jsx';
import { buildCityPath } from '../../utils/cityImage.js';
import { formatConcertCount } from '../../utils/pluralize.js';
import './CityPage.css';
import '../../App.css';

const CityPage = () => {
    const { slug: rawSlug } = useParams();
    const slug = rawSlug?.trim() ?? '';
    const [searchParams] = useSearchParams();

    const dateRange = useMemo(
        () => {
            const from = searchParams.get('dateFrom');
            const to = searchParams.get('dateTo');
            if (from && to) {
                return { from, to };
            }
            return getAfishaDefaultRange();
        },
        [searchParams]
    );

    const [city, setCity] = useState(null);
    const [cityLoading, setCityLoading] = useState(true);
    const [cityError, setCityError] = useState(null);

    const [concerts, setConcerts] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [concertsLoading, setConcertsLoading] = useState(false);
    const [concertsLoadingMore, setConcertsLoadingMore] = useState(false);
    const [concertsError, setConcertsError] = useState(null);

    const loadCity = useCallback(async () => {
        if (!slug) {
            setCity(null);
            setCityError('Неверный адрес города');
            setCityLoading(false);
            return;
        }

        setCityLoading(true);
        setCityError(null);

        try {
            const data = await getCityBySlug(slug, {
                dateFrom: dateRange.from,
                dateTo: dateRange.to,
            });
            setCity(data);
        } catch (err) {
            setCity(null);
            setCityError(err instanceof Error ? err.message : 'Не удалось загрузить город');
        } finally {
            setCityLoading(false);
        }
    }, [slug, dateRange.from, dateRange.to]);

    const loadConcerts = useCallback(
        async (cityId, pageNum, append) => {
            if (!cityId) {
                return;
            }

            if (append) {
                setConcertsLoadingMore(true);
            } else {
                setConcertsLoading(true);
                setConcertsError(null);
            }

            try {
                const result = await getConcerts({
                    cityId,
                    dateFrom: dateRange.from,
                    dateTo: dateRange.to,
                    page: pageNum,
                    pageSize: CONCERTS_PAGE_SIZE,
                });
                const mapped = result.items.map(mapConcertToEventCard);
                setConcerts((prev) => (append ? [...prev, ...mapped] : mapped));
                setTotalCount(result.totalCount);
                setPage(pageNum);
            } catch (err) {
                if (!append) {
                    setConcerts([]);
                    setTotalCount(0);
                    setConcertsError(
                        err instanceof Error ? err.message : 'Не удалось загрузить концерты'
                    );
                }
            } finally {
                if (append) {
                    setConcertsLoadingMore(false);
                } else {
                    setConcertsLoading(false);
                }
            }
        },
        [dateRange.from, dateRange.to]
    );

    useEffect(() => {
        loadCity();
    }, [loadCity]);

    useEffect(() => {
        if (city?.id) {
            loadConcerts(city.id, 1, false);
        } else {
            setConcerts([]);
            setTotalCount(0);
            setPage(1);
        }
    }, [city?.id, loadConcerts]);

    const periodLabel = formatDateRangeLabel(dateRange.from, dateRange.to);
    const hasMoreConcerts = concerts.length > 0 && concerts.length < totalCount;

    if (cityLoading) {
        return (
            <div className="city-page">
                <LoadingState label="Загрузка города" size="lg" variant="page" />
            </div>
        );
    }

    if (cityError || !city) {
        return (
            <div className="city-page layout-container">
                <HomeMessage variant="error" icon="error" title={cityError ?? 'Город не найден'} />
                <Link to="/" className="page__link">
                    На главную
                </Link>
            </div>
        );
    }

    return (
        <div className="city-page">
            <div className="city-page__hero">
                <CityImage
                    className="city-page__hero-image"
                    imageUrl={city.imageUrl}
                    alt={city.name}
                />
                <div className="city-page__hero-overlay layout-container">
                    <h1 className="city-page__title">{city.name}</h1>
                    <p className="city-page__meta">
                        Афиша за период: {periodLabel}
                        {city.concertCount > 0 && (
                            <span className="city-page__count">
                                {' '}
                                · {formatConcertCount(city.concertCount)}
                            </span>
                        )}
                    </p>
                </div>
            </div>

            <div className="city-page__body layout-container">
                <Link to={`/#afisha`} className="page__link city-page__afisha-link">
                    Открыть в фильтре афиши
                </Link>

                {concertsLoading && concerts.length === 0 && (
                    <LoadingState label="Загрузка концертов" variant="section" />
                )}

                {concertsError && (
                    <HomeMessage
                        variant="error"
                        icon="error"
                        title={concertsError}
                        onRetry={() => loadConcerts(city.id, 1, false)}
                    />
                )}

                {!concertsLoading && !concertsError && concerts.length === 0 && (
                    <HomeMessage
                        icon="calendar"
                        title="В выбранный период концертов в этом городе нет"
                        hint="Вернитесь на главную и измените даты в календаре"
                    />
                )}

                {concerts.length > 0 && (
                    <section className="city-page__concerts" aria-labelledby="city-concerts-heading">
                        <h2 id="city-concerts-heading" className="city-page__concerts-title">
                            Концерты
                        </h2>
                        <EventList concerts={concerts} animate={false} />
                        {hasMoreConcerts && (
                            <div className="city-page__load-more">
                                <LoadMoreButton
                                    onClick={() => loadConcerts(city.id, page + 1, true)}
                                    loading={concertsLoadingMore}
                                />
                            </div>
                        )}
                    </section>
                )}

                <Link to="/#cities" className="page__link city-page__back">
                    К городам на главной
                </Link>
            </div>
        </div>
    );
};

export default CityPage;

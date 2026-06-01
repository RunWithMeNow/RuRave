import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCitiesAfishaSummary } from '../../api/client.js';
import CityImage from '../CityImage/CityImage.jsx';
import { formatConcertCount } from '../../utils/pluralize.js';
import { formatDateRangeLabel } from '../../utils/dateRange.js';
import { buildCityPath } from '../../utils/cityImage.js';
import LoadingState from '../LoadingState/LoadingState.jsx';
import HomeMessage from '../HomeMessage/HomeMessage.jsx';
import './CitiesSection.css';
import '../../App.css';

const formatNextConcert = (startsAtIso) => {
    if (!startsAtIso) {
        return null;
    }
    return new Date(startsAtIso).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
    });
};

const CitiesSection = ({ dateRange, onCitySelect }) => {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const loadIdRef = useRef(0);

    const loadSummary = useCallback(async (range) => {
        if (!range?.from || !range?.to) {
            setCities([]);
            return;
        }

        const loadId = ++loadIdRef.current;
        setLoading(true);
        setError(null);

        try {
            const data = await getCitiesAfishaSummary({
                dateFrom: range.from,
                dateTo: range.to,
            });
            if (loadId !== loadIdRef.current) {
                return;
            }
            setCities(data ?? []);
        } catch (err) {
            if (loadId === loadIdRef.current) {
                setCities([]);
                setError(err instanceof Error ? err.message : 'Не удалось загрузить города');
            }
        } finally {
            if (loadId === loadIdRef.current) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        loadSummary(dateRange);
    }, [dateRange.from, dateRange.to, loadSummary]);

    if (!loading && !error && cities.length === 0) {
        return null;
    }

    const periodLabel = formatDateRangeLabel(dateRange.from, dateRange.to);

    return (
        <section
            id="cities"
            className="home-cities section-spacing"
            aria-labelledby="home-cities-heading"
        >
            <div className="layout-container home-cities__inner">
                <header className="home-cities__header">
                    <h2 id="home-cities-heading" className="home-cities__title">
                        Города с афишей
                    </h2>
                    <p className="home-cities__subtitle">
                        События за период: {periodLabel}
                    </p>
                </header>

                {loading && (
                    <LoadingState label="Загрузка городов" size="lg" variant="section" />
                )}

                {error && (
                    <HomeMessage
                        variant="error"
                        icon="error"
                        title={error}
                        onRetry={() => loadSummary(dateRange)}
                    />
                )}

                {!loading && !error && cities.length > 0 && (
                    <div className="home-cities__slider">
                        <ul
                            className="home-cities__grid home-cities__grid--scroll"
                            aria-label="Города — при необходимости прокрутите горизонтально"
                        >
                            {cities.map((city) => {
                                const nextLabel = formatNextConcert(city.nextStartsAt);
                                return (
                                    <li key={city.id} className="home-cities__item">
                                        <article className="home-cities__card">
                                            <Link
                                                to={buildCityPath(city.slug, dateRange)}
                                                className="home-cities__media-link"
                                                aria-label={`Страница города ${city.name}`}
                                            >
                                                <CityImage
                                                    className="home-cities__image"
                                                    imageUrl={city.imageUrl}
                                                    alt={city.name}
                                                />
                                            </Link>
                                            <div className="home-cities__body">
                                                <button
                                                    type="button"
                                                    className="home-cities__select"
                                                    onClick={() =>
                                                        onCitySelect({
                                                            id: city.id,
                                                            name: city.name,
                                                            slug: city.slug,
                                                        })
                                                    }
                                                >
                                                    <span className="home-cities__name">
                                                        {city.name}
                                                    </span>
                                                    <span className="home-cities__count">
                                                        {formatConcertCount(city.concertCount)}
                                                    </span>
                                                    {nextLabel && (
                                                        <span className="home-cities__next">
                                                            Ближайший: {nextLabel}
                                                        </span>
                                                    )}
                                                </button>
                                                <Link
                                                    to={buildCityPath(city.slug, dateRange)}
                                                    className="home-cities__details-link"
                                                >
                                                    О городе
                                                </Link>
                                            </div>
                                        </article>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </section>
    );
};

export default CitiesSection;

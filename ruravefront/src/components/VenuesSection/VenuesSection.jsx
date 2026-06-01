import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVenues } from '../../api/client.js';
import { formatConcertCount } from '../../utils/pluralize.js';
import { formatDateRangeLabel } from '../../utils/dateRange.js';
import { buildVenuePath } from '../../utils/venueRoute.js';
import LoadingState from '../LoadingState/LoadingState.jsx';
import HomeMessage from '../HomeMessage/HomeMessage.jsx';
import placeIcon from '../../assets/icons/place.png';
import './VenuesSection.css';
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

const VenuesSection = ({ cityId, cityName, dateRange }) => {
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const loadIdRef = useRef(0);

    const loadVenues = useCallback(async (id, range) => {
        if (!id || !range?.from || !range?.to) {
            setVenues([]);
            return;
        }

        const loadId = ++loadIdRef.current;
        setLoading(true);
        setError(null);

        try {
            const data = await getVenues({
                cityId: id,
                dateFrom: range.from,
                dateTo: range.to,
            });
            if (loadId !== loadIdRef.current) {
                return;
            }
            setVenues(data ?? []);
        } catch (err) {
            if (loadId === loadIdRef.current) {
                setVenues([]);
                setError(err instanceof Error ? err.message : 'Не удалось загрузить площадки');
            }
        } finally {
            if (loadId === loadIdRef.current) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        loadVenues(cityId, dateRange);
    }, [cityId, dateRange.from, dateRange.to, loadVenues]);

    if (!cityId) {
        return null;
    }

    if (!loading && !error && venues.length === 0) {
        return null;
    }

    const periodLabel = formatDateRangeLabel(dateRange.from, dateRange.to);

    return (
        <section
            id="venues"
            className="home-venues section-spacing"
            aria-labelledby="home-venues-heading"
        >
            <div className="layout-container home-venues__inner">
                <header className="home-venues__header">
                    <h2 id="home-venues-heading" className="home-venues__title">
                        Площадки{cityName ? ` в ${cityName}` : ''}
                    </h2>
                    <p className="home-venues__subtitle">
                        За период: {periodLabel}
                    </p>
                </header>

                {loading && (
                    <LoadingState label="Загрузка площадок" size="lg" variant="section" />
                )}

                {error && (
                    <HomeMessage
                        variant="error"
                        icon="error"
                        title={error}
                        onRetry={() => loadVenues(cityId, dateRange)}
                    />
                )}

                {!loading && !error && venues.length > 0 && (
                    <ul className="home-venues__grid">
                        {venues.map((venue) => {
                            const nextLabel = formatNextConcert(venue.nextStartsAt);
                            return (
                                <li key={venue.id}>
                                    <Link
                                        to={buildVenuePath(venue.id, dateRange)}
                                        className="home-venues__card"
                                    >
                                        <span className="home-venues__icon-wrap" aria-hidden="true">
                                            <img
                                                className="home-venues__icon"
                                                src={placeIcon}
                                                alt=""
                                            />
                                        </span>
                                        <span className="home-venues__body">
                                            <span className="home-venues__name">{venue.name}</span>
                                            {venue.address && (
                                                <span className="home-venues__address">
                                                    {venue.address}
                                                </span>
                                            )}
                                            <span className="home-venues__count">
                                                {formatConcertCount(venue.concertCount)}
                                            </span>
                                            {nextLabel && (
                                                <span className="home-venues__next">
                                                    Ближайший: {nextLabel}
                                                </span>
                                            )}
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </section>
    );
};

export default VenuesSection;

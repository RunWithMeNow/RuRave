import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import LoadingState from '../../components/LoadingState/LoadingState.jsx';
import PageLayout from '../../components/PageLayout/PageLayout.jsx';
import CityImage from '../../components/CityImage/CityImage.jsx';
import EventList from '../../components/EventList/EventList.jsx';
import HomeMessage from '../../components/HomeMessage/HomeMessage.jsx';
import VenueMap from '../../components/VenueMap/VenueMap.jsx';
import { getVenueById, mapConcertToEventCard } from '../../api/client.js';
import {
    formatDateRangeLabel,
    getAfishaDefaultRange,
} from '../../utils/dateRange.js';
import { parseVenueDateRange } from '../../utils/venueRoute.js';
import { buildCityPath } from '../../utils/cityImage.js';
import { formatConcertCount } from '../../utils/pluralize.js';
import './VenuePage.css';
import '../../App.css';

const parseVenueId = (rawId) => {
    const id = Number.parseInt(rawId ?? '', 10);
    return Number.isFinite(id) && id > 0 ? id : null;
};

const VenuePage = () => {
    const { id: rawId } = useParams();
    const venueId = parseVenueId(rawId);
    const [searchParams] = useSearchParams();

    const dateRange = useMemo(
        () => parseVenueDateRange(searchParams, getAfishaDefaultRange()),
        [searchParams]
    );

    const [venue, setVenue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadVenue = useCallback(async () => {
        if (!venueId) {
            setVenue(null);
            setError('Неверный адрес площадки');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getVenueById(venueId, {
                dateFrom: dateRange.from,
                dateTo: dateRange.to,
            });
            setVenue(data);
        } catch (err) {
            setVenue(null);
            setError(err instanceof Error ? err.message : 'Не удалось загрузить площадку');
        } finally {
            setLoading(false);
        }
    }, [venueId, dateRange.from, dateRange.to]);

    useEffect(() => {
        loadVenue();
    }, [loadVenue]);

    const concerts = useMemo(
        () => (venue?.concerts ?? []).map(mapConcertToEventCard),
        [venue]
    );

    const periodLabel = formatDateRangeLabel(dateRange.from, dateRange.to);

    if (loading) {
        return (
            <PageLayout title="Площадка">
                <LoadingState label="Загрузка площадки" size="lg" variant="page" />
            </PageLayout>
        );
    }

    if (error || !venue) {
        return (
            <PageLayout title="Площадка">
                <HomeMessage variant="error" icon="error" title={error ?? 'Площадка не найдена'} />
                <Link to="/" className="page__link">
                    На главную
                </Link>
            </PageLayout>
        );
    }

    return (
        <PageLayout title={venue.name}>
            <div className="venue-page">
                <div className="venue-page__city-row">
                    {venue.cityImageUrl && venue.citySlug && (
                        <Link
                            to={buildCityPath(venue.citySlug, dateRange)}
                            className="venue-page__city-thumb"
                            aria-label={`Страница города ${venue.cityName}`}
                        >
                            <CityImage
                                className="venue-page__city-image"
                                imageUrl={venue.cityImageUrl}
                                alt={venue.cityName}
                            />
                        </Link>
                    )}
                    <p className="venue-page__meta">
                        {venue.cityName}
                        {venue.address ? ` · ${venue.address}` : ''}
                    </p>
                </div>
                <p className="venue-page__period">
                    Афиша за период: {periodLabel}
                    {concerts.length > 0 && (
                        <span className="venue-page__period-count">
                            {' '}
                            · {formatConcertCount(concerts.length)}
                        </span>
                    )}
                </p>

                {venue.mapSearchQuery && (
                    <VenueMap
                        place={venue.name}
                        address={venue.address ?? ''}
                        mapSearchQuery={venue.mapSearchQuery}
                    />
                )}

                {concerts.length > 0 ? (
                    <section className="venue-page__concerts" aria-labelledby="venue-concerts-heading">
                        <h2 id="venue-concerts-heading" className="venue-page__concerts-title">
                            Концерты на площадке
                        </h2>
                        <EventList concerts={concerts} animate={false} />
                    </section>
                ) : (
                    <HomeMessage
                        icon="calendar"
                        title="В выбранный период концертов на этой площадке нет"
                        hint="Вернитесь на главную и измените даты в календаре"
                    />
                )}

                <Link to="/#venues" className="page__link venue-page__back">
                    К площадкам на главной
                </Link>
            </div>
        </PageLayout>
    );
};

export default VenuePage;

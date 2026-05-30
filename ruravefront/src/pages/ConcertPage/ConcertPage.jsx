import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import HomeMessage from '../../components/HomeMessage/HomeMessage.jsx';
import BuyTicketModal from '../../components/BuyTicketModal/BuyTicketModal.jsx';
import VenueMap from '../../components/VenueMap/VenueMap.jsx';
import { getConcertById, mapConcertDetailToView } from '../../api/client.js';
import './ConcertPage.css';
import '../../App.css';

const parseConcertId = (rawId) => {
    const id = Number.parseInt(rawId ?? '', 10);
    return Number.isFinite(id) && id > 0 ? id : null;
};

const ConcertPage = () => {
    const { id: rawId } = useParams();
    const concertId = parseConcertId(rawId);

    const [concert, setConcert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [buyModalOpen, setBuyModalOpen] = useState(false);

    const buyButtonRef = useRef(null);

    const loadConcert = useCallback(async () => {
        if (!concertId) {
            setConcert(null);
            setError('Неверный адрес концерта');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getConcertById(concertId);
            setConcert(mapConcertDetailToView(data));
            setImageError(false);
        } catch (err) {
            setConcert(null);
            setError(err instanceof Error ? err.message : 'Не удалось загрузить концерт');
        } finally {
            setLoading(false);
        }
    }, [concertId]);

    useEffect(() => {
        loadConcert();
    }, [loadConcert]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [concertId]);

    const handleBuyClick = () => {
        setBuyModalOpen(true);
    };

    const handleBuyModalClose = () => {
        setBuyModalOpen(false);
        buyButtonRef.current?.focus();
    };

    return (
        <div className="concert-page">
            <div className="layout-container concert-page__inner">
                <Link to="/" className="concert-page__back page__link">
                    ← К афише
                </Link>

                {loading && (
                    <div className="concert-page__loading" aria-busy="true" aria-label="Загрузка концерта">
                        <div className="concert-page__skeleton concert-page__skeleton--hero" />
                        <div className="concert-page__skeleton concert-page__skeleton--title" />
                        <div className="concert-page__skeleton concert-page__skeleton--line" />
                        <div className="concert-page__skeleton concert-page__skeleton--line" />
                    </div>
                )}

                {!loading && error && (
                    <HomeMessage
                        variant="error"
                        icon="error"
                        title={error}
                        hint="Проверьте ссылку или вернитесь на главную"
                        onRetry={concertId ? loadConcert : undefined}
                    />
                )}

                {!loading && !error && concert && (
                    <article className="concert-page__article">
                        <img
                            className={`concert-page__hero${imageError ? ' concert-page__hero--fallback' : ''}`}
                            src={concert.imgsrc}
                            alt={concert.title}
                            onError={() => setImageError(true)}
                        />

                        <div className="concert-page__body">
                            <h1 className="concert-page__title">{concert.title}</h1>

                            <ul className="concert-page__meta">
                                <li className="concert-page__meta-item">
                                    <span className="concert-page__meta-label">Дата</span>
                                    <span className="concert-page__meta-value">{concert.dateTime}</span>
                                </li>
                                <li className="concert-page__meta-item">
                                    <span className="concert-page__meta-label">Место</span>
                                    <span className="concert-page__meta-value">
                                        {concert.place}, {concert.cityName}
                                    </span>
                                </li>
                                <li className="concert-page__meta-item">
                                    <span className="concert-page__meta-label">Артисты</span>
                                    <span className="concert-page__meta-value">{concert.artist}</span>
                                </li>
                            </ul>

                            {concert.mapSearchQuery ? (
                                <VenueMap
                                    mapSearchQuery={concert.mapSearchQuery}
                                    place={concert.place}
                                    venueAddress={concert.venueAddress || undefined}
                                />
                            ) : null}

                            {concert.description ? (
                                <section className="concert-page__section" aria-labelledby="concert-description">
                                    <h2 id="concert-description" className="concert-page__section-title">
                                        О концерте
                                    </h2>
                                    <p className="concert-page__description">{concert.description}</p>
                                </section>
                            ) : null}

                            {concert.ticketCategories.length > 0 && (
                                <section className="concert-page__section" aria-labelledby="concert-tickets">
                                    <h2 id="concert-tickets" className="concert-page__section-title">
                                        Билеты
                                    </h2>
                                    <ul className="concert-page__tickets">
                                        {concert.ticketCategories.map((ticket) => (
                                            <li key={`${ticket.name}-${ticket.sortOrder}`} className="concert-page__ticket">
                                                <span className="concert-page__ticket-name">{ticket.name}</span>
                                                <span className="concert-page__ticket-price">
                                                    {ticket.price} руб.
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            <footer className="concert-page__footer">
                                <p className="concert-page__price">от {concert.cost} руб.</p>
                                <button
                                    ref={buyButtonRef}
                                    type="button"
                                    className="concert-page__buy"
                                    onClick={handleBuyClick}
                                >
                                    Купить билет
                                </button>
                            </footer>
                        </div>
                    </article>
                )}

                {concert && (
                    <BuyTicketModal
                        isOpen={buyModalOpen}
                        onClose={handleBuyModalClose}
                        concertTitle={concert.title}
                        minPrice={concert.cost}
                    />
                )}
            </div>
        </div>
    );
};

export default ConcertPage;

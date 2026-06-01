import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import LoadingState from '../../components/LoadingState/LoadingState.jsx';
import HomeMessage from '../../components/HomeMessage/HomeMessage.jsx';
import BuyTicketModal from '../../components/BuyTicketModal/BuyTicketModal.jsx';
import VenueMap from '../../components/VenueMap/VenueMap.jsx';
import micPlaceholder from '../../assets/icons/microphone placeholder.png';
import { getConcertById, mapConcertDetailToView } from '../../api/client.js';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/scrollLock.js';
import './ConcertPage.css';
import '../../App.css';

const parseConcertId = (rawId) => {
    const id = Number.parseInt(rawId ?? '', 10);
    return Number.isFinite(id) && id > 0 ? id : null;
};

const ConcertPage = () => {
    const { id: rawId } = useParams();
    const concertId = parseConcertId(rawId);
    const navigate = useNavigate();
    const location = useLocation();

    const [concert, setConcert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [buyModalOpen, setBuyModalOpen] = useState(false);

    const buyButtonRef = useRef(null);
    const closeButtonRef = useRef(null);

    const handleClose = useCallback(() => {
        const background = location.state?.backgroundLocation;
        if (background) {
            navigate(background);
            return;
        }
        navigate('/', { replace: true });
    }, [navigate, location.state]);

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
        lockBodyScroll();
        closeButtonRef.current?.focus();

        return () => {
            unlockBodyScroll();
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !buyModalOpen) {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleClose, buyModalOpen]);

    const handleBuyClick = () => {
        setBuyModalOpen(true);
    };

    const handleBuyModalClose = () => {
        setBuyModalOpen(false);
        buyButtonRef.current?.focus();
    };

    const dialogTitle = loading
        ? 'Концерт'
        : error
          ? 'Концерт'
          : concert?.title ?? 'Концерт';

    return (
        <div className="concert-modal__overlay" onClick={handleClose}>
            <div
                className="concert-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="concert-modal-title"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="concert-modal__header">
                    <h2 id="concert-modal-title" className="concert-modal__heading">
                        {dialogTitle}
                    </h2>
                    <button
                        ref={closeButtonRef}
                        type="button"
                        className="concert-modal__close"
                        onClick={handleClose}
                        aria-label="Закрыть"
                    >
                        ✕
                    </button>
                </header>

                <div className="concert-modal__body">
                    {loading && (
                        <LoadingState label="Загрузка концерта" size="lg" variant="block" className="concert-page__loading" />
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
                            <div className="concert-page__hero-media concert-page__hero-media--placeholder">
                                <img
                                    className="concert-page__hero concert-page__hero--placeholder"
                                    src={micPlaceholder}
                                    alt=""
                                    aria-hidden="true"
                                />
                            </div>

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
                                                <li
                                                    key={`${ticket.name}-${ticket.sortOrder}`}
                                                    className="concert-page__ticket"
                                                >
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
                </div>

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

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './BuyTicketModal.css';
import '../../App.css';

const BuyTicketModal = ({ isOpen, onClose, concertTitle, minPrice }) => {
    const closeButtonRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        closeButtonRef.current?.focus();

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="buy-ticket-modal__overlay" onClick={onClose}>
            <div
                className="buy-ticket-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="buy-ticket-modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="buy-ticket-modal__header">
                    <h2 id="buy-ticket-modal-title" className="buy-ticket-modal__title">
                        Покупка билетов
                    </h2>
                    <button
                        type="button"
                        className="buy-ticket-modal__close"
                        onClick={onClose}
                        aria-label="Закрыть"
                    >
                        ✕
                    </button>
                </header>

                <div className="buy-ticket-modal__body">
                    <p className="buy-ticket-modal__text">
                        Оплата будет доступна в следующей версии RuRave. Сейчас вы можете
                        сохранить мероприятие в закладки браузера.
                    </p>
                    <p className="buy-ticket-modal__concert">
                        <span className="buy-ticket-modal__label">Концерт:</span> {concertTitle}
                    </p>
                    <p className="buy-ticket-modal__price">от {minPrice} руб.</p>
                </div>

                <footer className="buy-ticket-modal__footer">
                    <button
                        ref={closeButtonRef}
                        type="button"
                        className="buy-ticket-modal__primary"
                        onClick={onClose}
                    >
                        Понятно
                    </button>
                    <Link to="/" className="buy-ticket-modal__secondary page__link" onClick={onClose}>
                        На главную
                    </Link>
                </footer>
            </div>
        </div>
    );
};

export default BuyTicketModal;

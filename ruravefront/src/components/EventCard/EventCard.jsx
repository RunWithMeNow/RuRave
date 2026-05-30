import { useState } from 'react';
import { Link } from 'react-router-dom';
import './EventCard.css';
import '../../App.css';

const EventCard = ({ id, imgsrc, title, date, place, artist, cost }) => {
    const [imageError, setImageError] = useState(false);

    return (
        <article className="event-card">
            <img
                className={`event-card__image${imageError ? ' event-card__image--fallback' : ''}`}
                src={imgsrc}
                alt={title}
                loading="lazy"
                onError={() => setImageError(true)}
            />
            <h3 className="event-card__title">{title}</h3>
            <ul className="event-card__list">
                <li className="event-card__info">
                    <img
                        className="event-card__icon"
                        src="/src/assets/icons/date.png"
                        alt=""
                    />
                    <p className="event-card__text">{date}</p>
                </li>
                <li className="event-card__info">
                    <img
                        className="event-card__icon"
                        src="/src/assets/icons/place.png"
                        alt=""
                    />
                    <p className="event-card__text">{place}</p>
                </li>
                <li className="event-card__info">
                    <img
                        className="event-card__icon"
                        src="/src/assets/icons/microphone.png"
                        alt=""
                    />
                    <p className="event-card__text">{artist}</p>
                </li>
            </ul>
            <div className="event-card__price-container">
                <p className="event-card__price">от {cost} руб.</p>
                <Link
                    to={`/concert/${id}`}
                    className="event-card__button"
                    aria-label={`Подробнее о концерте «${title}»`}
                >
                    Подробнее
                </Link>
            </div>
        </article>
    );
};

export default EventCard;

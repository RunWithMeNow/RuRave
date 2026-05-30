import { Link, useLocation } from 'react-router-dom';
import micPlaceholder from '../../assets/icons/microphone placeholder.png';
import './EventCard.css';
import '../../App.css';

const EventCard = ({ id, title, date, place, artist, cost }) => {
    const location = useLocation();

    return (
        <article className="event-card">
            <div className="event-card__media event-card__media--placeholder">
                <img
                    className="event-card__image event-card__image--placeholder"
                    src={micPlaceholder}
                    alt=""
                    loading="lazy"
                    aria-hidden="true"
                />
            </div>
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
                    state={{ backgroundLocation: location }}
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

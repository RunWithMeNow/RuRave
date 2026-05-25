import './EventCard.css';
import '../../App.css';

const EventCard = (props) => {
    const {
        id,
        imgsrc,
        title,
        date,
        place,
        artist,
        cost,
    } = props
    return (
        <div className="event-card">
            <img className="event-card__image" src={imgsrc}></img>
            <h3 className="event-card__title">{title}</h3>
            <ul className="event-card__list">
                <li className="event-card__info">
                    <img className="event-card__icon"
                     src="/src/assets/icons/date.png"/>
                    <p className="event-card__text">{date}</p>
                </li>
                <li className="event-card__info">
                    <img className="event-card__icon" 
                     src="/src/assets/icons/place.png"/>
                    <p className="event-card__text">{place}</p>
                </li>
                <li className="event-card__info">
                    <img className="event-card__icon"
                     src="/src/assets/icons/microphone.png"/>
                    <p className="event-card__text">{artist}</p>
                </li>
            </ul>
            <div className="event-card__price-container">
                <p className="event-card__price">от {cost} руб.</p>
                <button className="event-card__button">Подробнее</button>
            </div>            
        </div>
    )
}
export default EventCard
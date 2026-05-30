import EventCard from '../EventCard/EventCard.jsx';
import './EventList.css';
import '../../App.css';

const STAGGER_PAGE_SIZE = 12;
const STAGGER_STEP_S = 0.065;

const EventList = ({ concerts = [], animate = true }) => {
    return (
        <ul className={`concerts__list${animate ? ' concerts__list--animate' : ''}`}>
            {concerts.map((concert, index) => (
                <li
                    className="concerts__list-item"
                    key={concert.id}
                    style={
                        animate
                            ? {
                                  animationDelay: `${(index % STAGGER_PAGE_SIZE) * STAGGER_STEP_S}s`,
                              }
                            : undefined
                    }
                >
                    <EventCard {...concert} />
                </li>
            ))}
        </ul>
    );
};

export default EventList;

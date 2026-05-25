import EventCard from '../EventCard/EventCard.jsx';
import './EventList.css';
import '../../App.css';

const EventList = (props) => {
   const{
        concerts = [],
    }=props 
    return(
        <div>
            <ul className='concerts__list'>
                {concerts.map((concert) => (
                    <EventCard
                        className='concerts__list-item'
                        key={concert.id}
                        {...concert}
                    />
                ))}
            </ul>
        </div>
    )
}
export default EventList
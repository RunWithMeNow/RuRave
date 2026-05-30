import EventCardSkeleton from './EventCardSkeleton.jsx';
import '../EventList/EventList.css';
import '../../App.css';

const SKELETON_COUNT = 6;

const EventCardSkeletonList = ({ count = SKELETON_COUNT }) => {
    return (
        <ul className="concerts__list" aria-hidden="true">
            {Array.from({ length: count }, (_, index) => (
                <li className="concerts__list-item" key={index}>
                    <EventCardSkeleton />
                </li>
            ))}
        </ul>
    );
};

export default EventCardSkeletonList;

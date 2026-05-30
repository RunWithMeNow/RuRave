import './EventCardSkeleton.css';
import '../../App.css';

const EventCardSkeleton = () => {
    return (
        <article className="event-card-skeleton" aria-hidden="true">
            <div className="event-card-skeleton__poster skeleton-shimmer" />
            <div className="event-card-skeleton__title skeleton-shimmer" />
            <div className="event-card-skeleton__lines">
                <div className="event-card-skeleton__line skeleton-shimmer" />
                <div className="event-card-skeleton__line skeleton-shimmer" />
                <div className="event-card-skeleton__line skeleton-shimmer" />
            </div>
            <div className="event-card-skeleton__footer">
                <div className="event-card-skeleton__price skeleton-shimmer" />
                <div className="event-card-skeleton__button skeleton-shimmer" />
            </div>
        </article>
    );
};

export default EventCardSkeleton;

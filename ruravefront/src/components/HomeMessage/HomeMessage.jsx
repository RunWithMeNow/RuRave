import './HomeMessage.css';
import '../../App.css';

const icons = {
    search: (
        <svg className="home-message__svg" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M16 16l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    calendar: (
        <svg className="home-message__svg" viewBox="0 0 24 24" aria-hidden="true">
            <rect
                x="4"
                y="5"
                width="16"
                height="15"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <path d="M4 9h16M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    error: (
        <svg className="home-message__svg" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
};

const HomeMessage = ({
    variant = 'empty',
    icon = 'search',
    title,
    hint,
    onRetry,
    retryLabel = 'Повторить',
}) => {
    const role = variant === 'error' ? 'alert' : 'status';

    return (
        <div className={`home-message home-message--${variant}`} role={role}>
            <div className="home-message__icon">{icons[icon] ?? icons.search}</div>
            <p className="home-message__title">{title}</p>
            {hint && <p className="home-message__hint">{hint}</p>}
            {onRetry && (
                <button type="button" className="home-message__retry" onClick={onRetry}>
                    {retryLabel}
                </button>
            )}
        </div>
    );
};

export default HomeMessage;

import './Spinner.css';

const Spinner = ({ size = 'md', className = '', label = 'Загрузка' }) => {
    return (
        <span
            className={['spinner', `spinner--${size}`, className].filter(Boolean).join(' ')}
            role="status"
            aria-label={label}
        >
            <span className="spinner__ring" aria-hidden="true" />
        </span>
    );
};

export default Spinner;

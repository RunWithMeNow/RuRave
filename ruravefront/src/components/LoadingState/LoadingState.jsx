import Spinner from '../Spinner/Spinner.jsx';
import './LoadingState.css';

const LoadingState = ({
    label = 'Загрузка',
    size = 'md',
    variant = 'block',
    className = '',
}) => {
    return (
        <div
            className={[
                'loading-state',
                variant !== 'inline' && `loading-state--${variant}`,
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            aria-busy="true"
            aria-label={label}
        >
            <Spinner size={size} label={label} />
        </div>
    );
};

export default LoadingState;

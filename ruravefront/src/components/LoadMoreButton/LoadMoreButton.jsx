import Spinner from '../Spinner/Spinner.jsx';
import './LoadMoreButton.css';
import '../../App.css';

const LoadMoreButton = ({ onClick, loading = false, disabled = false }) => {
    return (
        <div className="load-more">
            <button
                type="button"
                className="load-more__button"
                onClick={onClick}
                disabled={disabled || loading}
                aria-busy={loading}
            >
                {loading ? (
                    <>
                        <Spinner size="sm" label="Загрузка" />
                        <span className="sr-only">Загрузка</span>
                    </>
                ) : (
                    'Загрузить ещё'
                )}
            </button>
        </div>
    );
};

export default LoadMoreButton;

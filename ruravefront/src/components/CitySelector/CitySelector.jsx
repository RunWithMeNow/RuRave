import { useCallback, useEffect, useId, useRef, useState } from 'react';
import './CitySelector.css';
import '../../App.css';

const CitySelector = ({
    cities = [],
    selectedCityId = null,
    onCitySelect,
    onCityReset,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const triggerRef = useRef(null);
    const searchInputRef = useRef(null);
    const dialogTitleId = useId();

    const selectedCity = cities.find((city) => city.id === selectedCityId) ?? null;

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setSearchTerm('');
        triggerRef.current?.focus();
    }, []);

    const openModal = () => {
        setIsOpen(true);
    };

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const focusTimer = requestAnimationFrame(() => {
            searchInputRef.current?.focus();
        });

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            cancelAnimationFrame(focusTimer);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, closeModal]);

    const handleCitySelect = (city) => {
        onCitySelect?.(city);
        closeModal();
    };

    const filteredCities = cities.filter((city) =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const triggerLabel = disabled
        ? 'Загрузка городов...'
        : selectedCity
          ? selectedCity.name
          : 'Выбери город';

    const canReset = Boolean(selectedCityId) && !disabled && onCityReset;

    const handleResetClick = () => {
        onCityReset?.();
        closeModal();
    };

    return (
        <div className="city-selector">
            <div className="city-selector__controls">
                <button
                    ref={triggerRef}
                    type="button"
                    className={[
                        'city-selector__trigger',
                        disabled && 'city-selector__trigger--disabled',
                        !disabled && !selectedCity && 'city-selector__trigger--placeholder',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    onClick={() => !disabled && (isOpen ? closeModal() : openModal())}
                    disabled={disabled}
                    aria-expanded={isOpen}
                    aria-haspopup="dialog"
                >
                    <img
                        className="city-selector__icon"
                        src="/src/assets/icons/place.png"
                        alt=""
                    />
                    {triggerLabel}
                    <span className={`city-selector__arrow ${isOpen ? 'open' : ''}`} aria-hidden="true">
                        ▼
                    </span>
                </button>

                {canReset && (
                    <button
                        type="button"
                        className="city-selector__reset"
                        onClick={handleResetClick}
                        aria-label="Сбросить фильтр по городу"
                        title="Сбросить город"
                    >
                        ✕
                    </button>
                )}
            </div>

            {isOpen && !disabled && (
                <div className="city-selector__overlay" onClick={closeModal}>
                    <div
                        className="city-selector__modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={dialogTitleId}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="city-selector__header">
                            <h3 id={dialogTitleId} className="city-selector__title">
                                Выберите город
                            </h3>
                            <button
                                type="button"
                                className="city-selector__close"
                                onClick={closeModal}
                                aria-label="Закрыть"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="city-selector__search">
                            <label htmlFor={`${dialogTitleId}-search`} className="sr-only">
                                Поиск города
                            </label>
                            <input
                                ref={searchInputRef}
                                id={`${dialogTitleId}-search`}
                                type="search"
                                placeholder="Поиск города..."
                                className="city-selector__search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <ul className="city-selector__list" role="listbox" aria-label="Список городов">
                            {filteredCities.length > 0 ? (
                                filteredCities.map((city) => (
                                    <li key={city.id} role="presentation">
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={selectedCityId === city.id}
                                            className={`city-selector__item ${selectedCityId === city.id ? 'city-selector__item--selected' : ''}`}
                                            onClick={() => handleCitySelect(city)}
                                        >
                                            {city.name}
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <li className="city-selector__empty" role="status">
                                    Ничего не найдено
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CitySelector;

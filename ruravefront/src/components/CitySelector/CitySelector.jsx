import { useState } from 'react';
import './CitySelector.css';
import '../../App.css';

const CitySelector = ({
    cities = [],
    selectedCityId = null,
    onCitySelect,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const selectedCity = cities.find((city) => city.id === selectedCityId) ?? null;

    const handleCitySelect = (city) => {
        onCitySelect?.(city);
        setIsOpen(false);
        setSearchTerm('');
    };

    const filteredCities = cities.filter((city) =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="city-selector">
            <button
                type="button"
                className={`city-selector__trigger${disabled ? ' city-selector__trigger--disabled' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
            >
                <img
                    className="city-selector__icon"
                    src="/src/assets/icons/place.png"
                    alt=""
                />
                {disabled
                    ? 'Загрузка городов...'
                    : selectedCity
                      ? selectedCity.name
                      : 'Выберите город'}
                <span className={`city-selector__arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </button>

            {isOpen && !disabled && (
                <div className="city-selector__overlay" onClick={() => setIsOpen(false)}>
                    <div className="city-selector__modal" onClick={(e) => e.stopPropagation()}>
                        <div className="city-selector__header">
                            <h3 className="city-selector__title">Выберите город</h3>
                            <button
                                type="button"
                                className="city-selector__close"
                                onClick={() => setIsOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="city-selector__search">
                            <input
                                type="text"
                                placeholder="Поиск города..."
                                className="city-selector__search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <ul className="city-selector__list">
                            {filteredCities.length > 0 ? (
                                filteredCities.map((city) => (
                                    <li
                                        className={`city-selector__item ${selectedCityId === city.id ? 'city-selector__item--selected' : ''}`}
                                        key={city.id}
                                        onClick={() => handleCitySelect(city)}
                                    >
                                        {city.name}
                                    </li>
                                ))
                            ) : (
                                <li className="city-selector__empty">
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

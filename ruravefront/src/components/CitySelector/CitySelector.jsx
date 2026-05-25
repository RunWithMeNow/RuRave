import { useState } from 'react';
import './CitySelector.css';
import '../../App.css';

const CitySelector = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const {cities = []} = props;
    
    const handleCitySelect = (city) => {
        setSelectedCity(city);
        setIsOpen(false);
        setSearchTerm('');
    };
    
    const filteredCities = cities.filter(city => 
        city.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return (
        <div className="city-selector">
            <button 
                className="city-selector__trigger"
                onClick={() => setIsOpen(!isOpen)}>
                <img className="city-selector__icon" 
                     src="/src/assets/icons/place.png"/>
                {selectedCity ? selectedCity : 'Выберите город'}
                <span className={`city-selector__arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </button>

            {isOpen && (
                <div className="city-selector__overlay" onClick={() => setIsOpen(false)}>
                    <div className="city-selector__modal" onClick={(e) => e.stopPropagation()}>
                        <div className="city-selector__header">
                            <h3 className="city-selector__title">Выберите город</h3>
                            <button 
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
                                        className={`city-selector__item ${selectedCity === city ? 'city-selector__item--selected' : ''}`}
                                        key={city}
                                        onClick={() => handleCitySelect(city)}
                                    >
                                        {city}
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
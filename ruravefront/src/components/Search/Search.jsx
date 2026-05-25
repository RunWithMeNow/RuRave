import { useState } from 'react';
import CitySelector from '../CitySelector/CitySelector.jsx';
import './Search.css';
import '../../App.css';

const Search = ({
    onSearch,
    cities = [],
    citiesLoading = false,
    selectedCityId = null,
    onCityChange,
}) => {
    const [localSearchTerm, setLocalSearchTerm] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(localSearchTerm);
    };

    const handleInputChange = (e) => {
        setLocalSearchTerm(e.target.value);
    };

    return (
        <div className="search__wrapper">
            <CitySelector
                cities={cities}
                selectedCityId={selectedCityId}
                onCitySelect={onCityChange}
                disabled={citiesLoading}
            />
            <div className="search-artist__container">
                <form className="search__form" onSubmit={handleSubmit}>
                    <div className="search__container">
                        <input
                            className="search__input"
                            type="text"
                            id="artist"
                            name="artist"
                            placeholder="Имя исполнителя..."
                            value={localSearchTerm}
                            onChange={handleInputChange}
                            disabled={!selectedCityId || citiesLoading}
                        />
                        <button
                            className="search__button"
                            type="submit"
                            disabled={!selectedCityId || citiesLoading}
                        >
                            Найти
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Search;

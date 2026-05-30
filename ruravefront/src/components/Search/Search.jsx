import { useEffect, useRef, useState } from 'react';
import CitySelector from '../CitySelector/CitySelector.jsx';
import DateFilter from '../DateFilter/DateFilter.jsx';
import './Search.css';
import '../../App.css';

const DEBOUNCE_MS = 400;

const Search = ({
    onSearch,
    cities = [],
    citiesLoading = false,
    selectedCityId = null,
    onCityChange,
    onCityReset,
    dateFrom,
    dateTo,
    onDateRangeChange,
    concertDates = [],
    onCalendarMonthChange,
}) => {
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const debounceTimerRef = useRef(null);

    const isDisabled = citiesLoading;

    useEffect(() => {
        if (isDisabled) {
            return undefined;
        }

        debounceTimerRef.current = setTimeout(() => {
            onSearch(localSearchTerm);
        }, DEBOUNCE_MS);

        return () => {
            clearTimeout(debounceTimerRef.current);
        };
    }, [localSearchTerm, isDisabled, onSearch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        clearTimeout(debounceTimerRef.current);
        onSearch(localSearchTerm);
    };

    const handleInputChange = (e) => {
        setLocalSearchTerm(e.target.value);
    };

    return (
        <div className="search__wrapper search__wrapper--row">
            <CitySelector
                cities={cities}
                selectedCityId={selectedCityId}
                onCitySelect={onCityChange}
                onCityReset={onCityReset}
                disabled={citiesLoading}
            />
            <DateFilter
                dateFrom={dateFrom}
                dateTo={dateTo}
                onRangeChange={onDateRangeChange}
                concertDates={concertDates}
                onMonthChange={onCalendarMonthChange}
                disabled={citiesLoading}
            />
            <div className="search-artist__container">
                <form className="search__form" onSubmit={handleSubmit} aria-label="Поиск концертов по исполнителю">
                    <div className="search__container">
                        <label htmlFor="artist-search" className="sr-only">
                            Поиск исполнителя
                        </label>
                        <input
                            className="search__input"
                            type="search"
                            id="artist-search"
                            name="artist"
                            placeholder="Имя исполнителя..."
                            value={localSearchTerm}
                            onChange={handleInputChange}
                            disabled={isDisabled}
                        />
                        <button
                            className="search__button"
                            type="submit"
                            disabled={isDisabled}
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

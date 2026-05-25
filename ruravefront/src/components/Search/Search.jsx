import { useState } from 'react';
import CitySelector from '../CitySelector/CitySelector.jsx';
import './Search.css';
import '../../App.css';

const Search = ({onSearch}) => {
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const cities = ['Москва', 'Самара', 'Красноярск', 'Новосибирск', 'Братск',]
    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(localSearchTerm);
    };
      const handleInputChange = (e) => {
        setLocalSearchTerm(e.target.value);
    };
    return(
        <div className="search__wrapper">
            <CitySelector
            cities={cities}/>
            <div className='search-artist__container'>
                <form className="search__form" onSubmit={handleSubmit}>
                <div className="search__container">
                    <input className="search__input" 
                        type="text" id="artist" name="artist"
                        placeholder="Имя исполнителя..."
                        value={localSearchTerm}
                        onChange={handleInputChange}
                    />
                    <button className="search__button" type="submit">Найти</button>
                </div>
            </form>
            </div>
        </div>
    )
}

export default Search
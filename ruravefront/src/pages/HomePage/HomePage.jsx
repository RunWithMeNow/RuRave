import { useState } from 'react';
import EventList from '../../components/EventList/EventList.jsx';
import Search from '../../components/Search/Search.jsx';
import Banner from '../../components/Banner/Banner.jsx';
import './HomePage.css';
import '../../App.css';

const HomePage = () => {
    const concerts = [
        {id: 'c-1', imgsrc:'/src/assets/icons/concert.jpg', title: 'DCOnTour', date: '12.12.2026', place: 'Циркус', artist: 'DK', cost: '5000'},
        {id: 'c-2', imgsrc:'/src/assets/icons/concert.jpg', title: 'LidaSuperStar', date: '17.07.2026', place: 'Эрмитаж', artist: 'Lida', cost: '3000'},
        {id: 'c-3', imgsrc:'/src/assets/icons/concert.jpg', title: 'DCOnTour', date: '12.12.2026', place: 'Циркус', artist: 'DK', cost: '5000'},
        {id: 'c-4', imgsrc:'/src/assets/icons/concert.jpg', title: 'DCOnTour', date: '12.12.2026', place: 'Циркус', artist: 'DK', cost: '5000'},
        {id: 'c-5', imgsrc:'/src/assets/icons/concert.jpg', title: 'DCOnTour', date: '12.12.2026', place: 'Циркус', artist: 'DK', cost: '5000'},
        {id: 'c-6', imgsrc:'/src/assets/icons/concert.jpg', title: 'DCOnTour', date: '12.12.2026', place: 'Циркус', artist: 'DK', cost: '5000'},
        {id: 'c-7', imgsrc:'/src/assets/icons/concert.jpg', title: 'DCOnTour', date: '12.12.2026', place: 'Циркус', artist: 'DK', cost: '5000'},
        {id: 'c-8', imgsrc:'/src/assets/icons/concert.jpg', title: 'DCOnTour', date: '12.12.2026', place: 'Циркус', artist: 'DK', cost: '5000'},
        {id: 'c-9', imgsrc:'/src/assets/icons/concert.jpg', title: 'DCOnTour', date: '12.12.2026', place: 'Циркус', artist: 'DK', cost: '5000'},
        {id: 'c-10', imgsrc:'/src/assets/icons/concert.jpg', title: 'DCOnTour', date: '12.12.2026', place: 'Циркус', artist: 'DK', cost: '5000'},
        {id: 'c-11', imgsrc:'/src/assets/icons/concert.jpg', title: 'DCOnTour', date: '12.12.2026', place: 'Циркус', artist: 'DK', cost: '5000'},
    ]
    const [searchTerm, setSearchTerm] = useState('');
    const filteredConcerts = concerts.filter(concert =>
      concert.artist.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const handleSearch = (term) => {
        setSearchTerm(term);
    };
    return(
    <div className='home__container'>
      <Banner 
        imageUrl="https://hq-oboi.ru/photo/temnyy_i_stilnye_abstrakciya_na_rabochiy_stol_1920x1200.jpg"/>
      <Search onSearch={handleSearch}/>
      <EventList concerts={filteredConcerts} />
      {filteredConcerts.length === 0 && searchTerm && (
        <div className="no-results">
          <p>По запросу "{searchTerm}" ничего не найдено</p>
        </div>
      )}
    </div>
    )
}
export default HomePage
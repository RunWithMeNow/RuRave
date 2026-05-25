import { Link } from 'react-router-dom';
import './Header.css';
import '../../App.css';

const Header = () => {
    return(
        <div className='header__container'>
            <div className='header__logo-container'>
                <Link to="/">
                    <img className='header__logo' src="/src/assets/icons/logo.png" alt="Logo"/>
                </Link>
                <div className='header__title-container'>
                    <h1 className='header__title-white'>Ru</h1>
                    <h1 className='header__title-violet'>Rave</h1>
                </div>
            </div>
            <div className='header__page-container'>
                <Link to="/" className='header__page-link'>
                    <p className='header__page-text'>Home</p>
                </Link>
                <Link to="/about" className='header__page-link'>
                    <p className='header__page-text'>About</p>
                </Link>
            </div>
            <div className='header__lk-container'>
                <Link to="/profile" className='header__page-link'>
                    <p className='header__page-text'>Profile</p>
                </Link>
            </div>
        </div>
    )
}

export default Header;
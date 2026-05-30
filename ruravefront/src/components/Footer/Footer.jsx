import { Link, NavLink, useLocation } from 'react-router-dom';
import { handleAboutNavClick, handleAfishaNavClick } from '../../utils/homeNavScroll.js';
import './Footer.css';
import '../../App.css';

const Footer = () => {
    const location = useLocation();
    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="layout-container footer__inner">
                <div className="footer__top">
                    <NavLink to="/" end className="footer__brand" aria-label="RuRave — на главную">
                        <span className="footer__brand-white">Ru</span>
                        <span className="footer__brand-violet">Rave</span>
                    </NavLink>
                    <p className="footer__tagline">Афиша рейв-концертов в городах России</p>
                </div>

                <nav className="footer__nav" aria-label="Навигация в подвале">
                    <Link
                        to="/#afisha"
                        className="footer__link"
                        onClick={(event) => handleAfishaNavClick(event, location.pathname)}
                    >
                        Афиша
                    </Link>
                    <Link
                        to="/#about"
                        className={`footer__link${location.hash === '#about' ? ' footer__link--active' : ''}`}
                        onClick={(event) => handleAboutNavClick(event, location.pathname)}
                    >
                        О проекте
                    </Link>
                </nav>

                <div className="footer__bottom">
                    <p className="footer__copy">
                        © {year} RuRave. Учебный проект.
                    </p>
                    <p className="footer__map-note">
                        Карты ©{' '}
                        <a
                            href="https://www.openstreetmap.org/copyright"
                            className="footer__external"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            OpenStreetMap
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

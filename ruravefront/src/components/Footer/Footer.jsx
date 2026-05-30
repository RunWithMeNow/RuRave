import { NavLink } from 'react-router-dom';
import './Footer.css';
import '../../App.css';

const navLinkClassName = ({ isActive }) =>
    `footer__link${isActive ? ' footer__link--active' : ''}`;

const Footer = () => {
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
                    <NavLink to="/" end className={navLinkClassName}>
                        Афиша
                    </NavLink>
                    <NavLink to="/about" className={navLinkClassName}>
                        О проекте
                    </NavLink>
                    <NavLink to="/profile" className={navLinkClassName}>
                        Профиль
                    </NavLink>
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

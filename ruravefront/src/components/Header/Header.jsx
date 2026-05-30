import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { handleAboutNavClick, handleAfishaNavClick } from '../../utils/homeNavScroll.js';
import { lockBodyScroll, unlockBodyScroll } from '../../utils/scrollLock.js';
import './Header.css';
import '../../App.css';

const Header = () => {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = useCallback(() => {
        setMenuOpen(false);
    }, []);

    const toggleMenu = () => {
        setMenuOpen((open) => !open);
    };

    useEffect(() => {
        if (!menuOpen) {
            return undefined;
        }

        lockBodyScroll();

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeMenu();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            unlockBodyScroll();
        };
    }, [menuOpen, closeMenu]);

    const navLinks = (onNavigate = undefined) => (
        <>
            <Link
                to="/#afisha"
                className="header__page-link"
                onClick={(event) => handleAfishaNavClick(event, location.pathname, onNavigate)}
            >
                <span className="header__page-text">Афиша</span>
            </Link>
            <Link
                to="/#about"
                className={`header__page-link${location.hash === '#about' ? ' header__page-link--active' : ''}`}
                onClick={(event) => handleAboutNavClick(event, location.pathname, onNavigate)}
            >
                <span className="header__page-text">О проекте</span>
            </Link>
        </>
    );

    return (
        <header className="header__container">
            <NavLink to="/" end className="header__brand" aria-label="RuRave — на главную">
                <img className="header__logo" src="/src/assets/icons/logo.png" alt="" />
                <span className="header__brand-title">
                    <span className="header__title-white">Ru</span>
                    <span className="header__title-violet">Rave</span>
                </span>
            </NavLink>

            <nav
                className="header__page-container header__page-container--desktop"
                aria-label="Основная навигация"
            >
                {navLinks()}
            </nav>

            <div className="header__actions">
                <button
                    type="button"
                    className="header__menu-toggle"
                    aria-expanded={menuOpen}
                    aria-controls="header-mobile-nav"
                    aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
                    onClick={toggleMenu}
                >
                    <span aria-hidden="true">☰</span>
                </button>
            </div>

            {menuOpen && (
                <div className="header__overlay" onClick={closeMenu}>
                    <nav
                        id="header-mobile-nav"
                        className="header__mobile-nav"
                        aria-label="Мобильная навигация"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="header__mobile-nav-header">
                            <span className="header__mobile-nav-title">Меню</span>
                            <button
                                type="button"
                                className="header__mobile-close"
                                onClick={closeMenu}
                                aria-label="Закрыть меню"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="header__mobile-links">{navLinks(closeMenu)}</div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;

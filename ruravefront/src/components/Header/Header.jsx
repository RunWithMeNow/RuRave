import { useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext.jsx';
import './Header.css';
import '../../App.css';

const navLinkClassName = ({ isActive }) =>
    `header__page-link${isActive ? ' header__page-link--active' : ''}`;

const SCROLL_THRESHOLD = 12;

const Header = () => {
    const { toggleTheme, isDark } = useTheme();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const closeMenu = useCallback(() => {
        setMenuOpen(false);
    }, []);

    const toggleMenu = () => {
        setMenuOpen((open) => !open);
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > SCROLL_THRESHOLD);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (!menuOpen) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeMenu();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [menuOpen, closeMenu]);

    const navLinks = (onNavigate = undefined) => (
        <>
            <NavLink to="/" end className={navLinkClassName} onClick={onNavigate}>
                <span className="header__page-text">Афиша</span>
            </NavLink>
            <NavLink to="/about" className={navLinkClassName} onClick={onNavigate}>
                <span className="header__page-text">О проекте</span>
            </NavLink>
        </>
    );

    return (
        <header
            className={`header__container${scrolled ? ' header__container--scrolled' : ''}`}
        >
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

                <div className="header__lk-container">
                    <button
                        type="button"
                        className="header__theme-toggle"
                        onClick={toggleTheme}
                        aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
                        aria-pressed={!isDark}
                        title={isDark ? 'Светлая тема' : 'Тёмная тема'}
                    >
                        <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
                    </button>
                    <NavLink to="/profile" className={navLinkClassName}>
                        <span className="header__page-text">Профиль</span>
                    </NavLink>
                </div>
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

const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
    });
};

export const scrollToAfishaSection = () => scrollToSection('afisha');

export const scrollToCitiesSection = () => scrollToSection('cities');

export const scrollToVenuesSection = () => scrollToSection('venues');

export const scrollToAboutSection = () => scrollToSection('about');

export const handleAfishaNavClick = (event, pathname, onNavigate) => {
    onNavigate?.();
    if (pathname === '/') {
        event.preventDefault();
        scrollToAfishaSection();
        window.history.replaceState(null, '', '/#afisha');
    }
};

export const handleCitiesNavClick = (event, pathname, onNavigate) => {
    onNavigate?.();
    if (pathname === '/') {
        event.preventDefault();
        scrollToCitiesSection();
        window.history.replaceState(null, '', '/#cities');
    }
};

export const handleVenuesNavClick = (event, pathname, onNavigate) => {
    onNavigate?.();
    if (pathname === '/') {
        event.preventDefault();
        scrollToVenuesSection();
        window.history.replaceState(null, '', '/#venues');
    }
};

export const handleAboutNavClick = (event, pathname, onNavigate) => {
    onNavigate?.();
    if (pathname === '/') {
        event.preventDefault();
        scrollToAboutSection();
        window.history.replaceState(null, '', '/#about');
    }
};

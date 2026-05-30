const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
    });
};

export const scrollToAfishaSection = () => scrollToSection('afisha');

export const scrollToAboutSection = () => scrollToSection('about');

export const handleAfishaNavClick = (event, pathname, onNavigate) => {
    onNavigate?.();
    if (pathname === '/') {
        event.preventDefault();
        scrollToAfishaSection();
        window.history.replaceState(null, '', '/#afisha');
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

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage/HomePage.jsx';
import ProfilePage from './pages/ProfilePage/ProfilePage.jsx';
import CityPage from './pages/CityPage/CityPage.jsx';
import VenuePage from './pages/VenuePage/VenuePage.jsx';
import ConcertPage from './pages/ConcertPage/ConcertPage.jsx';
import Header from './components/Header/Header.jsx';
import Footer from './components/Footer/Footer.jsx';
import { getConcertBackgroundLocation, isConcertDetailPath } from './utils/concertRoute.js';
import { HomeAfishaNavProvider } from './context/HomeAfishaNavContext.jsx';

function AppRoutes() {
  const location = useLocation();
  const backgroundLocation = getConcertBackgroundLocation(location);
  const showConcertModal = isConcertDetailPath(location.pathname);

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<Navigate to="/#about" replace />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/venue/:id" element={<VenuePage />} />
        <Route path="/city/:slug" element={<CityPage />} />
      </Routes>

      {showConcertModal ? (
        <Routes>
          <Route path="/concert/:id" element={<ConcertPage />} />
        </Routes>
      ) : null}
    </>
  );
}

function App() {
  return (
    <Router>
      <HomeAfishaNavProvider>
        <div className="App">
          <a href="#main-content" className="skip-link">
            Перейти к содержимому
          </a>
          <Header />
          <main id="main-content" tabIndex={-1}>
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </HomeAfishaNavProvider>
    </Router>
  );
}
export default App

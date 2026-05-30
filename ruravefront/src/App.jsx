import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage/HomePage.jsx';
import ProfilePage from './pages/ProfilePage/ProfilePage.jsx';
import ConcertPage from './pages/ConcertPage/ConcertPage.jsx';
import Header from './components/Header/Header.jsx';
import Footer from './components/Footer/Footer.jsx';
import { getConcertBackgroundLocation, isConcertDetailPath } from './utils/concertRoute.js';

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
    </Router>
  );
}
export default App

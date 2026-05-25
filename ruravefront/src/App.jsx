import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage/HomePage.jsx';
import Header from './components/Header/Header.jsx';

const AboutPage = () => <div><h1>About Page</h1></div>;
const ProfilePage = () => <div><h1>Profile Page</h1></div>;

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App
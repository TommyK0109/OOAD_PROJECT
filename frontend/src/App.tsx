import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import HomePage from './pages/Home/HomePage';
import MovieDetail from './pages/MovieDetail/MovieDetail';
import Footer from './components/Footer/Footer';

// Create a wrapper component that handles the conditional rendering
const AppContent = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/popular';
  
  return (
    <div className="app">
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/popular" element={<HomePage />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          {/* Add other routes as needed */}
          <Route path="*" element={<div className="not-found">Page Not Found</div>} />
        </Routes>
      </div>
      {/* Only show Footer when NOT on home page */}
      {!isHomePage && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;


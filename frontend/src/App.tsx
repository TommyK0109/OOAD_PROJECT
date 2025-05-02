import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import HomePage from './pages/Home/HomePage';
import MovieDetail from './pages/MovieDetail/MovieDetail';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/popular" element={<HomePage />} />
          <Route path="/movies/:id" element={<MovieDetail />} />
          {/* Add other routes as needed */}
          <Route path="*" element={<div className="not-found">Page Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;


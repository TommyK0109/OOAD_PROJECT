import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import HomePage from './pages/Home/HomePage';
import MovieDetail from './pages/MovieDetail/MovieDetail';
import WatchPage from './pages/Watch/WatchPage';
import WatchlistPage from './pages/Watchlist/Watchlist';
import Footer from './components/Footer/Footer';
import { WebSocketProvider } from './context/WebSocketContext';
import { WatchlistProvider } from './context/WatchlistContext';

// Create a wrapper component that handles the conditional rendering
const AppContent = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/popular';
  const isWatchPage = location.pathname.includes('/watch/') || location.pathname.includes('/watch/solo/');

  return (
    <div className="app">
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/popular" element={<HomePage />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/watch/:partyId" element={<WatchPage />} />
          <Route path="/watch/solo/:movieId" element={<WatchPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
        </Routes>
      </div>
      {(!isHomePage && !isWatchPage) && <Footer />}
    </div>
  );
};

const App = () => {
  const WEBSOCKET_URL = 'ws://localhost:8080/ws';

  return (
    <Router>
      <WebSocketProvider url={WEBSOCKET_URL}>
        <WatchlistProvider>
          <AppContent />
        </WatchlistProvider>
      </WebSocketProvider>
    </Router>
  );
};

export default App;


import { useState, useEffect } from 'react';
import { useWatchlist } from '../../context/WatchlistContext';
import MovieCard from '../../components/MovieCard/MovieCard';
import './Watchlist.css';

const Watchlist = () => {
  const { watchlist } = useWatchlist();
  const [sortedWatchlist, setSortedWatchlist] = useState([...watchlist]);
  const [sortBy, setSortBy] = useState('dateAdded'); // Options: 'dateAdded', 'title', 'year'

  // Sort watchlist items when sorting preference changes or watchlist updates
  useEffect(() => {
    let sorted = [...watchlist];
    
    switch(sortBy) {
      case 'title':
        sorted = sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'year':
        sorted = sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
        break;
      case 'dateAdded':
      default:
        // Maintain current order (most recently added first)
        break;
    }
    
    setSortedWatchlist(sorted);
  }, [watchlist, sortBy]);

  if (watchlist.length === 0) {
    return (
      <div className="watchlist">
        <h1 className="page-title">Your Watchlist</h1>
        <div className="empty-watchlist">
          <div className="empty-watchlist__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h2>Your watchlist is empty</h2>
          <p>Click the bookmark icon on any movie to add it to your watchlist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="watchlist">
      <div className="watchlist-header">
        <h1 className="page-title">Your Watchlist</h1>
        <div className="watchlist-controls">
          <span className="watchlist-count">{watchlist.length} {watchlist.length === 1 ? 'item' : 'items'}</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="watchlist-sort"
          >
            <option value="dateAdded">Recently Added</option>
            <option value="title">Title A-Z</option>
            <option value="year">Year (Newest)</option>
          </select>
        </div>
      </div>
      
      <div className="movie-grid">
        {sortedWatchlist.map(movie => (
          <MovieCard 
            key={movie.id}
            id={movie.id}
            title={movie.title}
            imageUrl={movie.posterUrl}
            year={movie.year}
            rating={movie.rating}
            genres={movie.genres}
          />
        ))}
      </div>
    </div>
  );
};

export default Watchlist;
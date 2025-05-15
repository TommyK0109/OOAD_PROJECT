import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Movie } from '../types/movie';

interface WatchlistContextType {
  watchlist: Movie[];
  addToWatchlist: (movie: Movie) => void;
  removeFromWatchlist: (movieId: string) => void;
  isInWatchlist: (movieId: string) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider = ({ children }: { children: ReactNode }) => {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  
  // Load watchlist from localStorage on initial render
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('watchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);
  
  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);
  
  const addToWatchlist = (movie: Movie) => {
    setWatchlist(prev => {
      if (prev.some(item => item.id === movie.id)) {
        return prev;
      }
      return [...prev, movie];
    });
  };
  
  const removeFromWatchlist = (movieId: string) => {
    setWatchlist(prev => prev.filter(item => item.id !== movieId));
  };
  
  const isInWatchlist = (movieId: string) => {
    return watchlist.some(item => item.id === movieId);
  };
  
  return (
    <WatchlistContext.Provider value={{ 
      watchlist, 
      addToWatchlist, 
      removeFromWatchlist, 
      isInWatchlist 
    }}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
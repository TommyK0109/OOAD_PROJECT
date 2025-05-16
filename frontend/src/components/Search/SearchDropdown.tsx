import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Movie } from '../../types/movie';
import './SearchDropdown.css';

interface SearchDropdownProps {
  query: string;
  onClose: () => void;
}

const SearchDropdown = ({ query, onClose }: SearchDropdownProps) => {
  const [results, setResults] = useState<Movie[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch search results when query changes
  useEffect(() => {
    const searchMovies = async () => {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      
      // For demo purposes - mock data that matches the Movie type
      setTimeout(() => {
        const mockResults: Movie[] = [
          { 
            id: '101', 
            title: 'Final Destination', 
            posterUrl: 'https://images.justwatch.com/poster/242592844/s166/family-guy.avif', 
            year: 2000,
            imdbRating: '6.7',
            genres: ['Horror', 'Thriller'],
            runtime: '98 min'
          },
          { 
            id: '102', 
            title: 'Final Fantasy', 
            posterUrl: 'https://images.justwatch.com/poster/310154566/s166/solo-leveling.avif', 
            year: 2001,
            imdbRating: '6.4',
            genres: ['Animation', 'Adventure', 'Sci-Fi'],
            runtime: '106 min'
          },
          { 
            id: '103', 
            title: 'Final Destination 2', 
            posterUrl: 'https://images.justwatch.com/poster/244160758/s166/angels-and-demons.avif', 
            year: 2003,
            imdbRating: '6.2',
            genres: ['Horror', 'Thriller'],
            runtime: '90 min'
          },
          { 
            id: '104', 
            title: 'Final Destination: Bloodlines', 
            posterUrl: 'https://images.justwatch.com/poster/328203307/s166/a-minecraft-movie.avif', 
            year: 2025,
            imdbRating: '7.1',
            genres: ['Horror', 'Thriller', 'Mystery'],
            runtime: '110 min'
          },
        ].filter(movie => 
          movie.title.toLowerCase().includes(query.toLowerCase())
        );
        
        setResults(mockResults);
        setIsLoading(false);
      }, 300);
    };

    // Load trending searches when no query
    const fetchTrending = () => {
      // Mock trending searches as Movie objects
      const trendingMovies: Movie[] = [
        { id: '201', title: 'Poker Face', posterUrl: 'https://example.com/poster1.jpg' },
        { id: '202', title: 'Andor', posterUrl: 'https://example.com/poster2.jpg' },
        { id: '203', title: 'The Last of Us', posterUrl: 'https://example.com/poster3.jpg' },
        { id: '204', title: 'Your Friends & Neighbors', posterUrl: 'https://example.com/poster4.jpg' },
        { id: '205', title: 'MobLand', posterUrl: 'https://example.com/poster5.jpg' },
        { id: '206', title: 'The Studio', posterUrl: 'https://example.com/poster6.jpg' },
        { id: '207', title: 'Conclave', posterUrl: 'https://example.com/poster7.jpg' },
        { id: '208', title: 'The Handmaid\'s Tale', posterUrl: 'https://example.com/poster8.jpg' },
        { id: '209', title: 'Nonnas', posterUrl: 'https://example.com/poster9.jpg' },
        { id: '210', title: 'Hacks', posterUrl: 'https://example.com/poster10.jpg' }
      ];
      setTrendingSearches(trendingMovies);
    };

    if (query.length >= 2) {
      searchMovies();
    } else if (!query) {
      fetchTrending();
    }
  }, [query]);

  // Highlight matching text
  const highlightMatch = (text: string) => {
    if (!query || query.length < 2) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? <span key={index} className="highlight">{part}</span> : part
    );
  };

  return (
    <div className="search-dropdown">
      {!query && (
        <>
          <div className="search-section">
            <h3>No recent searches</h3>
          </div>
          <div className="search-section">
            <h3>Trending searches</h3>
            <div className="trending-searches">
              {trendingSearches.map(movie => (
                <Link 
                  key={movie.id}
                  to={`/movie/${movie.id}`}
                  className="trending-item"
                  onClick={onClose}
                >
                  <span className="search-icon">🔍</span> {movie.title}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {query && query.length >= 2 && (
        <div className="search-section">
          <h3>MOVIES & TV SHOWS</h3>
          {isLoading ? (
            <div className="search-loading">Loading...</div>
          ) : results.length > 0 ? (
            <div className="search-results">
              {results.map(movie => (
                <Link 
                  key={movie.id} 
                  to={`/movie/${movie.id}`} 
                  className="search-result-item"
                  onClick={onClose}
                >
                  <img src={movie.posterUrl} alt={movie.title} className="result-poster" />
                  <div className="result-info">
                    <div className="result-title">{highlightMatch(movie.title)}</div>
                    <div className="result-meta">
                      movie, {movie.year}
                      {movie.imdbRating && <span> • {movie.imdbRating}⭐</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="no-results">No results found for "{query}"</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
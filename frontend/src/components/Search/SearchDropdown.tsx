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
      
      try {
        // Real API call to backend
        const response = await fetch(`/api/movies/search?query=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
          throw new Error('Search failed');
        }
        
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Error searching movies:', error);
        // Fallback to movies from seed data if API fails
        const fallbackResults = [
          { 
            id: '1', 
            title: 'Angels and Demons',
            posterUrl: 'https://images.justwatch.com/poster/244160758/s166/angels-and-demons.avif',
            year: 2009,
            imdbRating: '6.7',
            genres: ['Action', 'Thriller'],
            runtime: '138min'
          },
          { 
            id: '2', 
            title: 'Minecraft Movie',
            posterUrl: 'https://images.justwatch.com/poster/328203307/s166/a-minecraft-movie.avif',
            year: 2025,
            imdbRating: '7.2',
            genres: ['Fantasy', 'Comedy', 'Animation'],
            runtime: '110min'
          },
          { 
            id: '3', 
            title: 'Family Guy',
            posterUrl: 'https://images.justwatch.com/poster/242592844/s166/family-guy.avif',
            year: 1999,
            imdbRating: '8.1',
            genres: ['Animation', 'Comedy'],
            runtime: '22min'
          },
          { 
            id: '4', 
            title: 'Solo Leveling',
            posterUrl: 'https://images.justwatch.com/poster/310154566/s166/solo-leveling.avif',
            year: 2024,
            imdbRating: '7.0',
            genres: ['Action & Adventure', 'Fantasy', 'Animation'],
            runtime: '23min'
          },
          { 
            id: '5', 
            title: 'MobLand',
            posterUrl: 'https://images.justwatch.com/poster/326902644/s166/mobland.avif',
            year: 2025,
            imdbRating: '8.5',
            genres: ['Drama', 'Crime'],
            runtime: '120min'
          },
          { 
            id: '6', 
            title: 'The Flash',
            posterUrl: 'https://images.justwatch.com/poster/304477580/s166/the-flash.avif',
            year: 2023,
            imdbRating: '7.6',
            genres: ['Action', 'Adventure', 'Drama'],
            runtime: '42min'
          },
          { 
            id: '11', 
            title: 'Final Destination 5',
            posterUrl: 'https://images.justwatch.com/poster/123473714/s166/final-destination-5.avif',
            year: 2011,
            imdbRating: '5.9',
            genres: ['Horror', 'Thriller'],
            runtime: '92min'
          },
          { 
            id: '12', 
            title: 'Game of Thrones',
            posterUrl: 'https://images.justwatch.com/poster/297859466/s166/game-of-thrones.avif',
            year: 2011,
            imdbRating: '9.3',
            genres: ['Drama', 'Fantasy', 'Adventure'],
            runtime: '57min'
          },
          { 
            id: '13', 
            title: 'Arcane',
            posterUrl: 'https://images.justwatch.com/poster/255388636/s166/arcane.avif',
            year: 2021,
            imdbRating: '9.4',
            genres: ['Animation', 'Action', 'Adventure'],
            runtime: '40min'
          }
        ].filter(movie => 
          movie.title.toLowerCase().includes(query.toLowerCase())
        );
        
        setResults(fallbackResults);
      } finally {
        setIsLoading(false);
      }
    };

    // Load trending searches when no query
    const fetchTrending = async () => {
      try {
        // Real API call to get trending movies
        const response = await fetch('/api/movies/trending');
        
        if (!response.ok) {
          throw new Error('Failed to fetch trending');
        }
        
        const data = await response.json();
        setTrendingSearches(data.slice(0, 10)); // Limit to 10 trending items
      } catch (error) {
        console.error('Error fetching trending:', error);
        // Fallback trending from seed data
        const fallbackTrending: Movie[] = [
          { id: '5', title: 'MobLand', posterUrl: 'https://images.justwatch.com/poster/326902644/s166/mobland.avif' },
          { id: '13', title: 'Arcane', posterUrl: 'https://images.justwatch.com/poster/255388636/s166/arcane.avif' },
          { id: '12', title: 'Game of Thrones', posterUrl: 'https://images.justwatch.com/poster/297859466/s166/game-of-thrones.avif' },
          { id: '14', title: 'The Boys', posterUrl: 'https://images.justwatch.com/poster/203606186/s166/the-boys.avif' },
          { id: '4', title: 'Solo Leveling', posterUrl: 'https://images.justwatch.com/poster/310154566/s166/solo-leveling.avif' }
        ];
        setTrendingSearches(fallbackTrending);
      }
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
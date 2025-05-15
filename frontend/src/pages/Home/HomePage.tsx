// src/pages/Home/HomePage.tsx
import { useState, useEffect } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import './HomePage.css';
import MovieCard from '../../components/MovieCard/MovieCard';
import FilterBar from '../../components/FilterBar/FilterBar';
import { getPopularMovies, getFilteredMovies } from '../../services/movieService';
import { Movie } from '../../types/movie';
import { MovieFilters } from '../../types/filters';

const HomePage = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MovieFilters>({
    releaseYear: '',
    genres: [],
    rating: '',
    mediaType: 'all',
    country: '',
    sortBy: 'popularity'
  });
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const selectedGenre = searchParams.get('genre');
  const { genreName } = location.state || {};

  // Initial load of movies
  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        const data = await getPopularMovies();
        setMovies(data);
        setFilteredMovies(data);
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  // Handle URL parameter for genre filter
  useEffect(() => {
    if (selectedGenre) {
      setFilters(prevFilters => ({
        ...prevFilters,
        genres: [selectedGenre]
      }));
    }
  }, [selectedGenre]);

  // Apply filters when they change
  useEffect(() => {
    // Skip initial render with default filters
    if (!movies.length) return;
    
    const applyFilters = async () => {
      setLoading(true);
      try {
        console.log('Applying filters:', filters);
        const filtered = await getFilteredMovies(filters);
        setFilteredMovies(filtered);
      } catch (error) {
        console.error('Error applying filters:', error);
      } finally {
        setLoading(false);
      }
    };

    applyFilters();
  }, [filters, movies.length]);

  const handleFilterChange = (newFilters: MovieFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="home-page">
      {selectedGenre && genreName && (
        <div className="genre-header">
          <h1>{genreName}</h1>
          <button 
            className="clear-genre" 
            onClick={() => navigate('/')}
          >
            Clear Filter
          </button>
        </div>
      )}
      
      <FilterBar 
        onFilterChange={handleFilterChange} 
        totalResults={filteredMovies.length}
      />
      
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="movie-grid">
          {filteredMovies.length > 0 ? (
            filteredMovies.map(movie => (
              <MovieCard 
                key={movie.id}
                id={movie.id}
                title={movie.title}
                imageUrl={movie.posterUrl}
                year={movie.year}
                rating={movie.rating}
                genres={movie.genres}
              />
            ))
          ) : (
            <div className="no-results">No movies match your current filters</div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;

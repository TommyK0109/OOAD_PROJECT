// src/pages/Home/HomePage.tsx
import { useState, useEffect } from 'react';
import './HomePage.css';
import MovieCard from '../../components/MovieCard/MovieCard';
import FilterBar from '../../components/FilterBar/FilterBar';
import { getPopularMovies } from '../../services/movieService';
import { Movie } from '../../types/movie';

const HomePage = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

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

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    
    // Apply filters to movies
    let filtered = [...movies];
    
    // Example filter logic (expand as needed)
    if (newFilters.rating) {
      filtered = filtered.filter(movie => 
        (movie.rating || '0') >= newFilters.rating
      );
    }
    
    if (newFilters.genres && newFilters.genres.length > 0) {
      filtered = filtered.filter(movie => 
        movie.genres?.some(genre => newFilters.genres.includes(genre))
      );
    }
    
    setFilteredMovies(filtered);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-page">
      <FilterBar onFilterChange={handleFilterChange} />
      
      <div className="movie-grid">
        {filteredMovies.map(movie => (
          <MovieCard 
            key={movie.id}
            id={movie.id}
            title={movie.title}
            imageUrl={movie.posterUrl}
            year={movie.year}
            rating={movie.rating}
          />
        ))}
      </div>
    </div>
  );
};

export default HomePage;

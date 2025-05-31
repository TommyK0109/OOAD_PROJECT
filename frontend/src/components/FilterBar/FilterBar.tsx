import { useState, useEffect } from 'react';
import { MovieFilters } from '../../types/filters';
import './FilterBar.css';

interface FilterBarProps {
  onFilterChange: (filters: MovieFilters) => void;
  totalResults: number;
}

const FilterBar = ({ onFilterChange, totalResults = 0 }: FilterBarProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');
  const [activeFilters, setActiveFilters] = useState<MovieFilters>({
    releaseYear: '',
    genres: [],
    rating: '',
    mediaType: 'all',
    country: '',
    sortBy: 'popularity'
  });

  // Apply filters whenever they change
  useEffect(() => {
    onFilterChange(activeFilters);
  }, [activeFilters, onFilterChange]);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleReset = () => {
    setActiveFilters({
      releaseYear: '',
      genres: [],
      rating: '',
      mediaType: 'all',
      country: '',
      sortBy: 'popularity'
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setActiveFilters(prev => ({
      ...prev,
      sortBy: e.target.value
    }));
  };

  const handleFilterChange = (filterName: keyof MovieFilters, value: string) => {
    if (filterName === 'genres') {
      // Handle genres differently as it's an array
      const updatedGenres = [...(activeFilters.genres || [])];
      if (!updatedGenres.includes(value)) {
        updatedGenres.push(value);
      }
      setActiveFilters(prev => ({
        ...prev,
        genres: updatedGenres
      }));
    } else {
      setActiveFilters(prev => ({
        ...prev,
        [filterName]: value
      }));
    }
  };

  const removeGenre = (genre: string) => {
    const updatedGenres = activeFilters.genres?.filter(g => g !== genre) || [];
    setActiveFilters(prev => ({
      ...prev,
      genres: updatedGenres
    }));
  };

  return (
    <div className="filter-bar">
      <div className="filter-bar__controls">
        <button className="filter-bar__search-btn">
          <span className="search-icon">🔍</span>
        </button>
        
        <button className="filter-bar__all-filters" onClick={toggleFilters}>
          <span className="filter-icon">⚙️</span> All filters
        </button>
        
        <div className="filter-bar__sort">
          <select value={sortBy} onChange={handleSortChange}>
            <option value="popularity">Popularity</option>
            <option value="releaseDate">Release Date</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>
      
      {showFilters && (
        <div className="filter-bar__expanded">
          <div className="filter-bar__header">
            <span className="filter-text">FILTERS</span>
            <button className="filter-bar__reset" onClick={handleReset}>
              ✕ RESET
            </button>
          </div>
          
          <div className="filter-bar__options">
            <div className="filter-option">
              <select 
                className="filter-dropdown"
                value={activeFilters.releaseYear || ''}
                onChange={(e) => handleFilterChange('releaseYear', e.target.value)}
              >
                <option value="" disabled>Release year</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>
            </div>
            
            <div className="filter-option">
              <select 
                className="filter-dropdown"
                value=""
                onChange={(e) => {
                  if (e.target.value) handleFilterChange('genres', e.target.value);
                }}
              >
                <option value="" disabled>Genres</option>
                <option value="Action">Action</option>
                <option value="Comedy">Comedy</option>
                <option value="Drama">Drama</option>
                <option value="Horror">Horror</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Thriller">Thriller</option>
                <option value="Animation">Animation</option>
                <option value="Fantasy">Fantasy</option>
              </select>
              
              {/* Display selected genres as tags */}
              {activeFilters.genres && activeFilters.genres.length > 0 && (
                <div className="selected-genres">
                  {activeFilters.genres.map((genre, index) => (
                    <span key={index} className="genre-tag">
                      {genre}
                      <button onClick={() => removeGenre(genre)}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="filter-option">
              <select 
                className="filter-dropdown"
                value={activeFilters.rating || ''}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
              >
                <option value="" disabled>Rating</option>
                <option value="9+">9+</option>
                <option value="8+">8+</option>
                <option value="7+">7+</option>
                <option value="6+">6+</option>
                <option value="5+">5+</option>
              </select>
            </div>
            
            <div className="filter-option">
              <select 
                className="filter-dropdown"
                value={activeFilters.mediaType || 'all'}
                onChange={(e) => handleFilterChange('mediaType', e.target.value as 'movie' | 'tvshow' | 'all')}
              >
                <option value="all">All Media</option>
                <option value="movie">Movies Only</option>
                <option value="tvshow">TV Shows Only</option>
              </select>
            </div>
            
            <div className="filter-option">
              <select 
                className="filter-dropdown"
                value={activeFilters.country || ''}
                onChange={(e) => handleFilterChange('country', e.target.value)}
              >
                <option value="" disabled>Country</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="JP">Japan</option>
                <option value="KR">Korea</option>
                <option value="FR">France</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      <div className="filter-bar__results">
        <span className="results-count">{totalResults} titles</span>
      </div>
    </div>
  );
};

export default FilterBar;

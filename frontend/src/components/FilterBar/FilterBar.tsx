import { useState } from 'react';
import './FilterBar.css';

interface FilterBarProps {
  onFilterChange: (filters: any) => void;
}

const FilterBar = ({ onFilterChange }: FilterBarProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');
  const [activeFilters, setActiveFilters] = useState({
    releaseYear: '',
    genres: [],
    price: '',
    rating: '',
    ageRating: ''
  });

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleReset = () => {
    setActiveFilters({
      releaseYear: '',
      genres: [],
      price: '',
      rating: '',
      ageRating: ''
    });
    onFilterChange({});
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    // Logic to sort the movie list
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
              <select className="filter-dropdown">
                <option disabled selected>Release year</option>
                <option>2025</option>
                <option>2024</option>
                <option>2023</option>
                <option>2022</option>
                <option>2021</option>
                <option>2020</option>
              </select>
            </div>
            
            <div className="filter-option">
              <select className="filter-dropdown">
                <option disabled selected>Genres</option>
                <option>Action</option>
                <option>Comedy</option>
                <option>Drama</option>
                <option>Horror</option>
                <option>Sci-Fi</option>
                <option>Thriller</option>
              </select>
            </div>
            
            <div className="filter-option">
              <select className="filter-dropdown">
                <option disabled selected>Price</option>
                <option>Free</option>
                <option>Subscription</option>
                <option>Rent</option>
                <option>Buy</option>
              </select>
            </div>
            
            <div className="filter-option">
              <select className="filter-dropdown">
                <option disabled selected>Rating</option>
                <option>9+</option>
                <option>8+</option>
                <option>7+</option>
                <option>6+</option>
                <option>5+</option>
              </select>
            </div>
            
            <div className="filter-option">
              <select className="filter-dropdown">
                <option disabled selected>Age rating</option>
                <option>G</option>
                <option>PG</option>
                <option>PG-13</option>
                <option>R</option>
                <option>NC-17</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      <div className="filter-bar__results">
        <span className="results-count">0 titles</span>
      </div>
    </div>
  );
};

export default FilterBar;

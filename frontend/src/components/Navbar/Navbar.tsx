import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../../assets/logo.png'; // Add your logo to assets

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <nav className="navbar">
      <div className="navbar__left">
        <Link to="/" className="navbar__logo">
          <img src={logo} alt="WatchParty" />
        </Link>
        <div className="navbar__links">
          <Link to="/home" className="navbar__link">Home</Link>
          <Link to="/genres" className="navbar__link">Genres</Link>
          <Link to="/watchlist" className="navbar__link">Watchlist</Link>
        </div>
      </div>
      
      <div className="navbar__search">
        <span className="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Search for movies or TV shows"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="navbar__right">
        <Link to="/signin" className="navbar__signin">Sign In</Link>
        <button className="navbar__menu">≡</button>
      </div>
    </nav>
  );
};

export default Navbar;

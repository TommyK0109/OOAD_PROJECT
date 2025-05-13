import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import AuthModal from '../AuthModal/AuthModal';
import logo from '../../assets/logo.png'; // Add your logo to assets

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar__left">
          <Link to="/" className="navbar__logo">
            <img src={logo} alt="WatchParty" />
            <span className="navbar__name">WatchParty</span>
          </Link>
          <div className="navbar__links">
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
          <button 
            className="navbar__signin"
            onClick={openAuthModal}
          >
            Sign In
          </button>
          <button className="navbar__menu">≡</button>
        </div>
      </nav>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={closeAuthModal} 
      />
    </>
  );
};

export default Navbar;

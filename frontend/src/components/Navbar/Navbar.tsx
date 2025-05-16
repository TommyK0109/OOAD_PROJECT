import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import AuthModal from '../AuthModal/AuthModal';
import SearchDropdown from '../Search/SearchDropdown';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchDropdown(false);
    }
  };

  const handleInputFocus = () => {
    setShowSearchDropdown(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="navbar__left">
          <Link to="/" className="navbar__logo">
            <img src={logo} alt="WatchParty" />
            <span className="navbar__name">WatchParty</span>
          </Link>
          <div className="navbar__links">            
            <Link to="/watchlist" className="navbar__link">Watchlist</Link>            
          </div>
        </div>
        
        <div className="navbar__search" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search for movies or TV shows"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleInputFocus}
            />
          </form>
          {showSearchDropdown && (
            <SearchDropdown 
              query={searchQuery} 
              onClose={() => setShowSearchDropdown(false)}
            />
          )}
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

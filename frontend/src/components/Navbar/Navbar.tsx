import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import AuthModal from '../AuthModal/AuthModal';
import SearchDropdown from '../Search/SearchDropdown';
import JoinParty from '../Party/JoinParty';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showJoinPartyModal, setShowJoinPartyModal] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleAuthSuccess = () => {
    console.log('Authentication successful!');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
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
          {isAuthenticated && (
            <button 
              className="navbar__join-code-btn"
              onClick={() => setShowJoinPartyModal(true)}
            >
              Join Party
            </button>
          )}
          
          {isAuthenticated && user ? (
            <div className="navbar__user" ref={userMenuRef}>
              <button
                className="navbar__user-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="user-avatar">{user.username.charAt(0).toUpperCase()}</span>
                <span className="user-name">{user.username}</span>
              </button>

              {showUserMenu && (
                <div className="navbar__user-menu">
                  <div className="user-menu-header">
                    <span className="user-email">{user.email}</span>
                  </div>
                  <div className="user-menu-divider"></div>
                  <Link to="/profile" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                    Profile
                  </Link>
                  <Link to="/watchlist" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                    My Watchlist
                  </Link>
                  <div className="user-menu-divider"></div>
                  <button className="user-menu-item logout" onClick={handleLogout}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="navbar__signin" onClick={openAuthModal}>
              Sign In
            </button>
          )}
          <button className="navbar__menu">≡</button>
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onSuccess={handleAuthSuccess}
      />
      
      {showJoinPartyModal && (
        <div className="modal-overlay" onClick={() => setShowJoinPartyModal(false)}>
          <div onClick={e => e.stopPropagation()}>
            <JoinParty 
              mode="general" 
              onClose={() => setShowJoinPartyModal(false)} 
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

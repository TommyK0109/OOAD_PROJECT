import { useState, useEffect } from 'react';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<'sign in' | 'sign up'>('sign in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleTab = () => {
    setActiveTab(activeTab === 'sign in' ? 'sign up' : 'sign in');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'sign in') {
      console.log('sign in with:', { email, password });
      // Call your sign in API here
    } else {
      console.log('sign up with:', { username, email, password });
      // Call your sign up API here
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal neon-container" onClick={e => e.stopPropagation()}>
        <button className="auth-modal__close" onClick={onClose}>×</button>
        
        <div className="auth-modal__header">
          <h2 className="neon-text">WatchParty Account</h2>
        </div>
        
        {/* Replace tabs with toggle switch */}
        <div className="auth-switch-container">
          <div className="auth-switch">
            <div 
              className={`auth-switch__slider ${activeTab === 'sign up' ? 'right' : 'left'}`}
            ></div>
            <button 
              className={`auth-switch__option ${activeTab === 'sign in' ? 'active' : ''}`}
              onClick={() => setActiveTab('sign in')}
            >
              Sign In
            </button>
            <button 
              className={`auth-switch__option ${activeTab === 'sign up' ? 'active' : ''}`}
              onClick={() => setActiveTab('sign up')}
            >
              Sign Up
            </button>
          </div>
        </div>
        
        <div className="auth-modal__content">
          {activeTab === 'sign in' ? (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="neon-input"
                />
                <div className="neon-border"></div>
              </div>
              
              <div className="form-group">
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="neon-input"
                />
                <div className="neon-border"></div>
              </div>
              
              <button type="submit" className="neon-button">
                Sign in
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="Username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="neon-input"
                />
                <div className="neon-border"></div>
              </div>
              
              <div className="form-group">
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="neon-input"
                />
                <div className="neon-border"></div>
              </div>
              
              <div className="form-group">
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="neon-input"
                />
                <div className="neon-border"></div>
              </div>
              
              <div className="form-group">
                <input 
                  type="password" 
                  placeholder="Confirm Password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="neon-input"
                />
                <div className="neon-border"></div>
              </div>
              
              <button type="submit" className="neon-button">
                Create Account
              </button>
            </form>
          )}
          
          <div className="auth-modal__footer">
            <p>
              {activeTab === 'sign in' ? "Don't have an account?" : "Already have an account?"}
              <button onClick={toggleTab} className="text-link">
                {activeTab === 'sign in' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

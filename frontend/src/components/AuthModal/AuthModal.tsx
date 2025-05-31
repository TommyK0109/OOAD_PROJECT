import { useState, useEffect } from 'react';
import './AuthModal.css';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void; // Optional callback for successful auth
}

const AuthModal = ({ isOpen, onClose, onSuccess }: AuthModalProps) => {
    const { login, register, error, isLoading, clearError } = useAuth();
    const [activeTab, setActiveTab] = useState<'sign in' | 'sign up'>('sign in');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);

    // Clear errors and form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            clearError();
            setLocalError(null);
            setEmail('');
            setPassword('');
            setUsername('');
            setConfirmPassword('');
        }
    }, [isOpen, clearError]);

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
        document.body.style.overflow = isOpen ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const displayError = error || localError;

    if (!isOpen) return null;

    const toggleTab = () => {
        setActiveTab(activeTab === 'sign in' ? 'sign up' : 'sign in');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        try {
            if (activeTab === 'sign in') {
                if (!email || !password) {
                    setLocalError('Please fill in all fields');
                    return;
                }

                await login({ email, password });
            } else {
                if (!username || !email || !password || !confirmPassword) {
                    setLocalError('Please fill in all fields');
                    return;
                }

                if (password !== confirmPassword) {
                    setLocalError('Passwords do not match');
                    return;
                }

                if (password.length < 6) {
                    setLocalError('Password must be at least 6 characters long');
                    return;
                }

                await register({ username, email, password });
            }

            onClose();
            onSuccess?.();
        } catch (error) {
            console.error('Auth error:', error);
        }
    };

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div className="auth-modal neon-container" onClick={(e) => e.stopPropagation()}>
                <button className="auth-modal__close" onClick={onClose}>×</button>

                <div className="auth-modal__header">
                    <h2 className="neon-text">WatchParty Account</h2>
                </div>

                {/* Tab Toggle */}
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
                    {displayError && (
                        <div
                            className="auth-error"
                            style={{
                                color: '#ff6b6b',
                                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                                border: '1px solid rgba(255, 107, 107, 0.3)',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '20px',
                                textAlign: 'center',
                                fontSize: '14px'
                            }}
                        >
                            {displayError}
                        </div>
                    )}

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
                                    disabled={isLoading}
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
                                    disabled={isLoading}
                                />
                                <div className="neon-border"></div>
                            </div>

                            <button type="submit" className="neon-button" disabled={isLoading}>
                                {isLoading ? 'Signing in...' : 'Sign in'}
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
                                    disabled={isLoading}
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
                                    disabled={isLoading}
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
                                    disabled={isLoading}
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
                                    disabled={isLoading}
                                />
                                <div className="neon-border"></div>
                            </div>

                            <button type="submit" className="neon-button" disabled={isLoading}>
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>
                    )}

                    <div className="auth-modal__footer">
                        <p>
                            {activeTab === 'sign in' ? "Don't have an account?" : 'Already have an account?'}
                            <button onClick={toggleTab} className="text-link" disabled={isLoading}>
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

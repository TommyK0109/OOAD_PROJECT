import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Party.css';
import PartyList from './PartyList';
import { getPartiesByMovieId, joinParty, partyService } from '../../services/partyService';
import { Party } from '../../types/party';

interface JoinPartyProps {
    movieId?: string;
    movieTitle?: string;
    onClose: () => void;
    mode?: 'movie-specific' | 'general';
}

const JoinParty = ({ movieId, movieTitle, onClose, mode = 'movie-specific' }: JoinPartyProps) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [parties, setParties] = useState<Party[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [selectedParty, setSelectedParty] = useState<Party | null>(null);

    const [joinMode, setJoinMode] = useState<'list' | 'code'>('list');
    const [inviteCode, setInviteCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [partyPreview, setPartyPreview] = useState<any>(null);
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        if (mode === 'movie-specific' && movieId) {
            fetchPartiesForMovie();
        } else {
            setIsLoading(false);
        }
    }, [movieId, mode]);

    const fetchPartiesForMovie = async () => {
        if (!movieId) return;

        try {
            setIsLoading(true);
            const data = await getPartiesByMovieId(movieId);
            setParties(data);
        } catch {
            setError('Failed to load watch parties');
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinParty = (party: Party) => {
        if (party.isPrivate) {
            setSelectedParty(party);
        } else {
            joinAndNavigate(party.id);
        }
    };

    const joinAndNavigate = async (partyId: string, password?: string) => {
        try {
            await joinParty({ partyId, password });
            navigate(`/watch/${partyId}`);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to join party');
            }
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedParty) joinAndNavigate(selectedParty.id, password);
    };

    const handleCodeChange = async (code: string) => {
        const cleanCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (cleanCode.length <= 8) {
            setInviteCode(cleanCode);
            setError('');
            setPartyPreview(null);

            if (cleanCode.length === 8) {
                setIsValidating(true);
                try {
                    const result = await partyService.validateInviteCode(cleanCode);
                    if (result.valid) {
                        setPartyPreview(result.party);
                    } else {
                        setError(result.error || 'Invalid invite code');
                    }
                } catch {
                    setError('Failed to validate code');
                } finally {
                    setIsValidating(false);
                }
            }
        }
    };

    const handleJoinByCode = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inviteCode || inviteCode.length !== 8) {
            setError('Please enter a valid 8-character invite code');
            return;
        }

        setIsJoining(true);
        setError('');

        try {
            const result = await partyService.joinByInviteCode(inviteCode);
            if (result.success) {
                navigate(result.redirectTo || `/watch/${result.partyId}`);
                onClose();
            }
        } catch (err: any) {
            setError(err.message || 'Failed to join watch party');
        } finally {
            setIsJoining(false);
        }
    };

    const renderJoinByCodeForm = () => (
        <div className="join-by-code-form">
            <h3>Join by Invite Code</h3>
            <p>Enter the 8-character code shared by your friend</p>

            <form onSubmit={handleJoinByCode}>
                <div className="form-group">
                    <label htmlFor="invite-code">Invite Code</label>
                    <div className="code-input-container">
                        <input
                            id="invite-code"
                            type="text"
                            value={inviteCode}
                            onChange={(e) => handleCodeChange(e.target.value)}
                            placeholder="e.g., 19A69AC0"
                            maxLength={8}
                            className={`code-input ${error ? 'error' : partyPreview ? 'success' : ''}`}
                            disabled={isJoining}
                        />
                        {isValidating && <div className="validating-indicator">Validating...</div>}
                    </div>
                </div>

                {partyPreview && (
                    <div className="party-preview">
                        <div className="preview-header">
                            <span className="preview-icon">🎬</span>
                            <div className="preview-info">
                                <h4>{partyPreview.roomName}</h4>
                                <p>Hosted by {partyPreview.host?.username}</p>
                                {partyPreview.movie && (
                                    <p className="movie-title">{partyPreview.movie.title}</p>
                                )}
                            </div>
                        </div>
                        <div className="preview-stats">
                            <span>👥 {partyPreview.participantCount} participant(s)</span>
                        </div>
                    </div>
                )}

                {error && <div className="error-message">⚠️ {error}</div>}

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => {
                            setJoinMode('list');
                            setError('');
                            setInviteCode('');
                            setPartyPreview(null);
                        }}
                        className="cancel-button"
                    >
                        {mode === 'movie-specific' ? 'Back to List' : 'Cancel'}
                    </button>
                    <button
                        type="submit"
                        className="join-button"
                        disabled={isJoining || !inviteCode || inviteCode.length !== 8}
                    >
                        {isJoining ? 'Joining...' : 'Join Party'}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderModeSelector = () => (
        <div className="join-mode-selector">
            <button
                className={`mode-btn ${joinMode === 'list' ? 'active' : ''}`}
                onClick={() => setJoinMode('list')}
            >
                Browse Parties
            </button>
            <button
                className={`mode-btn ${joinMode === 'code' ? 'active' : ''}`}
                onClick={() => setJoinMode('code')}
            >
                Join by Code
            </button>
        </div>
    );

    return (
        <div className="party-modal">
            <div className="party-modal-header">
                <h2>Join Watch Party</h2>
                <button className="close-button" onClick={onClose}>×</button>
            </div>

            <div className="party-modal-content">
                {selectedParty ? (
                    <div className="password-form">
                        <h3>Enter Password</h3>
                        <p>This party requires a password to join.</p>

                        <form onSubmit={handlePasswordSubmit}>
                            <div className="form-group">
                                <label htmlFor="party-password">Password</label>
                                <input
                                    id="party-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {error && <div className="error-message">{error}</div>}

                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedParty(null);
                                        setError(null);
                                    }}
                                    className="cancel-button"
                                >
                                    Back
                                </button>
                                <button type="submit" className="join-button">Join Party</button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <>
                        {(mode === 'general' || parties.length > 0) && renderModeSelector()}

                        {joinMode === 'code' ? (
                            renderJoinByCodeForm()
                        ) : (
                            <>
                                <h3>
                                    {mode === 'movie-specific'
                                        ? `Available Watch Parties for ${movieTitle}`
                                        : 'Browse Watch Parties'}
                                </h3>

                                {isLoading ? (
                                    <div className="loading-spinner">Loading available parties...</div>
                                ) : error ? (
                                    <div className="error-message">{error}</div>
                                ) : parties.length === 0 ? (
                                    <div className="no-parties">
                                        <p>
                                            {mode === 'movie-specific'
                                                ? 'No watch parties available for this movie.'
                                                : 'No public watch parties available right now.'}
                                        </p>
                                        <p>Why not create your own or join with a code?</p>
                                        <button
                                            className="join-button"
                                            onClick={() => setJoinMode('code')}
                                            style={{ marginTop: '1rem' }}
                                        >
                                            Join by Code Instead
                                        </button>
                                    </div>
                                ) : (
                                    <PartyList parties={parties} onJoinParty={handleJoinParty} />
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default JoinParty;

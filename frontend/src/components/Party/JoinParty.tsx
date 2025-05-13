import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Party.css';
import PartyList from './PartyList';
import { getPartiesByMovieId, joinParty } from '../../services/partyService';
import { Party } from '../../types/party';

interface JoinPartyProps {
  movieId: string;
  movieTitle: string;
  onClose: () => void;
}

const JoinParty = ({ movieId, movieTitle, onClose }: JoinPartyProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [parties, setParties] = useState<Party[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);

  useEffect(() => {
    const fetchParties = async () => {
      try {
        setIsLoading(true);
        const data = await getPartiesByMovieId(movieId);
        setParties(data);
      } catch (err) {
        setError('Failed to load watch parties');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchParties();
  }, [movieId]);

  const handleJoinParty = (party: Party) => {
    if (party.isPrivate) {
      setSelectedParty(party);
    } else {
      // Join public party directly
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
    
    if (selectedParty) {
      joinAndNavigate(selectedParty.id, password);
    }
  };

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
            <h3>Available Watch Parties for {movieTitle}</h3>
            
            {isLoading ? (
              <div className="loading-spinner">Loading available parties...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : parties.length === 0 ? (
              <div className="no-parties">
                <p>No watch parties available for this movie.</p>
                <p>Why not create your own?</p>
              </div>
            ) : (
              <PartyList parties={parties} onJoinParty={handleJoinParty} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JoinParty;

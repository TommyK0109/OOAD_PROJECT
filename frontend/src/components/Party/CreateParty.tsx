import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Party.css';
import { partyService, CreatePartyRequest } from '../../services/partyService';

interface CreatePartyProps {
  movieId: string;
  movieTitle: string;
  posterUrl: string;
  onClose: () => void;
}

const CreateParty = ({ movieId, movieTitle, posterUrl, onClose }: CreatePartyProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partyData, setPartyData] = useState({
    name: `${movieTitle} Watch Party`,
    description: '',
    isPrivate: false,
    password: '',
    maxParticipants: 10,
    startTime: new Date().toISOString().slice(0, 16)
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value;
    
    setPartyData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const newParty = await partyService.createParty({
        movieId,
        name: partyData.name,
        description: partyData.description,
        isPrivate: partyData.isPrivate,
        password: partyData.isPrivate ? partyData.password : undefined,
        maxParticipants: Number(partyData.maxParticipants),
        startTime: partyData.startTime
      });
      
      // Navigate to the watch party room
      navigate(`/watch/${newParty.id}`);
    } catch (error) {
      console.error('Failed to create party:', error);
      setError('Failed to create party. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="party-modal">
      <div className="party-modal-header">
        <h2>Create Watch Party</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="party-modal-content">
        <div className="selected-movie">
          <img src={posterUrl} alt={movieTitle} className="movie-poster" />
          <div className="movie-info">
            <h3>{movieTitle}</h3>
            <p>Selected for your watch party</p>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="party-name">Party Name</label>
            <input
              id="party-name"
              type="text"
              name="name"
              value={partyData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="party-description">Description (Optional)</label>
            <textarea
              id="party-description"
              name="description"
              value={partyData.description}
              onChange={handleChange}
              placeholder="Tell your friends what this party is about..."
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="start-time">Start Time</label>
            <input
              id="start-time"
              type="datetime-local"
              name="startTime"
              value={partyData.startTime}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="max-participants">Max Participants</label>
              <select
                id="max-participants"
                name="maxParticipants"
                value={partyData.maxParticipants}
                onChange={handleChange}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            
            <div className="form-group checkbox-group">
              <input
                id="is-private"
                type="checkbox"
                name="isPrivate"
                checked={partyData.isPrivate}
                onChange={handleChange}
              />
              <label htmlFor="is-private">Private Party</label>
            </div>
          </div>
          
          {partyData.isPrivate && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={partyData.password}
                onChange={handleChange}
                placeholder="Enter a password for your party"
              />
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="cancel-button"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="create-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Party'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateParty;

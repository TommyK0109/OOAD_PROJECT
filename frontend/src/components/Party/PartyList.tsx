import { Party } from '../../types/party';
import './Party.css';

interface PartyListProps {
  parties: Party[];
  onJoinParty: (party: Party) => void;
}

const PartyList = ({ parties, onJoinParty }: PartyListProps) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeStatus = (dateString: string) => {
    const partyTime = new Date(dateString).getTime();
    const now = Date.now();
    
    if (partyTime < now) {
      return 'In progress';
    }
    
    const minutesUntil = Math.floor((partyTime - now) / 60000);
    
    if (minutesUntil < 60) {
      return `Starts in ${minutesUntil} min`;
    }
    
    const hoursUntil = Math.floor(minutesUntil / 60);
    return `Starts in ${hoursUntil} hr`;
  };

  return (
    <div className="party-list">
      {parties.map(party => (
        <div key={party.id} className="party-card">
          <div className="party-info">
            <h4 className="party-name">{party.name}</h4>
            <p className="party-host">Hosted by {party.host}</p>
            <div className="party-details">
              <span className="party-participants">
                {party.participants}/{party.maxParticipants} viewers
              </span>
              <span className="party-time">
                {getTimeStatus(party.startTime)} ({formatTime(party.startTime)})
              </span>
            </div>
          </div>
          <div className="party-actions">
            {party.isPrivate && <span className="private-badge">Private</span>}
            <button 
              className="join-button" 
              onClick={() => onJoinParty(party)}
            >
              Join
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PartyList;

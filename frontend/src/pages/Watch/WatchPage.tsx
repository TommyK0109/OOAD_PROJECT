import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './WatchPage.css';
import ChatContainer from '../../components/Chat/ChatContainer';
import ConnectionStatus from '../../components/Status/ConnectionStatus';
import ParticipantStatus from '../../components/Status/ParticipantStatus';
import { useWebSocket } from '../../hooks/useWebSocket';

interface Participant {
  id: string;
  username: string;
  isHost: boolean;
  isActive: boolean;
  avatarUrl?: string;
}

const WatchPage = () => {
  const { partyId, movieId } = useParams<{ partyId: string; movieId: string }>();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [partyData, setPartyData] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSoloMode, setIsSoloMode] = useState(false);
  const [videoDetails, setVideoDetails] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { connectionStatus } = useWebSocket();
  
  // Determine if we're in solo mode based on the URL path
  useEffect(() => {
    const isSolo = location.pathname.includes('/watch/solo/');
    setIsSoloMode(isSolo);
  }, [location]);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);
        
        // Sample video URLs for testing (these are actual free sample videos)
        const sampleVideos = [
          'https://assets.mixkit.co/videos/preview/mixkit-animation-of-futuristic-devices-99786-large.mp4',
          'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-11-large.mp4',
          'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
          'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
          'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4'
        ];
        
        // Random video for testing
        const randomVideo = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];
        
        if (isSoloMode && movieId) {
          // Mock movie data for solo mode
          const fakeMovieData = {
            id: movieId,
            title: ['Solo Leveling', 'The Matrix', 'Interstellar', 'Inception', 'Avengers'][parseInt(movieId) % 5],
            posterUrl: `https://picsum.photos/seed/movie${movieId}/400/600`,
            backdropUrl: `https://picsum.photos/seed/backdrop${movieId}/1920/1080`,
            streamUrl: randomVideo,
            runtime: '2h 15min',
            rating: '85%',
            year: 2023
          };
          
          setVideoDetails({
            id: fakeMovieData.id,
            title: fakeMovieData.title,
            posterUrl: fakeMovieData.posterUrl,
            streamUrl: fakeMovieData.streamUrl,
          });
          
        } else if (partyId) {
          // Mock party data for party mode
          const fakeParty = {
            id: partyId,
            name: `${['Amazing', 'Epic', 'Cool', 'Awesome', 'Ultimate'][parseInt(partyId) % 5]} Watch Party`,
            movieId: `${parseInt(partyId) % 5 + 1}`,
            movieTitle: ['Solo Leveling', 'The Matrix', 'Interstellar', 'Inception', 'Avengers'][parseInt(partyId) % 5],
            hostId: "user-1",
            hostName: "MovieBuff",
            maxParticipants: 10,
            isPrivate: false,
            createdAt: new Date().toISOString(),
            streamUrl: randomVideo
          };
          
          setPartyData({
            id: fakeParty.id,
            name: fakeParty.name,
            contentId: fakeParty.movieId,
            contentTitle: fakeParty.movieTitle,
            contentUrl: fakeParty.streamUrl,
            hostId: fakeParty.hostId,
          });
          
          // Mock movie data based on party's movie ID
          const fakeMovieData = {
            id: fakeParty.movieId,
            title: fakeParty.movieTitle,
            posterUrl: `https://picsum.photos/seed/movie${fakeParty.movieId}/400/600`,
            backdropUrl: `https://picsum.photos/seed/backdrop${fakeParty.movieId}/1920/1080`,
            streamUrl: fakeParty.streamUrl,
            runtime: '2h 15min',
            rating: '85%',
            year: 2023
          };
          
          setVideoDetails({
            id: fakeMovieData.id,
            title: fakeMovieData.title,
            posterUrl: fakeMovieData.posterUrl,
            streamUrl: fakeMovieData.streamUrl,
          });
          
          // Generate random number of participants (3-8)
          const participantCount = Math.floor(Math.random() * 6) + 3;
          const fakeParticipants: Participant[] = [];
          
          // Always include host as first participant
          fakeParticipants.push({
            id: "user-1",
            username: "MovieBuff",
            isHost: true,
            isActive: true,
            avatarUrl: `https://i.pravatar.cc/150?u=user-1`
          });
          
          // Add other random participants
          const usernames = ["FilmFan", "CinemaLover", "MovieGeek", "FlickChick", "ReelDeal", "SceneQueen", "TheatreNerd"];
          
          for (let i = 2; i <= participantCount; i++) {
            const isActive = Math.random() > 0.2; // 80% chance of being active
            fakeParticipants.push({
              id: `user-${i}`,
              username: usernames[i % usernames.length],
              isHost: false,
              isActive,
              avatarUrl: `https://i.pravatar.cc/150?u=user-${i}`
            });
          }
          
          setParticipants(fakeParticipants);
        }
      } catch (error) {
        console.error('Failed to load watch content:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContent();
  }, [partyId, movieId, isSoloMode]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    
    // If in party mode, broadcast the play/pause action to others
    if (!isSoloMode) {
      // Send WebSocket message to sync video state
      // Your WebSocket implementation here
    }
  };

  const handleProgress = () => {
    // Update progress bar based on video current time
    if (!videoRef.current) return;
    
    const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    const progressBar = document.querySelector('.progress') as HTMLDivElement;
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  if (isLoading) {
    return (
      <div className="watch-page loading">
        <div className="loader"></div>
        <p>Loading watch party...</p>
      </div>
    );
  }

  return (
    <div className={`watch-page ${isSoloMode ? 'solo-mode' : 'party-mode'}`}>
      <div className="video-container">
        <video 
          ref={videoRef}
          poster={videoDetails?.posterUrl}
          onClick={togglePlay}
          onTimeUpdate={handleProgress}
        >
          <source src={videoDetails?.streamUrl || partyData?.contentUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        <div className="video-controls">
          <button className="control-button play-pause" onClick={togglePlay}>
            {isPlaying ? '❚❚' : '▶'}
          </button>
          
          <div className="progress-bar">
            <div className="progress" style={{ width: '0%' }}></div>
          </div>
          
          <div className="right-controls">
            <button className="control-button volume">🔊</button>
            <button className="control-button fullscreen">⛶</button>
          </div>
        </div>
      </div>
      
      {/* Only show sidebar in party mode */}
      {!isSoloMode && (
        <div className={`sidebar ${isChatOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <h2>{videoDetails?.title || partyData?.contentTitle}</h2>
            <button className="toggle-chat" onClick={toggleChat}>
              {isChatOpen ? '→' : '←'}
            </button>
          </div>
          
          <div className="sidebar-content">
            <ConnectionStatus />
            
            <div className="participants-section">
              <h3>Viewers ({participants.length})</h3>
              <div className="participants-list">
                {participants.map(participant => (
                  <ParticipantStatus
                    key={participant.id}
                    username={participant.username}
                    isActive={participant.isActive}
                    isHost={participant.isHost}
                  />
                ))}
              </div>
            </div>
            
            <div className="chat-section">
              <ChatContainer partyId={partyId || ''} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchPage;

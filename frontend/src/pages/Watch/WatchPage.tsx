import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './WatchPage.css';
import ChatContainer from '../../components/Chat/ChatContainer';
import { useWebSocket } from '../../hooks/useWebSocket';
import ReactPlayer from 'react-player';

interface Participant {
  id: string;
  username: string;
  isHost: boolean;
  isActive: boolean;
  avatarUrl?: string;
}

interface VideoProgress {
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
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
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState<VideoProgress>({
    played: 0,
    playedSeconds: 0,
    loaded: 0,
    loadedSeconds: 0
  });
  
  const videoRef = useRef<ReactPlayer>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
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
        
        // Sample video URLs for testing (including YouTube trailers)
        const sampleVideos = [
          'https://www.youtube.com/watch?v=UWMzKXsY9A4', // Trailer 1
          'https://www.youtube.com/watch?v=wJO_vIDZn-I', // Trailer 2
          'https://www.youtube.com/watch?v=QTxvzkwVsQE', // Avengers trailer
          'https://www.youtube.com/watch?v=8g18jFHCLXk', // Dune trailer
          'https://www.youtube.com/watch?v=JfVOs4VSpmA', // Spider-Man trailer
          'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
          'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4'
        ];
        
        // Use YouTube trailers more frequently for testing
        const randomVideo = sampleVideos[Math.floor(Math.random() * 5)]; // Focus on the first 5 (YouTube)
        
        if (isSoloMode && movieId) {
          // Mock movie data for solo mode
          const movieTitles = [
            'Solo Leveling', 
            'The Matrix', 
            'Interstellar', 
            'Inception', 
            'Avengers: Endgame'
          ];
          const fakeMovieData = {
            id: movieId,
            title: movieTitles[parseInt(movieId) % movieTitles.length],
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
    setIsPlaying(!isPlaying);
    
    // If in party mode, broadcast the play/pause action to others
    if (!isSoloMode) {
      // Send WebSocket message to sync video state
      // Your WebSocket implementation here
    }
  };

  const handleProgress = (state: VideoProgress) => {
    // Only update if we're not seeking
    setProgress(state);
    setCurrentTime(state.playedSeconds);
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerContainerRef.current) return;
    
    const progressBar = e.currentTarget;
    const bounds = progressBar.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const width = bounds.width;
    const percent = x / width;
    
    // Seek to the clicked position
    if (videoRef.current) {
      videoRef.current.seekTo(percent, 'fraction');
    }
  };
  
  const skipForward = () => {
    if (videoRef.current) {
      const newTime = Math.min(currentTime + 10, duration);
      videoRef.current.seekTo(newTime, 'seconds');
    }
  };
  
  const skipBackward = () => {
    if (videoRef.current) {
      const newTime = Math.max(currentTime - 10, 0);
      videoRef.current.seekTo(newTime, 'seconds');
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      playerContainerRef.current.requestFullscreen();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    const hh = h > 0 ? `${h}:` : '';
    const mm = `${m < 10 && h > 0 ? '0' : ''}${m}:`;
    const ss = `${s < 10 ? '0' : ''}${s}`;
    
    return `${hh}${mm}${ss}`;
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
      <div className="video-container" ref={playerContainerRef}>
        <ReactPlayer
          ref={videoRef}
          url={videoDetails?.streamUrl || partyData?.contentUrl}
          className="react-player"
          width="100%"
          height="100%"
          playing={isPlaying}
          volume={volume}
          onProgress={handleProgress}
          onDuration={handleDuration}
          config={{
            youtube: {
              playerVars: {
                modestbranding: 1,
                rel: 0,
              }
            }
          }}
        />
        
        <div className="video-overlay" onClick={togglePlay}>
          {!isPlaying && (
            <div className="big-play-button">
              <span>▶</span>
            </div>
          )}
        </div>
        
        <div className="video-controls">
          <div className="progress-bar-container" onClick={handleSeek}>
            <div className="progress-bar-background"></div>
            <div 
              className="progress-bar" 
              style={{ width: `${progress.played * 100}%` }}
            ></div>
            <div 
              className="progress-bar-loaded" 
              style={{ width: `${progress.loaded * 100}%` }}
            ></div>
          </div>
          
          <div className="control-buttons">
            <div className="left-controls">
              <button className="control-button play-pause" onClick={togglePlay}>
                {isPlaying ? '❚❚' : '▶'}
              </button>
              
              <button className="control-button skip-backward" onClick={skipBackward}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 17l-5-5 5-5"></path>
                  <path d="M18 17l-5-5 5-5"></path>
                </svg>
              </button>
              
              <button className="control-button skip-forward" onClick={skipForward}>
                <svg xmlns="http://www.w3.org/3000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 17l5-5-5-5"></path>
                  <path d="M6 17l5-5-5-5"></path>
                </svg>
              </button>
              
              <div className="time-display">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            <div className="right-controls">
              <div className="volume-control">
                <button className="control-button volume-icon">
                  {volume === 0 ? '🔇' : volume < 0.5 ? '🔈' : '🔊'}
                </button>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={volume} 
                  onChange={handleVolumeChange} 
                  className="volume-slider"
                />
              </div>
              
              <button className="control-button fullscreen" onClick={toggleFullscreen}>
                ⛶
              </button>
            </div>
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

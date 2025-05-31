import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './WatchPage.css';
import ChatContainer from '../../components/Chat/ChatContainer';
import InvitationModal from '../../components/InvitationalModal/InvitationModel';
import { useWebSocketContext } from '../../context/WebSocketContext';
import { useVideoSync } from '../../hooks/useVideoSync';
import { useAuth } from '../../context/AuthContext';
import { partyService, Party } from '../../services/partyService';
import ReactPlayer from 'react-player';

interface Participant {
  userId: string;
  username: string;
  isHost: boolean;
  isActive: boolean;
  avatarUrl?: string;
  isMuted?: boolean;
  isDeafened?: boolean;
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { connectionStatus, isAuthenticated, authenticateUser, joinParty } = useWebSocketContext();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partyData, setPartyData] = useState<Party | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSoloMode, setIsSoloMode] = useState(false);
  const [videoDetails, setVideoDetails] = useState<any>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [progress, setProgress] = useState<VideoProgress>({
    played: 0,
    playedSeconds: 0,
    loaded: 0,
    loadedSeconds: 0,
  });

  const videoRef = useRef<ReactPlayer>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const isCurrentUserHost = user && partyData && (user.id === partyData.hostId || user._id === partyData.hostId);

  // Initialize video sync hook
  const {
    sendPlay,
    sendPause,
    sendSeek,
    sendSpeedChange,
    sendMovieChange,
    isConnected,
    canControl,
    isSeekingRef
  } = useVideoSync({
    partyId: partyId || '',
    isHost: isCurrentUserHost || false,
    videoRef,
    onVideoStateChange: (state) => {
      if (state.isPlaying !== undefined) {
        setIsPlaying(state.isPlaying);
      }
      if (state.currentTime !== undefined) {
        setCurrentTime(state.currentTime);
      }
    },
    onError: (errorMessage) => {
      setError(errorMessage);
    }
  });

  useEffect(() => {
    setIsSoloMode(location.pathname.includes('/watch/solo/'));
  }, [location]);

  // Authenticate WebSocket when user is available
  useEffect(() => {
    if (user && !isSoloMode && connectionStatus === 'connected' && !isAuthenticated) {
      const token = localStorage.getItem('watchparty_token'); // Use the correct token key
      if (token) {
        console.log('Authenticating WebSocket connection with token:', token.substring(0, 20) + '...');
        authenticateUser(token);
      } else {
        console.warn('No auth token found for WebSocket authentication');
        console.log('Available localStorage keys:', Object.keys(localStorage));
      }
    }
  }, [user, connectionStatus, isAuthenticated, isSoloMode, authenticateUser]);

  // Join party after authentication
  useEffect(() => {
    if (partyId && isAuthenticated && !isSoloMode) {
      console.log('Joining party via WebSocket:', partyId);
      joinParty(partyId);
    }
  }, [partyId, isAuthenticated, isSoloMode, joinParty]);

  // Fallback: if WebSocket doesn't connect within 10 seconds, show participants from REST API
  useEffect(() => {
    if (!isSoloMode && partyData && participants.length === 0) {
      const fallbackTimer = setTimeout(() => {
        if (participants.length === 0 && partyData.participants.length > 0) {
          console.warn('WebSocket participant sync taking too long, using REST API data as fallback');
          const formattedParticipants: Participant[] = partyData.participants.map(participant => ({
            userId: participant.userId,
            username: participant.username,
            isHost: participant.userId === partyData.hostId,
            isActive: participant.isOnline,
            avatarUrl: participant.avatarUrl || `https://i.pravatar.cc/150?u=${participant.userId}`,
            isMuted: false,
            isDeafened: false,
          }));
          setParticipants(formattedParticipants);
        }
      }, 10000); // 10 second fallback

      return () => clearTimeout(fallbackTimer);
    }
  }, [isSoloMode, partyData, participants.length]);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (isSoloMode && movieId) {
          await loadSoloMode(movieId);
        } else if (partyId) {
          await loadPartyMode(partyId);
        } else {
          throw new Error('Invalid watch page configuration');
        }
      } catch (error) {
        console.error('Failed to load watch content:', error);
        setError(error instanceof Error ? error.message : 'Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [partyId, movieId, isSoloMode, user]);

  // Handle party-related WebSocket events
  useEffect(() => {
    const handlePartyJoined = (event: CustomEvent) => {
      const partyState = event.detail;
      console.log('Party joined via WebSocket:', partyState);

      // Update participants from WebSocket (this is the authoritative source for real-time data)
      if (partyState.users && Array.isArray(partyState.users)) {
        const formattedParticipants: Participant[] = partyState.users.map((user: any) => ({
          userId: user.userId,
          username: user.username,
          isHost: user.isHost,
          isActive: user.isOnline,
          avatarUrl: `https://i.pravatar.cc/150?u=${user.userId}`,
          isMuted: false,
          isDeafened: false,
        }));

        console.log('Setting participants from WebSocket:', formattedParticipants);
        setParticipants(formattedParticipants);
      }
    };

    const handleUserListUpdate = (event: CustomEvent) => {
      const payload = event.detail;
      console.log('User list update received:', payload);

      if (payload.participants && Array.isArray(payload.participants)) {
        const formattedParticipants: Participant[] = payload.participants.map((user: any) => ({
          userId: user.userId,
          username: user.username,
          isHost: user.isHost,
          isActive: user.isOnline,
          avatarUrl: `https://i.pravatar.cc/150?u=${user.userId}`,
          isMuted: false,
          isDeafened: false,
        }));

        console.log('Updating participants from user list update:', formattedParticipants);
        setParticipants(formattedParticipants);
      }
    };

    const handleParticipantJoined = (event: CustomEvent) => {
      const participant = event.detail;
      console.log('New participant joined:', participant);
      
      setParticipants(prev => {
        // Check if participant already exists to prevent duplicates
        const exists = prev.some(p => p.userId === participant.userId);
        if (exists) {
          console.log('Participant already exists, skipping add:', participant.userId);
          return prev;
        }

        const newParticipant = {
          userId: participant.userId,
          username: participant.username,
          isHost: participant.isHost || false,
          isActive: true,
          avatarUrl: `https://i.pravatar.cc/150?u=${participant.userId}`,
          isMuted: false,
          isDeafened: false,
        };
        
        console.log('Adding new participant:', newParticipant);
        return [...prev, newParticipant];
      });
    };

    const handleParticipantLeft = (event: CustomEvent) => {
      const { userId } = event.detail;
      console.log('Participant left:', userId);
      setParticipants(prev => prev.filter(p => p.userId !== userId));
    };

    const handleError = (event: CustomEvent) => {
      console.error('WebSocket error:', event.detail);
      setError(event.detail.message || 'Connection error occurred');
    };

    if (!isSoloMode) {
      window.addEventListener('ws:party_joined', handlePartyJoined as EventListener);
      window.addEventListener('ws:user_list_update', handleUserListUpdate as EventListener);
      window.addEventListener('ws:participant_joined', handleParticipantJoined as EventListener);
      window.addEventListener('ws:participant_left', handleParticipantLeft as EventListener);
      window.addEventListener('ws:error', handleError as EventListener);

      return () => {
        window.removeEventListener('ws:party_joined', handlePartyJoined as EventListener);
        window.removeEventListener('ws:user_list_update', handleUserListUpdate as EventListener);
        window.removeEventListener('ws:participant_joined', handleParticipantJoined as EventListener);
        window.removeEventListener('ws:participant_left', handleParticipantLeft as EventListener);
        window.removeEventListener('ws:error', handleError as EventListener);
      };
    }
  }, [isSoloMode]);

  const loadSoloMode = async (movieId: string) => {
    const sampleVideos = [
      'https://www.youtube.com/watch?v=UWMzKXsY9A4',
      'https://www.youtube.com/watch?v=wJO_vIDZn-I',
      'https://www.youtube.com/watch?v=QTxvzkwVsQE',
      'https://www.youtube.com/watch?v=8g18jFHCLXk',
      'https://www.youtube.com/watch?v=JfVOs4VSpmA',
    ];

    const movieTitles = [
      'Solo Leveling',
      'The Matrix',
      'Interstellar',
      'Inception',
      'Avengers: Endgame',
    ];

    const fakeMovieData = {
      id: movieId,
      title: movieTitles[parseInt(movieId) % movieTitles.length],
      posterUrl: `https://picsum.photos/seed/movie${movieId}/400/600`,
      streamUrl: sampleVideos[parseInt(movieId) % sampleVideos.length],
      runtime: '2h 15min',
      rating: '85%',
      year: 2023,
    };

    setVideoDetails(fakeMovieData);
  };

  const loadPartyMode = async (partyId: string) => {
    try {
      const party = await partyService.getPartyById(partyId);
      setPartyData(party);

      setVideoDetails({
        id: party.currentMovieId,
        title: party.movieTitle,
        posterUrl: party.moviePoster,
        streamUrl: getSampleVideoUrl(party.currentMovieId || '1'),
      });

      // Don't set participants here - they will be loaded from WebSocket for real-time accuracy
      // The participants from REST API might be stale, WebSocket will provide live data
      console.log('Party data loaded from REST API, participants will be loaded from WebSocket');
    } catch (error) {
      console.error('Failed to load party:', error);
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('401')) {
        setError('Authentication expired. Please refresh the page and log in again.');
      } else {
        setError('Failed to load watch party. The party may no longer exist or you may not have access.');
      }
      throw error;
    }
  };

  const getSampleVideoUrl = (movieId: string) => {
    const sampleVideos = [
      'https://www.youtube.com/watch?v=UWMzKXsY9A4',
      'https://www.youtube.com/watch?v=wJO_vIDZn-I',
      'https://www.youtube.com/watch?v=QTxvzkwVsQE',
      'https://www.youtube.com/watch?v=8g18jFHCLXk',
      'https://www.youtube.com/watch?v=JfVOs4VSpmA',
    ];
    return sampleVideos[parseInt(movieId) % sampleVideos.length];
  };

  const togglePlay = () => {
    const newPlayState = !isPlaying;
    const currentVideoTime = videoRef.current?.getCurrentTime() || 0;

    setIsPlaying(newPlayState);

    // Send sync message if user is host
    if (!isSoloMode && canControl) {
      if (newPlayState) {
        sendPlay(currentVideoTime);
      } else {
        sendPause(currentVideoTime);
      }
    }
  };

  const handleProgress = (state: VideoProgress) => {
    setProgress(state);
    setCurrentTime(state.playedSeconds);
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerContainerRef.current) return;

    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    const seekTime = duration * percent;

    if (videoRef.current) {
      videoRef.current.seekTo(percent, 'fraction');

      // Send seek command if host
      if (!isSoloMode && canControl) {
        sendSeek(seekTime);
      }
    }
  };

  const handleSeekChange = (playedSeconds: number) => {
    // Called when video position changes (including programmatic seeks)
    if (!isSoloMode && canControl && !isSeekingRef.current) {
      // Only send if this is a user-initiated seek, not a sync seek
      sendSeek(playedSeconds);
    }
  };

  const skipForward = () => {
    const newTime = Math.min(currentTime + 10, duration);
    if (videoRef.current) {
      videoRef.current.seekTo(newTime, 'seconds');

      if (!isSoloMode && canControl) {
        sendSeek(newTime);
      }
    }
  };

  const skipBackward = () => {
    const newTime = Math.max(currentTime - 10, 0);
    if (videoRef.current) {
      videoRef.current.seekTo(newTime, 'seconds');

      if (!isSoloMode && canControl) {
        sendSeek(newTime);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    document.fullscreenElement
      ? document.exitFullscreen()
      : playerContainerRef.current.requestFullscreen();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const toggleChat = () => setIsChatOpen(prev => !prev);

  const handleInvite = () => setShowInviteModal(true);

  const handleLeaveRoom = async () => {
    if (!partyData) return;
    if (window.confirm('Are you sure you want to leave this watch party?')) {
      try {
        await partyService.leaveParty(partyData.id);
        navigate('/');
      } catch (error) {
        console.error('Failed to leave party:', error);
        alert('Failed to leave party. Please try again.');
      }
    }
  };

  const handleDeleteRoom = async () => {
    if (!partyData) return;
    if (window.confirm('Are you sure you want to delete this watch party? This action cannot be undone.')) {
      try {
        await partyService.deleteParty(partyData.id);
        navigate('/');
      } catch (error) {
        console.error('Failed to delete party:', error);
        alert('Failed to delete party. Please try again.');
      }
    }
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

  if (error) {
    return (
      <div className="watch-page loading">
        <div className="error-container">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="go-home-btn">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`watch-page ${isSoloMode ? 'solo-mode' : 'party-mode'}`}>
      {/* Video Container */}
      <div className="video-container" ref={playerContainerRef}>
        {/* React Player */}
        <ReactPlayer
          ref={videoRef}
          url={videoDetails?.streamUrl}
          playing={isPlaying}
          volume={volume}
          width="100%"
          height="100%"
          onProgress={handleProgress}
          onDuration={handleDuration}
          onSeekChange={handleSeekChange}
          controls={false}
          config={{
            youtube: {
              playerVars: {
                showinfo: 0,
                origin: window.location.origin,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                rel: 0,
                iv_load_policy: 3,
                cc_load_policy: 0,
                playsinline: 1,
                enablejsapi: 0
              }
            }
          }}
        />

        {/* Video Overlay */}
        <div className="video-overlay" onClick={togglePlay}>
          {!isPlaying && (
            <div className="big-play-button">
              <span>▶</span>
            </div>
          )}
        </div>

        {/* Sync Indicator (for party mode) */}
        {!isSoloMode && (
          <div className="sync-indicator">
            {isConnected && isAuthenticated ? (
              <>
                <div className="sync-spinner"></div>
                <span>Synced</span>
                {isCurrentUserHost && <span className="host-indicator"> (Host)</span>}
              </>
            ) : (
              <>
                <div className="sync-spinner"></div>
                <span>{!isConnected ? 'Connecting...' : 'Authenticating...'}</span>
              </>
            )}
          </div>
        )}

        {/* Video Controls */}
        <div className="video-controls">
          {/* Progress Bar */}
          <div className="progress-bar-container" onClick={handleSeek}>
            <div className="progress-bar-background"></div>
            <div
              className="progress-bar-loaded"
              style={{ width: `${progress.loaded * 100}%` }}
            ></div>
            <div
              className="progress-bar"
              style={{ width: `${progress.played * 100}%` }}
            ></div>
          </div>

          {/* Control Buttons */}
          <div className="control-buttons">
            <div className="left-controls">
              <button
                className="control-button"
                onClick={togglePlay}
                disabled={!isSoloMode && !canControl && !isCurrentUserHost}
                title={!isSoloMode && !canControl && !isCurrentUserHost ? "Only host can control playback" : ""}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>

              <button
                className="control-button skip-backward"
                onClick={skipBackward}
                disabled={!isSoloMode && !canControl && !isCurrentUserHost}
              >
                <span>⏪</span> 10s
              </button>

              <button
                className="control-button skip-forward"
                onClick={skipForward}
                disabled={!isSoloMode && !canControl && !isCurrentUserHost}
              >
                <span>⏩</span> 10s
              </button>

              <div className="volume-control">
                <button className="control-button">
                  {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
              </div>

              <div className="time-display">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="right-controls">
              <button className="control-button" onClick={toggleFullscreen}>
                ⛶
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar (Party Mode Only) */}
      {!isSoloMode && (
        <div className={`sidebar ${isChatOpen ? '' : 'closed'}`}>
          <div className="sidebar-header">
            <h2>{partyData?.roomName || 'Watch Party'}</h2>
            <button className="toggle-chat" onClick={toggleChat}>
              {isChatOpen ? '✕' : '💬'}
            </button>
          </div>

          <div className="sidebar-content">
            {/* Room Code Display */}
            {partyData && (
              <div className="room-code-section" style={{
                padding: '15px',
                borderBottom: '1px solid #202225',
                backgroundColor: '#36393f',
                textAlign: 'center'
              }}>
                <div style={{ color: '#b9bbbe', fontSize: '12px', marginBottom: '5px' }}>Room Code</div>
                <div style={{
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  letterSpacing: '2px',
                  fontFamily: 'monospace',
                  backgroundColor: '#2f3136',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #202225'
                }}>
                  {partyData.inviteCode}
                </div>
                <div style={{ color: '#72767d', fontSize: '11px', marginTop: '5px' }}>Share this code with friends</div>
              </div>
            )}

            {/* Connection Status */}
            <div className="connection-status" style={{
              padding: '10px 15px',
              borderBottom: '1px solid #202225',
              backgroundColor: isConnected && isAuthenticated ? '#2d7d32' : '#d32f2f',
              color: 'white',
              textAlign: 'center',
              fontSize: '12px'
            }}>
              {isConnected && isAuthenticated ?
                '🟢 Connected & Synced' :
                !isConnected ? '🔴 Connecting...' : '🟡 Authenticating...'
              }
            </div>

            {/* Party Controls */}
            <div className="party-controls">
              {isCurrentUserHost ? (
                <>
                  <button
                    className="control-btn invite-btn"
                    onClick={handleInvite}
                    style={{
                      backgroundColor: '#5865f2',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    <span className="btn-icon">📤</span>
                    Invite Friends
                  </button>
                  <button className="control-btn delete-btn" onClick={handleDeleteRoom}>
                    <span className="btn-icon">🗑</span>
                    Delete Room
                  </button>
                </>
              ) : (
                <button className="control-btn leave-btn" onClick={handleLeaveRoom}>
                  <span className="btn-icon">🚪</span>
                  Leave Room
                </button>
              )}
            </div>

            {/* Participants Section */}
            <div className="participants-section">
              <h3>Participants ({participants.length})</h3>
              <div className="participants-list">
                {participants.map((participant, index) => (
                  <div key={`${participant.userId}-${index}`} className="participant-item">
                    <div className="participant-avatar">
                      <img
                        src={participant.avatarUrl}
                        alt={participant.username}
                        className="avatar-image"
                      />
                      <div className={`status-indicator ${participant.isActive ? 'online' : 'offline'}`}></div>
                    </div>
                    <div className="participant-info">
                      <div className="participant-name">
                        {participant.username}
                        {participant.isHost && <span className="host-badge">Host</span>}
                      </div>
                    </div>
                    <div className="participant-actions">
                      {participant.isMuted && <span className="mute-icon">🔇</span>}
                      {participant.isDeafened && <span className="deaf-icon">🔇</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Section */}
            <div className="chat-section">
              <ChatContainer partyId={partyId!} participants={participants} />
            </div>
          </div>
        </div>
      )}

      {/* Invitation Modal */}
      {showInviteModal && partyData && (
        <InvitationModal
          partyId={partyData.id}
          partyName={partyData.roomName}
          inviteCode={partyData.inviteCode}
          inviteLink={partyData.inviteLink}
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
};

export default WatchPage;
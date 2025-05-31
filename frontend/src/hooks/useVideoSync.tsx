import { useEffect, useRef, useCallback } from 'react';
import { useWebSocketContext } from '../context/WebSocketContext';
import { useAuth } from '../context/AuthContext';

interface VideoState {
    movieId: string;
    isPlaying: boolean;
    currentTime: number;
    playbackSpeed: number;
    duration: number;
    lastUpdate: number;
}

interface VideoSyncHookProps {
    partyId: string;
    isHost: boolean;
    videoRef: React.RefObject<any>; // ReactPlayer ref
    onVideoStateChange?: (state: Partial<VideoState>) => void;
    onError?: (error: string) => void;
}

export const useVideoSync = ({
    partyId,
    isHost,
    videoRef,
    onVideoStateChange,
    onError
}: VideoSyncHookProps) => {
    const { sendVideoControl, connectionStatus, isAuthenticated } = useWebSocketContext();
    const { user } = useAuth();
    const lastSyncTime = useRef<number>(0);
    const syncThreshold = 2; // seconds
    const isSeekingRef = useRef(false);
    const ignoreNextSeek = useRef(false);

    // Handle incoming video state updates
    useEffect(() => {
        const handleVideoStateUpdate = (event: CustomEvent) => {
            if (!videoRef.current || isHost) return; // Host doesn't sync to others

            const { movieId, isPlaying, currentTime, playbackSpeed, lastUpdate } = event.detail;

            // Avoid sync loops by checking timestamp
            if (lastUpdate <= lastSyncTime.current) {
                return;
            }

            lastSyncTime.current = lastUpdate;

            // Calculate time difference accounting for network delay
            const networkDelay = (Date.now() - lastUpdate) / 1000;
            const targetTime = isPlaying ? currentTime + networkDelay : currentTime;
            const playerCurrentTime = videoRef.current.getCurrentTime();
            const timeDiff = Math.abs(targetTime - playerCurrentTime);

            console.log('Video sync update:', {
                isPlaying,
                targetTime,
                playerCurrentTime,
                timeDiff,
                networkDelay
            });

            // Only sync if the time difference is significant
            if (timeDiff > syncThreshold) {
                console.log('Syncing video position:', targetTime);
                isSeekingRef.current = true;
                ignoreNextSeek.current = true;
                videoRef.current.seekTo(targetTime, 'seconds');

                // Reset seeking flag after a short delay
                setTimeout(() => {
                    isSeekingRef.current = false;
                }, 500);
            }

            // Sync play/pause state
            if (onVideoStateChange) {
                onVideoStateChange({
                    isPlaying,
                    currentTime: targetTime,
                    playbackSpeed
                });
            }
        };

        const handleError = (event: CustomEvent) => {
            if (onError) {
                onError(event.detail.message || 'WebSocket error occurred');
            }
        };

        const handlePartyEnded = (event: CustomEvent) => {
            if (onError) {
                onError('Watch party has ended');
            }
        };

        const handleUserKicked = (event: CustomEvent) => {
            if (onError) {
                onError('You have been removed from the party');
            }
        };

        window.addEventListener('ws:video_state_update', handleVideoStateUpdate as EventListener);
        window.addEventListener('ws:error', handleError as EventListener);
        window.addEventListener('ws:party_ended', handlePartyEnded as EventListener);
        window.addEventListener('ws:user_kicked', handleUserKicked as EventListener);

        return () => {
            window.removeEventListener('ws:video_state_update', handleVideoStateUpdate as EventListener);
            window.removeEventListener('ws:error', handleError as EventListener);
            window.removeEventListener('ws:party_ended', handlePartyEnded as EventListener);
            window.removeEventListener('ws:user_kicked', handleUserKicked as EventListener);
        };
    }, [partyId, isHost, videoRef, onVideoStateChange, onError]);

    // Host video control functions
    const sendPlay = useCallback((currentTime: number) => {
        if (!isHost || !isAuthenticated) return;

        console.log('Host sending PLAY command:', currentTime);
        sendVideoControl('play', { currentTime });
    }, [isHost, isAuthenticated, sendVideoControl]);

    const sendPause = useCallback((currentTime: number) => {
        if (!isHost || !isAuthenticated) return;

        console.log('Host sending PAUSE command:', currentTime);
        sendVideoControl('pause', { currentTime });
    }, [isHost, isAuthenticated, sendVideoControl]);

    const sendSeek = useCallback((currentTime: number) => {
        if (!isHost || !isAuthenticated || ignoreNextSeek.current) {
            ignoreNextSeek.current = false;
            return;
        }

        console.log('Host sending SEEK command:', currentTime);
        sendVideoControl('seek', { currentTime });
    }, [isHost, isAuthenticated, sendVideoControl]);

    const sendSpeedChange = useCallback((speed: number) => {
        if (!isHost || !isAuthenticated) return;

        console.log('Host sending SPEED CHANGE command:', speed);
        sendVideoControl('change_speed', { speed });
    }, [isHost, isAuthenticated, sendVideoControl]);

    const sendMovieChange = useCallback((movieId: string) => {
        if (!isHost || !isAuthenticated) return;

        console.log('Host sending MOVIE CHANGE command:', movieId);
        sendVideoControl('change_movie', { movieId });
    }, [isHost, isAuthenticated, sendVideoControl]);

    // Throttle function to prevent too many sync messages
    const throttle = useCallback((func: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        let lastExecTime = 0;

        return (...args: any[]) => {
            const currentTime = Date.now();

            if (currentTime - lastExecTime > delay) {
                func(...args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func(...args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }, []);

    // Throttled versions for frequent events
    const throttledSendSeek = useCallback(
        throttle(sendSeek, 1000), // Max 1 seek per second
        [sendSeek]
    );

    return {
        // Video control functions (for hosts)
        sendPlay,
        sendPause,
        sendSeek: throttledSendSeek,
        sendSpeedChange,
        sendMovieChange,

        // State
        isConnected: connectionStatus === 'connected',
        isAuthenticated,
        canControl: isHost && isAuthenticated,

        // Utilities
        isSeekingRef
    };
};
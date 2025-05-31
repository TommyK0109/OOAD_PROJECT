import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

interface VideoState {
  movieId: string;
  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number;
  duration: number;
  lastUpdate: number;
}

interface WebSocketContextType {
  socket: WebSocket | null;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  isAuthenticated: boolean;
  sendMessage: (message: any) => void;
  sendVideoControl: (type: string, payload: any) => void;
  sendChatMessage: (content: string) => void;
  authenticateUser: (token: string) => void;
  joinParty: (partyId: string) => void;
  leaveParty: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  url: string;
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ url, children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  const connectWebSocket = useCallback(() => {
    if (socket?.readyState === WebSocket.OPEN) return;

    setConnectionStatus('connecting');
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnectionStatus('connected');
      setReconnectAttempts(0);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setConnectionStatus('disconnected');
      setIsAuthenticated(false);

      // Attempt to reconnect if not a manual close
      if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
        setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connectWebSocket();
        }, Math.pow(2, reconnectAttempts) * 1000); // Exponential backoff
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('disconnected');
    };

    setSocket(ws);
  }, [url, reconnectAttempts]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socket) {
        socket.close(1000, 'Component unmounting');
      }
    };
  }, [connectWebSocket]);

  const handleWebSocketMessage = (message: any) => {
    // Dispatch custom events for different message types
    switch (message.type) {
      case WebSocketMessageType.AUTH_SUCCESS:
        console.log('✅ WebSocket authentication SUCCESS:', message.payload);
        setIsAuthenticated(true);
        window.dispatchEvent(new CustomEvent('ws:auth_success', { detail: message.payload }));
        break;

      case WebSocketMessageType.AUTH_ERROR:
        console.log('❌ WebSocket authentication ERROR:', message.payload);
        setIsAuthenticated(false);
        window.dispatchEvent(new CustomEvent('ws:auth_error', { detail: message.payload }));
        break;

      case WebSocketMessageType.VIDEO_STATE_UPDATE:
        window.dispatchEvent(new CustomEvent('ws:video_state_update', { detail: message.payload }));
        break;

      case WebSocketMessageType.CHAT_MESSAGE:
        window.dispatchEvent(new CustomEvent('ws:chat_message', { detail: message.payload }));
        break;

      case WebSocketMessageType.CHAT_HISTORY:
        window.dispatchEvent(new CustomEvent('ws:chat_history', { detail: message.payload }));
        break;

      case WebSocketMessageType.USER_LIST_UPDATE:
        window.dispatchEvent(new CustomEvent('ws:user_list_update', { detail: message.payload }));
        break;

      case WebSocketMessageType.PARTICIPANT_JOINED:
      case WebSocketMessageType.USER_JOINED:
        window.dispatchEvent(new CustomEvent('ws:participant_joined', { detail: message.payload }));
        break;

      case WebSocketMessageType.PARTICIPANT_LEFT:
        window.dispatchEvent(new CustomEvent('ws:participant_left', { detail: message.payload }));
        break;

      case WebSocketMessageType.PARTY_CREATED:
        window.dispatchEvent(new CustomEvent('ws:party_created', { detail: message.payload }));
        break;

      case WebSocketMessageType.PARTY_JOINED:
        window.dispatchEvent(new CustomEvent('ws:party_joined', { detail: message.payload }));
        break;

      case WebSocketMessageType.USER_KICKED:
        window.dispatchEvent(new CustomEvent('ws:user_kicked', { detail: message.payload }));
        break;

      case WebSocketMessageType.PARTY_ENDED:
        window.dispatchEvent(new CustomEvent('ws:party_ended', { detail: message.payload }));
        break;

      case WebSocketMessageType.ERROR:
        // Filter out heartbeat-related authentication errors to reduce console spam
        if (!message.payload?.message?.includes('Not authenticated')) {
          console.error('WebSocket error message:', message.payload);
        }
        window.dispatchEvent(new CustomEvent('ws:error', { detail: message.payload }));
        break;

      case WebSocketMessageType.PONG:
        // Handle heartbeat response
        break;

      default:
        console.log('Unhandled WebSocket message:', message);
    }
  };

  const sendMessage = useCallback((message: any) => {
    if (socket && connectionStatus === 'connected') {
      socket.send(JSON.stringify({
        ...message,
        timestamp: Date.now()
      }));
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }, [socket, connectionStatus]);

  const sendVideoControl = useCallback((type: string, payload: any) => {
    sendMessage({
      type,
      payload
    });
  }, [sendMessage]);

  const sendChatMessage = useCallback((content: string) => {
    sendMessage({
      type: WebSocketMessageType.CHAT_MESSAGE,
      payload: { content }
    });
  }, [sendMessage]);

  const authenticateUser = useCallback((token: string) => {
    console.log('🔐 Sending WebSocket AUTH message with token:', token?.substring(0, 20) + '...');
    sendMessage({
      type: WebSocketMessageType.AUTH,
      payload: { token }
    });
  }, [sendMessage]);

  const joinParty = useCallback((partyId: string) => {
    sendMessage({
      type: WebSocketMessageType.JOIN_PARTY,
      payload: { partyId }
    });
  }, [sendMessage]);

  const leaveParty = useCallback(() => {
    sendMessage({
      type: WebSocketMessageType.LEAVE_PARTY,
      payload: {}
    });
  }, [sendMessage]);

  // Send periodic ping to keep connection alive
  useEffect(() => {
    if (connectionStatus === 'connected') {
      const pingInterval = setInterval(() => {
        sendMessage({ type: WebSocketMessageType.PING });
      }, 30000); // Send ping every 30 seconds

      return () => clearInterval(pingInterval);
    }
  }, [connectionStatus, sendMessage]);

  return (
    <WebSocketContext.Provider value={{
      socket,
      connectionStatus,
      isAuthenticated,
      sendMessage,
      sendVideoControl,
      sendChatMessage,
      authenticateUser,
      joinParty,
      leaveParty
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export enum WebSocketMessageType {
  // Authentication
  AUTH = 'auth',
  AUTH_SUCCESS = 'auth_success',
  AUTH_ERROR = 'auth_error',

  // Party Management
  CREATE_PARTY = 'create_party',
  JOIN_PARTY = 'join_party',
  LEAVE_PARTY = 'leave_party',
  DELETE_PARTY = 'delete_party',
  PARTY_CREATED = 'party_created',
  PARTY_JOINED = 'party_joined',
  PARTY_LEFT = 'party_left',
  PARTY_ENDED = 'party_ended',
  PARTY_DELETED = 'party_deleted',

  // Host Actions
  KICK_USER = 'kick_user',
  USER_KICKED = 'user_kicked',
  HOST_CHANGED = 'host_changed',

  // Video Control (Host Only)
  PLAY = 'play',
  PAUSE = 'pause',
  SEEK = 'seek',
  CHANGE_SPEED = 'change_speed',
  CHANGE_MOVIE = 'change_movie',

  // Video State Sync (To Participants)
  VIDEO_STATE_UPDATE = 'video_state_update',

  // Chat
  CHAT_MESSAGE = 'chat_message',
  CHAT_HISTORY = 'chat_history',

  // User Status
  USER_LIST_UPDATE = 'user_list_update',
  USER_STATUS_UPDATE = 'user_status_update',
  USER_JOINED = 'user_joined',
  PARTICIPANT_JOINED = 'participant_joined',
  PARTICIPANT_LEFT = 'participant_left',

  // Errors
  ERROR = 'error',

  // Heartbeat
  PING = 'ping',
  PONG = 'pong'
}
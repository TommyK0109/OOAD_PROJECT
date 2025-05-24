import { WebSocket } from 'ws';

export interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
  username?: string;
  partyId?: number;
  isAuthenticated?: boolean;
}

export enum WebSocketMessageType {
  // Authentication
  AUTH = 'auth',
  AUTH_SUCCESS = 'auth_success',
  AUTH_ERROR = 'auth_error',
  
  // Party Management
  CREATE_PARTY = 'create_party',
  JOIN_PARTY = 'join_party',
  LEAVE_PARTY = 'leave_party',
  PARTY_CREATED = 'party_created',
  PARTY_JOINED = 'party_joined',
  PARTY_LEFT = 'party_left',
  PARTY_ENDED = 'party_ended',
  
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
  
  // Errors
  ERROR = 'error',
  
  // Heartbeat
  PING = 'ping',
  PONG = 'pong'
}

export interface WebSocketMessage<T = any> {
  type: WebSocketMessageType;
  payload: T;
  timestamp?: number;
}

export interface VideoState {
  movieId: number;
  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number;
  lastUpdate: number;
}

export interface PartyUser {
  userId: number;
  username: string;
  isHost: boolean;
  isOnline: boolean;
  joinedAt: Date;
}

export interface ChatMessageData {
  messageId?: number;
  userId: number;
  username: string;
  content: string;
  timestamp: Date;
}

export interface PartyState {
  partyId: number;
  roomName: string;
  inviteCode: string;
  hostId: number;
  users: PartyUser[];
  videoState: VideoState;
  isActive: boolean;
  createdAt: Date;
}

// Observer Pattern Interfaces
export interface Observer {
  update(state: PartyState): void;
}

export interface Subject {
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(): void;
}
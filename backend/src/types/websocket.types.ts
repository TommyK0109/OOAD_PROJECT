import { WebSocket } from 'ws';

export interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  username?: string;
  partyId?: string;
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
  DELETE_PARTY = 'delete_party',
  PARTY_CREATED = 'party_created',
  PARTY_JOINED = 'party_joined',
  PARTY_LEFT = 'party_left',
  PARTY_ENDED = 'party_ended',
  PARTY_DELETED = 'party_deleted',

  // Invitation System
  PARTY_INVITATION = 'party_invitation',
  INVITATION_ACCEPTED = 'invitation_accepted',
  INVITATION_DECLINED = 'invitation_declined',
  SEND_INVITATION = 'send_invitation',

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

export interface WebSocketMessage<T = any> {
  type: WebSocketMessageType;
  payload: T;
  timestamp?: number;
}

export interface VideoState {
  movieId: string;
  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number;
  duration: number;
  lastUpdate: number;
}

export interface PartyUser {
  userId: string;
  username: string;
  isHost: boolean;
  isOnline: boolean;
  joinedAt: Date;
  avatarUrl?: string;
}

export interface ChatMessageData {
  messageId?: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
}

export interface PartyInvitationData {
  invitationId: string;
  partyId: string;
  partyName: string;
  senderName: string;
  senderId: string;
  inviteCode: string;
  message?: string;
  movieTitle?: string;
  moviePoster?: string;
  expiresAt: Date;
}

export interface SendInvitationData {
  partyId: string;
  recipientIds?: string[];
  recipientEmails?: string[];
  message?: string;
}

export interface InvitationResponseData {
  invitationId: string;
  response: 'accept' | 'decline';
}

export interface PartyState {
  partyId: string;
  roomName: string;
  inviteCode: string;
  hostId: string;
  users: PartyUser[];
  videoState: VideoState;
  isActive: boolean;
  createdAt: Date;
  participantCount: number;
  maxParticipants?: number;
}

// Observer Pattern Interfaces
export interface Observer {
  update(state: PartyState): void;
  getUserId(): string | undefined;
}

export interface Subject {
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(): void;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreatePartyRequest {
  movieId: string;
  roomName: string;
  description?: string;
  isPrivate?: boolean;
  maxParticipants?: number;
}

export interface CreatePartyResponse {
  id: string;
  roomName: string;
  inviteCode: string;
  inviteLink: string;
  hostId: string;
  movieId: string;
  participants: PartyUser[];
  createdAt: Date;
}

export interface JoinPartyResponse {
  id: string;
  roomName: string;
  participants: PartyUser[];
  videoState: VideoState;
  isHost: boolean;
  message: string;
}
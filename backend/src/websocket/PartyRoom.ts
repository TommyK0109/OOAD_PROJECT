import { AuthenticatedWebSocket, Observer, PartyState, PartyUser, VideoState, WebSocketMessage, WebSocketMessageType } from '../types/websocket.types';
import { PartyObserver } from './PartyObserver';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class PartyRoom {
  private partyId: string;
  private roomName: string;
  private inviteCode: string;
  private hostId: string;
  private movieId: string;
  private users: Map<string, PartyUser> = new Map();
  private observers: Observer[] = [];
  private videoState: VideoState;
  private createdAt: Date;
  private isActive: boolean = true;

  constructor(partyId: string, roomName: string, hostId: string, movieId: string) {
    this.partyId = partyId;
    this.roomName = roomName;
    this.hostId = hostId;
    this.movieId = movieId;
    this.inviteCode = uuidv4().substring(0, 8);
    this.createdAt = new Date();
    this.videoState = {
      movieId: this.movieId,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      playbackSpeed: 1,
      lastUpdate: Date.now()
    };
  }

  // Observer Pattern Implementation
  attach(observer: Observer): void {
    this.observers.push(observer);
  }

  detach(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(): void {
    const state = this.getState();
    this.observers.forEach(observer => observer.update(state));
  }

  // User Management
  addUser(ws: AuthenticatedWebSocket): void {
    if (!ws.userId || !ws.username) return;

    const user: PartyUser = {
      userId: ws.userId,
      username: ws.username,
      isHost: ws.userId === this.hostId,
      isOnline: true,
      joinedAt: new Date()
    };

    this.users.set(ws.userId, user);
    ws.partyId = this.partyId;

    // Create observer for this user
    const observer = new PartyObserver(ws);
    this.attach(observer);

    // Notify all users
    this.notify();

    logger.info(`User ${ws.username} joined party ${this.partyId}`);
  }

  removeUser(userId: string): void {
    const user = this.users.get(userId);
    if (user) {
      this.users.delete(userId);

      // Remove observer
      const observerIndex = this.observers.findIndex(obs => obs.getUserId() === userId);
      if (observerIndex !== -1) {
        this.observers.splice(observerIndex, 1);
      }

      // If host left, assign new host
      if (userId === this.hostId && this.users.size > 0) {
        const newHost = Array.from(this.users.values())[0];
        this.hostId = newHost.userId;
        newHost.isHost = true;
        this.users.set(newHost.userId, newHost);
      }

      // Notify remaining users
      this.notify();

      logger.info(`User ${user.username} left party ${this.partyId}`);
    }
  }

  // Video Control Methods (Host Only)
  updateVideoState(userId: string, updates: Partial<VideoState>): boolean {
    if (userId !== this.hostId) {
      logger.warn(`Non-host user ${userId} attempted to control video`);
      return false;
    }

    this.videoState = {
      ...this.videoState,
      ...updates,
      lastUpdate: Date.now()
    };

    // Notify all users of state change
    this.notify();

    return true;
  }

  // Kick User (Host Only)
  kickUser(requesterId: string, targetUserId: string): boolean {
    if (requesterId !== this.hostId) {
      return false;
    }

    const targetUser = this.users.get(targetUserId);
    if (!targetUser || targetUserId === this.hostId) {
      return false;
    }

    // Notify the kicked user
    this.sendToUser(targetUserId, {
      type: WebSocketMessageType.USER_KICKED,
      payload: { reason: 'Kicked by host' }
    });

    // Remove the user
    this.removeUser(targetUserId);

    return true;
  }

  // End Party (Host Only)
  endParty(userId: string): boolean {
    if (userId !== this.hostId) {
      return false;
    }

    this.isActive = false;

    // Notify all users
    this.broadcastMessage({
      type: WebSocketMessageType.PARTY_ENDED,
      payload: { message: 'Party ended by host' }
    });

    return true;
  }

  // Helper Methods
  private broadcastMessage(message: WebSocketMessage): void {
    this.observers.forEach(observer => {
      if (observer instanceof PartyObserver) {
        observer.sendMessage(message);
      }
    });
  }

  private sendToUser(userId: string, message: WebSocketMessage): void {
    const observer = this.observers.find(obs =>
      obs instanceof PartyObserver && obs.getUserId() === userId
    );

    if (observer instanceof PartyObserver) {
      observer.sendMessage(message);
    }
  }

  // Getters
  getState(): PartyState {
    return {
      partyId: this.partyId,
      roomName: this.roomName,
      inviteCode: this.inviteCode,
      hostId: this.hostId,
      users: Array.from(this.users.values()),
      videoState: this.videoState,
      isActive: this.isActive,
      createdAt: this.createdAt,
      participantCount: this.users.size
    };
  }

  getPartyId(): string {
    return this.partyId;
  }

  getInviteCode(): string {
    return this.inviteCode;
  }

  getHostId(): string {
    return this.hostId;
  }

  getUserCount(): number {
    return this.users.size;
  }

  getUsers(): PartyUser[] {
    return Array.from(this.users.values());
  }

  getVideoState(): VideoState {
    return this.videoState;
  }

  isUserInParty(userId: string): boolean {
    return this.users.has(userId);
  }

  isHost(userId: string): boolean {
    return userId === this.hostId;
  }

  isPartyActive(): boolean {
    return this.isActive;
  }
}
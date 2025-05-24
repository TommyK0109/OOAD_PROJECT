import { WebSocketServer } from 'ws';
import { AuthenticatedWebSocket, WebSocketMessage, WebSocketMessageType } from '../types/websocket.types';
import { PartyRoom } from './PartyRoom';
import { logger } from '../utils/logger';
import { verifyToken } from '../config/jwt';
import { chatHandler } from './handlers/chat.handler';
import { partyHandler } from './handlers/party.handler';
import { syncHandler } from './handlers/sync.handler';

export class WatchPartyManager {
  private static instance: WatchPartyManager;
  private wss!: WebSocketServer;
  private parties: Map<number, PartyRoom> = new Map();
  private userConnections: Map<number, AuthenticatedWebSocket> = new Map();

  private constructor() { }

  static getInstance(): WatchPartyManager {
    if (!WatchPartyManager.instance) {
      WatchPartyManager.instance = new WatchPartyManager();
    }
    return WatchPartyManager.instance;
  }

  initialize(wss: WebSocketServer) {
    this.wss = wss;
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: AuthenticatedWebSocket) => {
      logger.info('New WebSocket connection');

      ws.on('message', async (data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          logger.error('WebSocket message error:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
      });

      // Send initial connection success
      ws.send(JSON.stringify({
        type: WebSocketMessageType.AUTH_ERROR,
        payload: { message: 'Please authenticate' }
      }));
    });
  }

  private async handleMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    if (message.type === WebSocketMessageType.AUTH) {
      await this.handleAuth(ws, message.payload);
      return;
    }
    if (!ws.isAuthenticated) {
      this.sendError(ws, 'Not authenticated');
      return;
    }

    // Route messages to appropriate handlers
    switch (message.type) {
      // Party management
      case WebSocketMessageType.CREATE_PARTY:
      case WebSocketMessageType.JOIN_PARTY:
      case WebSocketMessageType.LEAVE_PARTY:
      case WebSocketMessageType.KICK_USER:
        await partyHandler(this, ws, message);
        break;

      // Video control (host only)
      case WebSocketMessageType.PLAY:
      case WebSocketMessageType.PAUSE:
      case WebSocketMessageType.SEEK:
      case WebSocketMessageType.CHANGE_SPEED:
      case WebSocketMessageType.CHANGE_MOVIE:
        await syncHandler(this, ws, message);
        break;

      // Chat
      case WebSocketMessageType.CHAT_MESSAGE:
        await chatHandler(this, ws, message);
        break;

      // Heartbeat
      case WebSocketMessageType.PING:
        ws.send(JSON.stringify({ type: WebSocketMessageType.PONG }));
        break;

      default:
        this.sendError(ws, 'Unknown message type');
    }
  }

  private async handleAuth(ws: AuthenticatedWebSocket, payload: { token: string }) {
    try {
      const decoded = verifyToken(payload.token);
      ws.userId = decoded.userId;
      ws.username = decoded.username;
      ws.isAuthenticated = true;

      // Store connection
      this.userConnections.set(decoded.userId, ws);

      ws.send(JSON.stringify({
        type: WebSocketMessageType.AUTH_SUCCESS,
        payload: { userId: decoded.userId, username: decoded.username }
      }));

      logger.info(`User ${decoded.username} authenticated via WebSocket`);
    } catch (error) {
      ws.send(JSON.stringify({
        type: WebSocketMessageType.AUTH_ERROR,
        payload: { message: 'Invalid token' }
      }));
      ws.close();
    }
  }

  private handleDisconnect(ws: AuthenticatedWebSocket) {
    if (!ws.userId) return;

    logger.info(`User ${ws.username} disconnected`);

    // Remove from user connections
    this.userConnections.delete(ws.userId);

    // Remove from party if in one
    if (ws.partyId) {
      const party = this.parties.get(ws.partyId);
      if (party) {
        party.removeUser(ws.userId);

        // Check if party should be deleted
        if (party.getUserCount() === 0) {
          this.parties.delete(ws.partyId);
          logger.info(`Party ${ws.partyId} deleted - no users remaining`);
        }
      }
    }
  }

  // Public methods for handlers
  public createParty(hostWs: AuthenticatedWebSocket, roomName: string, movieId: number, partyId?: number): PartyRoom {
    const id = partyId ?? Date.now(); // Use provided ID or generate one
    const party = new PartyRoom(id, roomName, hostWs.userId!, movieId);

    this.parties.set(id, party);
    party.addUser(hostWs);

    return party;
  }

  public getParty(partyId: number): PartyRoom | undefined {
    return this.parties.get(partyId);
  }

  public deleteParty(partyId: number) {
    this.parties.delete(partyId);
  }

  public getUserConnection(userId: number): AuthenticatedWebSocket | undefined {
    return this.userConnections.get(userId);
  }

  public sendToUser(userId: number, message: WebSocketMessage) {
    const ws = this.userConnections.get(userId);
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  public sendError(ws: AuthenticatedWebSocket, error: string) {
    ws.send(JSON.stringify({
      type: WebSocketMessageType.ERROR,
      payload: { message: error }
    }));
  }
}
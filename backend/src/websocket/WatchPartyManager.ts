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
  private parties: Map<string, PartyRoom> = new Map();
  private userConnections: Map<string, AuthenticatedWebSocket> = new Map();

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
    // Handle authentication
    if (message.type === WebSocketMessageType.AUTH) {
      await this.handleAuth(ws, message.payload);
      return;
    }

    // Handle heartbeat (PING) - allow without authentication
    if (message.type === WebSocketMessageType.PING) {
      ws.send(JSON.stringify({ type: WebSocketMessageType.PONG }));
      return;
    }

    // All other messages require authentication
    if (!ws.isAuthenticated) {
      logger.debug(`Unauthenticated ${message.type} message from ${ws.userId || 'unknown'}: Not authenticated`);
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

      default:
        this.sendError(ws, 'Unknown message type');
    }
  }

  private async handleAuth(ws: AuthenticatedWebSocket, payload: { token: string }) {
    console.log('🔐 Received WebSocket AUTH request with token:', payload.token?.substring(0, 20) + '...');
    try {
      const decoded = verifyToken(payload.token);
      console.log('✅ Token verified successfully:', { userId: decoded.userId, username: decoded.username });
      
      ws.userId = decoded.userId;
      ws.username = decoded.username;
      ws.isAuthenticated = true;

      // Store connection
      this.userConnections.set(decoded.userId, ws);

      const successResponse = {
        type: WebSocketMessageType.AUTH_SUCCESS,
        payload: { userId: decoded.userId, username: decoded.username }
      };
      
      console.log('📤 Sending AUTH_SUCCESS response:', successResponse);
      ws.send(JSON.stringify(successResponse));

      logger.info(`User ${decoded.username} authenticated via WebSocket`);
    } catch (error) {
      console.log('❌ Token verification failed:', error);
      const errorResponse = {
        type: WebSocketMessageType.AUTH_ERROR,
        payload: { message: 'Invalid token' }
      };
      
      console.log('📤 Sending AUTH_ERROR response:', errorResponse);
      ws.send(JSON.stringify(errorResponse));
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
  public createParty(hostWs: AuthenticatedWebSocket, roomName: string, movieId: string, partyId?: string): PartyRoom {
    const id = partyId ?? Date.now().toString(); // Use provided ID or generate one
    const party = new PartyRoom(id, roomName, hostWs.userId!, movieId);

    this.parties.set(id, party);
    party.addUser(hostWs);

    return party;
  }

  public getParty(partyId: string): PartyRoom | undefined {
    return this.parties.get(partyId);
  }

  public deleteParty(partyId: string) {
    this.parties.delete(partyId);
  }

  public getUserConnection(userId: string): AuthenticatedWebSocket | undefined {
    return this.userConnections.get(userId);
  }

  public sendToUser(userId: string, message: WebSocketMessage) {
    const ws = this.userConnections.get(userId);
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  public broadcastToParty(partyId: string, message: WebSocketMessage) {
    const party = this.parties.get(partyId);
    if (party) {
      // Get all users in the party and send them the message
      const users = party.getUsers();
      users.forEach(user => {
        const ws = this.userConnections.get(user.userId);
        if (ws && ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify(message));
        }
      });
    }
  }

  public sendError(ws: AuthenticatedWebSocket, error: string) {
    ws.send(JSON.stringify({
      type: WebSocketMessageType.ERROR,
      payload: { message: error }
    }));
  }
}
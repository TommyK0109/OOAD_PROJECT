import { AuthenticatedWebSocket, Observer, PartyState, WebSocketMessage, WebSocketMessageType } from '../types/websocket.types';
import { logger } from '../utils/logger';

export class PartyObserver implements Observer {
  private ws: AuthenticatedWebSocket;

  constructor(ws: AuthenticatedWebSocket) {
    this.ws = ws;
  }

  update(state: PartyState): void {
    // Send video state update to the user
    this.sendMessage({
      type: WebSocketMessageType.VIDEO_STATE_UPDATE,
      payload: {
        videoState: state.videoState,
        timestamp: Date.now()
      }
    });

    // Send user list update
    this.sendMessage({
      type: WebSocketMessageType.USER_LIST_UPDATE,
      payload: {
        users: state.users.map(user => ({
          userId: user.userId,
          username: user.username,
          isHost: user.isHost,
          isOnline: user.isOnline
        })),
        hostId: state.hostId
      }
    });
  }

  sendMessage(message: WebSocketMessage): void {
    if (this.ws.readyState === this.ws.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        logger.error(`Failed to send message to user ${this.ws.userId}:`, error);
      }
    }
  }

  getUserId(): number | undefined {
    return this.ws.userId;
  }

  getWebSocket(): AuthenticatedWebSocket {
    return this.ws;
  }
}
import { AuthenticatedWebSocket, Observer, PartyState, WebSocketMessage, WebSocketMessageType } from '../types/websocket.types';
import { logger } from '../utils/logger';

export class PartyObserver implements Observer {
  private ws: AuthenticatedWebSocket;

  constructor(ws: AuthenticatedWebSocket) {
    this.ws = ws;
  }

  update(state: PartyState): void {
    if (!this.ws || this.ws.readyState !== this.ws.OPEN) {
      return;
    }

    try {
      const message: WebSocketMessage = {
        type: WebSocketMessageType.USER_LIST_UPDATE,
        payload: {
          partyId: state.partyId,
          roomName: state.roomName,
          participants: state.users,
          participantCount: state.participantCount,
          isActive: state.isActive
        }
      };

      this.sendMessage(message);

      // Send video state update separately for better handling
      const videoStateMessage: WebSocketMessage = {
        type: WebSocketMessageType.VIDEO_STATE_UPDATE,
        payload: {
          ...state.videoState,
          partyId: state.partyId
        }
      };

      this.sendMessage(videoStateMessage);

      logger.info(`Party state update sent to user ${this.ws.userId} in party ${state.partyId}`);
    } catch (error) {
      logger.error('Failed to send party state update:', error);
    }
  }

  sendMessage(message: WebSocketMessage): void {
    if (!this.ws || this.ws.readyState !== this.ws.OPEN) {
      logger.warn(`Cannot send message to user ${this.ws.userId}: WebSocket not open`);
      return;
    }

    try {
      this.ws.send(JSON.stringify({
        ...message,
        timestamp: Date.now()
      }));
    } catch (error) {
      logger.error(`Failed to send message to user ${this.ws.userId}:`, error);
    }
  }

  getUserId(): string | undefined {
    return this.ws.userId;
  }

  getUsername(): string | undefined {
    return this.ws.username;
  }

  isWebSocketOpen(): boolean {
    return this.ws && this.ws.readyState === this.ws.OPEN;
  }

  // Send specific message types
  sendVideoStateUpdate(videoState: any): void {
    this.sendMessage({
      type: WebSocketMessageType.VIDEO_STATE_UPDATE,
      payload: videoState
    });
  }

  sendChatMessage(messageData: any): void {
    this.sendMessage({
      type: WebSocketMessageType.CHAT_MESSAGE,
      payload: messageData
    });
  }

  sendParticipantJoined(participant: any): void {
    this.sendMessage({
      type: WebSocketMessageType.PARTICIPANT_JOINED,
      payload: participant
    });
  }

  sendParticipantLeft(participant: any): void {
    this.sendMessage({
      type: WebSocketMessageType.PARTICIPANT_LEFT,
      payload: participant
    });
  }

  sendUserKicked(reason: string): void {
    this.sendMessage({
      type: WebSocketMessageType.USER_KICKED,
      payload: { reason }
    });
  }

  sendPartyEnded(reason: string): void {
    this.sendMessage({
      type: WebSocketMessageType.PARTY_ENDED,
      payload: { reason }
    });
  }

  sendError(error: string): void {
    this.sendMessage({
      type: WebSocketMessageType.ERROR,
      payload: { message: error }
    });
  }
}
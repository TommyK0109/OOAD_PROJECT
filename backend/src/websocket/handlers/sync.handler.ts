import { AuthenticatedWebSocket, WebSocketMessage, WebSocketMessageType } from '../../types/websocket.types';
import { WatchPartyManager } from '../WatchPartyManager';
import { logger } from '../../utils/logger';

export async function syncHandler(
  manager: WatchPartyManager,
  ws: AuthenticatedWebSocket,
  message: WebSocketMessage
) {
  // Check if user is in a party
  if (!ws.partyId) {
    manager.sendError(ws, 'Not in a party');
    return;
  }

  const party = manager.getParty(ws.partyId);
  if (!party) {
    manager.sendError(ws, 'Party not found');
    return;
  }

  // Check if user is host
  if (!party.isHost(ws.userId!)) {
    manager.sendError(ws, 'Only host can control video');
    return;
  }

  let success = false;

  switch (message.type) {
    case WebSocketMessageType.PLAY:
      success = party.updateVideoState(ws.userId!, {
        isPlaying: true,
        currentTime: message.payload.currentTime || party.getVideoState().currentTime
      });
      break;

    case WebSocketMessageType.PAUSE:
      success = party.updateVideoState(ws.userId!, {
        isPlaying: false,
        currentTime: message.payload.currentTime || party.getVideoState().currentTime
      });
      break;

    case WebSocketMessageType.SEEK:
      success = party.updateVideoState(ws.userId!, {
        currentTime: message.payload.currentTime
      });
      break;

    case WebSocketMessageType.CHANGE_SPEED:
      success = party.updateVideoState(ws.userId!, {
        playbackSpeed: message.payload.speed
      });
      break;

    case WebSocketMessageType.CHANGE_MOVIE:
      success = party.updateVideoState(ws.userId!, {
        movieId: message.payload.movieId,
        currentTime: 0,
        isPlaying: false
      });
      break;
  }

  if (success) {
    logger.info(`Video state updated in party ${ws.partyId} by host ${ws.username}`);
  } else {
    manager.sendError(ws, 'Failed to update video state');
  }
}
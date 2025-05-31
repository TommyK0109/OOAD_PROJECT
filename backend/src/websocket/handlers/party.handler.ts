import { AuthenticatedWebSocket, WebSocketMessage, WebSocketMessageType } from '../../types/websocket.types';
import { WatchPartyManager } from '../WatchPartyManager';
import { logger } from '../../utils/logger';
import mongoose from 'mongoose';

export async function partyHandler(
  manager: WatchPartyManager,
  ws: AuthenticatedWebSocket,
  message: WebSocketMessage
) {
  switch (message.type) {
    case WebSocketMessageType.CREATE_PARTY:
      await handleCreateParty(manager, ws, message.payload);
      break;

    case WebSocketMessageType.JOIN_PARTY:
      await handleJoinParty(manager, ws, message.payload);
      break;

    case WebSocketMessageType.LEAVE_PARTY:
      await handleLeaveParty(manager, ws);
      break;

    case WebSocketMessageType.KICK_USER:
      await handleKickUser(manager, ws, message.payload);
      break;
  }
}

async function handleCreateParty(
  manager: WatchPartyManager,
  ws: AuthenticatedWebSocket,
  payload: { roomName: string; movieId: string }
) {
  try {
    if (ws.partyId) {
      manager.sendError(ws, 'Already in a party');
      return;
    }

    const WatchParty = mongoose.model('WatchParty');
    const party = await WatchParty.create({
      roomName: payload.roomName,
      inviteCode: generateInviteCode(),
      hostId: ws.userId,
      currentMovieId: payload.movieId,
      isActive: true
    });

    const partyRoom = manager.createParty(ws, payload.roomName, payload.movieId, party._id.toString());

    ws.send(JSON.stringify({
      type: WebSocketMessageType.PARTY_CREATED,
      payload: {
        partyId: partyRoom.getPartyId(),
        inviteCode: party.inviteCode,
        roomName: payload.roomName
      }
    }));

    logger.info(`Party created by ${ws.username}: ${partyRoom.getPartyId()}`);
  } catch (error) {
    logger.error('Error creating party:', error);
    manager.sendError(ws, 'Failed to create party');
  }
}

async function handleJoinParty(
  manager: WatchPartyManager,
  ws: AuthenticatedWebSocket,
  payload: { inviteCode?: string; partyId?: string }
) {
  try {
    if (ws.partyId) {
      manager.sendError(ws, 'Already in a party');
      return;
    }

    const WatchParty = mongoose.model('WatchParty');
    let party;
    
    // Support both inviteCode and partyId for flexibility
    if (payload.inviteCode) {
      console.log(`🔍 Looking up party by invite code: ${payload.inviteCode}`);
      party = await WatchParty.findOne({ inviteCode: payload.inviteCode, isActive: true });
    } else if (payload.partyId) {
      console.log(`🔍 Looking up party by party ID: ${payload.partyId}`);
      party = await WatchParty.findById(payload.partyId);
      if (party && !party.isActive) {
        party = null; // Treat inactive parties as not found
      }
    } else {
      manager.sendError(ws, 'Either inviteCode or partyId is required');
      return;
    }

    if (!party) {
      const searchTerm = payload.inviteCode || payload.partyId;
      console.log(`❌ Party not found for: ${searchTerm}`);
      manager.sendError(ws, 'Invalid invite code');
      return;
    }

    console.log(`✅ Found party: ${party._id} (${party.roomName})`);

    // Get or create the WebSocket party room
    let partyRoom = manager.getParty(party._id.toString());
    if (!partyRoom) {
      // Create the WebSocket room if it doesn't exist
      console.log(`🔄 WebSocket room not found for party ${party._id}, creating it now`);
      partyRoom = manager.createParty(
        ws, // The joining user becomes temporary host for room creation
        party.roomName,
        party.currentMovieId.toString(),
        party._id.toString()
      );
      
      // Add the original host if they're connected
      const hostConnection = manager.getUserConnection(party.hostId.toString());
      if (hostConnection && hostConnection.userId !== ws.userId) {
        partyRoom.addUser(hostConnection);
        console.log(`🔄 Added original host to WebSocket room`);
      }
    } else {
      // Room exists, just add the user
      partyRoom.addUser(ws);
    }

    // Update database
    await WatchParty.updateOne(
      { _id: party._id },
      { $addToSet: { participants: { userId: ws.userId, joinedAt: new Date() } } }
    );

    ws.send(JSON.stringify({
      type: WebSocketMessageType.PARTY_JOINED,
      payload: {
        partyId: partyRoom.getPartyId(),
        roomName: partyRoom.getState().roomName,
        users: partyRoom.getUsers(),
        videoState: partyRoom.getVideoState()
      }
    }));

    logger.info(`User ${ws.username} joined party ${party._id}`);
  } catch (error) {
    logger.error('Error joining party:', error);
    manager.sendError(ws, 'Failed to join party');
  }
}

async function handleLeaveParty(
  manager: WatchPartyManager,
  ws: AuthenticatedWebSocket
) {
  try {
    if (!ws.partyId) {
      manager.sendError(ws, 'Not in a party');
      return;
    }

    const party = manager.getParty(ws.partyId);
    if (!party) {
      return;
    }

    const WatchParty = mongoose.model('WatchParty');
    await WatchParty.updateOne(
      { _id: ws.partyId },
      { $pull: { participants: { userId: ws.userId } } }
    );

    party.removeUser(ws.userId!);

    ws.send(JSON.stringify({
      type: WebSocketMessageType.PARTY_LEFT,
      payload: { message: 'Left party successfully' }
    }));

    ws.partyId = undefined;
    logger.info(`User ${ws.username} left party`);
  } catch (error) {
    logger.error('Error leaving party:', error);
    manager.sendError(ws, 'Failed to leave party');
  }
}

async function handleKickUser(
  manager: WatchPartyManager,
  ws: AuthenticatedWebSocket,
  payload: { userId: string }
) {
  try {
    if (!ws.partyId) {
      manager.sendError(ws, 'Not in a party');
      return;
    }

    const party = manager.getParty(ws.partyId);
    if (!party) {
      return;
    }

    const success = party.kickUser(ws.userId!, payload.userId);
    if (!success) {
      manager.sendError(ws, 'Cannot kick user - insufficient permissions');
      return;
    }

    const WatchParty = mongoose.model('WatchParty');
    await WatchParty.updateOne(
      { _id: ws.partyId },
      { $pull: { participants: { userId: payload.userId } } }
    );

    logger.info(`User ${payload.userId} kicked from party ${ws.partyId} by ${ws.username}`);
  } catch (error) {
    logger.error('Error kicking user:', error);
    manager.sendError(ws, 'Failed to kick user');
  }
}

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}
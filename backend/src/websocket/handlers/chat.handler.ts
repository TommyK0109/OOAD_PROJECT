import { AuthenticatedWebSocket, WebSocketMessage, WebSocketMessageType, ChatMessageData } from '../../types/websocket.types';
import { WatchPartyManager } from '../WatchPartyManager';
import { logger } from '../../utils/logger';
import mongoose from 'mongoose';

interface ChatMessageDocument extends mongoose.Document {
  partyId: number;
  userId: number;
  content: string;
  timestamp: Date;
  _id: mongoose.Types.ObjectId;
}

export async function chatHandler(
  manager: WatchPartyManager,
  ws: AuthenticatedWebSocket,
  message: WebSocketMessage
) {
  if (message.type !== WebSocketMessageType.CHAT_MESSAGE) {
    return;
  }

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

  try {
    const { content } = message.payload;

    // Validate message content
    if (!content || content.trim().length === 0) {
      manager.sendError(ws, 'Message cannot be empty');
      return;
    }

    if (content.length > 500) {
      manager.sendError(ws, 'Message too long');
      return;
    }

    // Save message to database
    const ChatMessage = mongoose.model<ChatMessageDocument>('ChatMessage');
    const savedMessage = await ChatMessage.create({
      partyId: ws.partyId,
      userId: ws.userId,
      content
    });

    // Create chat message object
    const chatMessage: ChatMessageData = {
      messageId: Number(savedMessage._id.toString()),
      userId: ws.userId!,
      username: ws.username!,
      content,
      timestamp: new Date()
    };

    // Broadcast to all party members
    const users = party.getUsers();
    users.forEach(user => {
      manager.sendToUser(user.userId, {
        type: WebSocketMessageType.CHAT_MESSAGE,
        payload: chatMessage
      });
    });

    logger.info(`Chat message sent in party ${ws.partyId} by ${ws.username}`);
  } catch (error) {
    logger.error('Error handling chat message:', error);
    manager.sendError(ws, 'Failed to send message');
  }
}

// Function to load chat history when user joins party
export async function loadChatHistory(partyId: number, userId: number) {
  try {
    const ChatMessage = mongoose.model<ChatMessageDocument>('ChatMessage');
    const messages = await ChatMessage.find({ partyId })
      .populate('userId', 'username')
      .sort({ timestamp: 1 })
      .limit(100);

    const chatHistory = messages.map(msg => ({
      messageId: msg._id,
      userId: Number(msg.userId),
      username: (msg.userId as any).username,
      content: msg.content,
      timestamp: msg.timestamp
    }));

    // Send chat history to the user
    const manager = WatchPartyManager.getInstance();
    manager.sendToUser(userId, {
      type: WebSocketMessageType.CHAT_HISTORY,
      payload: { messages: chatHistory }
    });
  } catch (error) {
    logger.error('Error loading chat history:', error);
  }
}
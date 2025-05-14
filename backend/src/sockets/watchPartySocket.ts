import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { WatchParty } from '../models/watchParty';
import { User } from '../models/User';
import { config } from '../utils/config';
import logger from '../utils/logger';

interface CustomSocket extends Socket {
  userId?: string;
  username?: string;
  watchPartyId?: string;
}

export const initializeSocketIO = (server: HttpServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: config.clientOrigin,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Middleware to authenticate socket connections
  io.use(async (socket: CustomSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
      
      // Find user
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      // Attach user info to socket
      socket.userId = user.id;
      socket.username = user.username;
      
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: CustomSocket) => {
    logger.info(`User connected: ${socket.userId}`);

    // Join watch party room
    socket.on('join-watch-party', async (watchPartyId: string) => {
      try {
        // Check if watch party exists
        const watchParty = await WatchParty.findById(watchPartyId);
        
        if (!watchParty) {
          socket.emit('error', { message: 'Watch party not found' });
          return;
        }
        
        // Save watch party ID to socket
        socket.watchPartyId = watchPartyId;
        
        // Join socket room
        socket.join(watchPartyId);
        
        // Notify other participants
        socket.to(watchPartyId).emit('user-joined', {
          userId: socket.userId,
          username: socket.username
        });
        
        // Send current watch party state to the joining user
        socket.emit('watch-party-state', {
          currentTime: watchParty.currentTime,
          isPlaying: watchParty.isPlaying,
          hostId: watchParty.hostId,
          participants: watchParty.participants,
          chatMessages: watchParty.chatMessages
        });
        
        logger.info(`User ${socket.userId} joined watch party ${watchPartyId}`);
      } catch (error) {
        logger.error('Error joining watch party:', error);
        socket.emit('error', { message: 'Failed to join watch party' });
      }
    });

    // Leave watch party
    socket.on('leave-watch-party', async () => {
      try {
        const watchPartyId = socket.watchPartyId;
        
        if (!watchPartyId) {
          return;
        }
        
        // Leave socket room
        socket.leave(watchPartyId);
        
        // Notify other participants
        socket.to(watchPartyId).emit('user-left', {
          userId: socket.userId,
          username: socket.username
        });
        
        // Reset watch party ID
        socket.watchPartyId = undefined;
        
        logger.info(`User ${socket.userId} left watch party ${watchPartyId}`);
      } catch (error) {
        logger.error('Error leaving watch party:', error);
      }
    });

    // Play video
    socket.on('play', async (data: { time: number }) => {
      try {
        const watchPartyId = socket.watchPartyId;
        
        if (!watchPartyId) {
          return;
        }
        
        const watchParty = await WatchParty.findById(watchPartyId);
        
        if (!watchParty) {
          return;
        }
        
        // Only the host can control playback
        if (watchParty.hostId !== socket.userId) {
          socket.emit('error', { message: 'Only the host can control playback' });
          return;
        }
        
        // Update watch party state
        watchParty.isPlaying = true;
        watchParty.currentTime = data.time;
        await watchParty.save();
        
        // Broadcast play event to other participants
        socket.to(watchPartyId).emit('play', { time: data.time });
        
        logger.info(`Host ${socket.userId} played video in watch party ${watchPartyId} at ${data.time}`);
      } catch (error) {
        logger.error('Error playing video:', error);
      }
    });

    // Pause video
    socket.on('pause', async (data: { time: number }) => {
      try {
        const watchPartyId = socket.watchPartyId;
        
        if (!watchPartyId) {
          return;
        }
        
        const watchParty = await WatchParty.findById(watchPartyId);
        
        if (!watchParty) {
          return;
        }
        
        // Only the host can control playback
        if (watchParty.hostId !== socket.userId) {
          socket.emit('error', { message: 'Only the host can control playback' });
          return;
        }
        
        // Update watch party state
        watchParty.isPlaying = false;
        watchParty.currentTime = data.time;
        await watchParty.save();
        
        // Broadcast pause event to other participants
        socket.to(watchPartyId).emit('pause', { time: data.time });
        
        logger.info(`Host ${socket.userId} paused video in watch party ${watchPartyId} at ${data.time}`);
      } catch (error) {
        logger.error('Error pausing video:', error);
      }
    });

    // Seek video
    socket.on('seek', async (data: { time: number }) => {
      try {
        const watchPartyId = socket.watchPartyId;
        
        if (!watchPartyId) {
          return;
        }
        
        const watchParty = await WatchParty.findById(watchPartyId);
        
        if (!watchParty) {
          return;
        }
        
        // Only the host can control playback
        if (watchParty.hostId !== socket.userId) {
          socket.emit('error', { message: 'Only the host can control playback' });
          return;
        }
        
        // Update watch party state
        watchParty.currentTime = data.time;
        await watchParty.save();
        
        // Broadcast seek event to other participants
        socket.to(watchPartyId).emit('seek', { time: data.time });
        
        logger.info(`Host ${socket.userId} seeked video in watch party ${watchPartyId} to ${data.time}`);
      } catch (error) {
        logger.error('Error seeking video:', error);
      }
    });

    // Chat message
    socket.on('chat-message', async (data: { message: string }) => {
      try {
        const watchPartyId = socket.watchPartyId;
        
        if (!watchPartyId) {
          return;
        }
        
        const watchParty = await WatchParty.findById(watchPartyId);
        
        if (!watchParty) {
          return;
        }
        
        // Create chat message
        const chatMessage = {
          userId: socket.userId!,
          username: socket.username!,
          message: data.message,
          timestamp: new Date()
        };
        
        // Add message to watch party
        watchParty.chatMessages.push(chatMessage);
        await watchParty.save();
        
        // Broadcast message to all participants (including sender for confirmation)
        io.to(watchPartyId).emit('chat-message', chatMessage);
        
        logger.info(`User ${socket.userId} sent message in watch party ${watchPartyId}`);
      } catch (error) {
        logger.error('Error sending chat message:', error);
      }
    });

    // Transfer host
    socket.on('transfer-host', async (data: { userId: string }) => {
      try {
        const watchPartyId = socket.watchPartyId;
        
        if (!watchPartyId) {
          return;
        }
        
        const watchParty = await WatchParty.findById(watchPartyId);
        
        if (!watchParty) {
          return;
        }
        
        // Only the current host can transfer host privileges
        if (watchParty.hostId !== socket.userId) {
          socket.emit('error', { message: 'Only the host can transfer host privileges' });
          return;
        }
        
        // Check if new host is a participant
        const isParticipant = watchParty.participants.some(p => p.userId === data.userId);
        
        if (!isParticipant) {
          socket.emit('error', { message: 'New host must be a participant' });
          return;
        }
        
        // Update host
        watchParty.hostId = data.userId;
        await watchParty.save();
        
        // Notify all participants about host change
        io.to(watchPartyId).emit('host-changed', { hostId: data.userId });
        
        logger.info(`Host transferred from ${socket.userId} to ${data.userId} in watch party ${watchPartyId}`);
      } catch (error) {
        logger.error('Error transferring host:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      try {
        const watchPartyId = socket.watchPartyId;
        
        if (!watchPartyId) {
          return;
        }
        
        logger.info(`User ${socket.userId} disconnected from watch party ${watchPartyId}`);
        
        // Handle as if user left watch party
        socket.to(watchPartyId).emit('user-left', {
          userId: socket.userId,
          username: socket.username
        });
        
        // If user is host, update watch party
        const watchParty = await WatchParty.findById(watchPartyId);
        
        if (watchParty && watchParty.hostId === socket.userId) {
          // Find a new host among remaining participants
          const remainingParticipants = watchParty.participants.filter(
            p => p.userId !== socket.userId
          );
          
          if (remainingParticipants.length > 0) {
            // Assign first participant as new host
            const newHostId = remainingParticipants[0].userId;
            watchParty.hostId = newHostId;
            await watchParty.save();
            
            // Notify all participants about host change
            io.to(watchPartyId).emit('host-changed', { hostId: newHostId });
            
            logger.info(`New host ${newHostId} assigned in watch party ${watchPartyId}`);
          } else {
            // No participants left, delete watch party
            await WatchParty.findByIdAndDelete(watchPartyId);
            logger.info(`Watch party ${watchPartyId} deleted as no participants remain`);
          }
        }
      } catch (error) {
        logger.error('Error handling disconnect:', error);
      }
    });
  });

  return io;
};
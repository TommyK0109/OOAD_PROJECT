import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';
import { WatchPartyManager } from '../websocket/WatchPartyManager';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { WebSocketMessageType } from '../types/websocket.types';

interface WatchPartyDocument extends mongoose.Document {
  roomName: string;
  inviteCode: string;
  movieId: string | mongoose.Types.ObjectId;
  hostId: string | mongoose.Types.ObjectId;
  currentMovieId?: string | mongoose.Types.ObjectId;
  currentPosition: number;
  isActive: boolean;
  participants: {
    userId: string | mongoose.Types.ObjectId;
    joinedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface PartyInvitationDocument extends mongoose.Document {
  partyId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  recipientId?: mongoose.Types.ObjectId;
  recipientEmail?: string;
  inviteLink: string;
  inviteCode: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Date;
  createdAt: Date;
}

interface Participant {
  userId: string | mongoose.Types.ObjectId;
  joinedAt: Date;
}

export const watchPartyController = {
  // Create a new watch party
  async createParty(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { movieId, name, roomName, description, isPrivate, maxParticipants } = req.body;

      // Use 'name' from frontend or fallback to 'roomName' for backward compatibility
      const partyName = name || roomName;

      if (!movieId || !partyName) {
        return res.status(400).json({ error: 'Movie ID and party name are required' });
      }

      const WatchParty = mongoose.model<WatchPartyDocument>('WatchParty');
      const Movie = mongoose.model('Movie');
      const User = mongoose.model('User');

      // Check if movie exists
      const movie = await Movie.findById(movieId);
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
      }

      // Get user details
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Generate unique invite code
      const inviteCode = uuidv4().substring(0, 8).toUpperCase();

      // Create watch party
      const party = await WatchParty.create({
        roomName: partyName,
        inviteCode,
        hostId: req.user.userId,
        currentMovieId: movieId,
        currentPosition: 0,
        isActive: true,
        participants: [{
          userId: req.user.userId,
          joinedAt: new Date()
        }]
      });

      // Populate the response
      const populatedParty = await WatchParty.findById(party._id)
        .populate('currentMovieId', 'title posterUrl')
        .populate('hostId', 'username email')
        .populate('participants.userId', 'username');

      // Create WebSocket room
      const watchPartyManager = WatchPartyManager.getInstance();
      const userConnection = watchPartyManager.getUserConnection(req.user.userId);
      if (userConnection && userConnection.isAuthenticated) {
        try {
          watchPartyManager.createParty(
            userConnection,
            partyName,
            movieId.toString(), // Ensure movieId is a string
            (party._id as mongoose.Types.ObjectId).toString()
          );
          logger.info(`WebSocket room created for party: ${party._id}`);
        } catch (wsError) {
          logger.warn(`Failed to create WebSocket room: ${wsError}`);
          // Don't fail the entire request, just log the warning
        }
      } else {
        logger.info(`User ${req.user.userId} not connected to WebSocket, WebSocket room will be created when user joins`);
      }

      logger.info(`Watch party created: ${party._id} by user ${req.user.userId}`);

      return res.status(201).json({
        ...populatedParty?.toObject(),
        inviteLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join/${inviteCode}`
      });
    } catch (error) {
      logger.error('Error creating watch party:', error);
      return next(error);
    }
  },

  // Join party by invite code
  async joinByInviteCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { inviteCode } = req.params;

      // Validate invite code format
      if (!inviteCode || inviteCode.length !== 8 || !/^[A-Z0-9]+$/i.test(inviteCode)) {
        return res.status(400).json({ error: 'Invalid invite code format' });
      }

      const WatchParty = mongoose.model<WatchPartyDocument>('WatchParty');
      const User = mongoose.model('User');

      // Find party by invite code (case insensitive)
      const party = await WatchParty.findOne({
        inviteCode: { $regex: new RegExp(`^${inviteCode}$`, 'i') },
        isActive: true
      })
        .populate('hostId', 'username email')
        .populate('currentMovieId', 'title posterUrl backdropUrl overview year rating runtime genres')
        .populate('participants.userId', 'username email');

      if (!party) {
        return res.status(404).json({
          error: 'Invalid or expired invite code',
          code: 'PARTY_NOT_FOUND'
        });
      }

      const isParticipant = party.participants.some(
        (p: Participant) => {
          const participantId = (p.userId as any)?._id?.toString() || p.userId?.toString();
          return participantId === req.user!.userId.toString();
        }
      );

      if (isParticipant) {
        return res.json({
          success: true,
          message: 'Welcome back! You are already in this watch party.',
          partyId: party._id,
          redirectTo: `/watch/${party._id}`,
          alreadyJoined: true
        });
      }

      // Add user to party participants
      party.participants.push({
        userId: new mongoose.Types.ObjectId(req.user.userId),
        joinedAt: new Date()
      });

      await party.save();

      // Get user details for WebSocket notification
      const user = await User.findById(req.user.userId, 'username');

      // Add to WebSocket room if connection exists
      const watchPartyManager = WatchPartyManager.getInstance();
      const partyRoom = watchPartyManager.getParty((party._id as mongoose.Types.ObjectId).toString());
      if (partyRoom) {
        const wsConnection = watchPartyManager.getUserConnection(req.user.userId);
        if (wsConnection) {
          partyRoom.addUser(wsConnection);

          // Notify all participants that someone joined
          try {
            watchPartyManager.broadcastToParty((party._id as mongoose.Types.ObjectId).toString(), {
              type: WebSocketMessageType.USER_JOINED,
              payload: {
                userId: req.user.userId,
                username: user?.username || 'Anonymous',
                joinedAt: new Date().toISOString(),
                participantCount: party.participants.length
              }
            });
          } catch (wsError) {
            logger.warn('WebSocket notification failed:', wsError);
          }
        }
      }

      logger.info(`User ${req.user.userId} (${user?.username}) joined party ${party._id} via invite code ${inviteCode}`);

      return res.json({
        success: true,
        message: `Successfully joined "${party.roomName}"!`,
        partyId: party._id,
        redirectTo: `/watch/${party._id}`,
        alreadyJoined: false
      });
    } catch (error) {
      logger.error('Error joining party by invite code:', error);
      return next(error);
    }
  },

  // Validate invite code without joining
  async validateInviteCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { inviteCode } = req.params;

      if (!inviteCode || inviteCode.length !== 8) {
        return res.status(400).json({
          valid: false,
          error: 'Invalid invite code format'
        });
      }

      const WatchParty = mongoose.model<WatchPartyDocument>('WatchParty');

      const party = await WatchParty.findOne({
        inviteCode: { $regex: new RegExp(`^${inviteCode}$`, 'i') },
        isActive: true
      })
        .populate('hostId', 'username')
        .populate('currentMovieId', 'title posterUrl year rating')
        .select('roomName inviteCode hostId currentMovieId participants createdAt');

      if (!party) {
        return res.status(404).json({
          valid: false,
          error: 'Invalid or expired invite code'
        });
      }

      return res.json({
        valid: true,
        party: {
          id: party._id,
          roomName: party.roomName,
          inviteCode: party.inviteCode,
          host: party.hostId,
          movie: party.currentMovieId,
          participantCount: party.participants.length,
          createdAt: party.createdAt
        }
      });
    } catch (error) {
      logger.error('Error validating invite code:', error);
      return next(error);
    }
  },

  // Send invitation to specific users
  async sendInvitation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { partyId } = req.params;
      const { recipientIds, recipientEmails, message } = req.body;

      if ((!recipientIds || recipientIds.length === 0) && (!recipientEmails || recipientEmails.length === 0)) {
        return res.status(400).json({ error: 'At least one recipient ID or email is required' });
      }

      const WatchParty = mongoose.model<WatchPartyDocument>('WatchParty');
      const PartyInvitation = mongoose.model<PartyInvitationDocument>('PartyInvitation');
      const User = mongoose.model('User');

      const party = await WatchParty.findById(partyId);
      if (!party) {
        return res.status(404).json({ error: 'Watch party not found' });
      }

      // Only host can send invitations
      if (party.hostId.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ error: 'Only host can send invitations' });
      }

      const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join/${party.inviteCode}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expire in 7 days

      const createdInvitations = [];

      // Send invitations to users by ID
      if (recipientIds && recipientIds.length > 0) {
        for (const recipientId of recipientIds) {
          // Check if user exists
          const recipient = await User.findById(recipientId);
          if (!recipient) {
            logger.warn(`User not found for invitation: ${recipientId}`);
            continue;
          }

          // Check if invitation already exists
          const existingInvitation = await PartyInvitation.findOne({
            partyId: party._id,
            recipientId,
            status: 'pending'
          });

          if (existingInvitation) {
            logger.info(`Invitation already exists for user ${recipientId} to party ${partyId}`);
            continue;
          }

          const invitation = await PartyInvitation.create({
            partyId: party._id,
            senderId: req.user.userId,
            recipientId,
            inviteLink,
            inviteCode: party.inviteCode,
            message: message || `You're invited to join "${party.roomName}" watch party!`,
            status: 'pending',
            expiresAt
          });

          createdInvitations.push(invitation);

          // Send real-time notification via WebSocket
          const watchPartyManager = WatchPartyManager.getInstance();
          const recipientIdNum = typeof recipientId === 'string' ? recipientId : recipientId.toString();
          watchPartyManager.sendToUser(recipientIdNum, {
            type: WebSocketMessageType.PARTY_INVITATION,
            payload: {
              invitationId: invitation._id,
              partyName: party.roomName,
              senderName: req.user.username,
              inviteCode: party.inviteCode,
              message: invitation.message
            }
          });
        }
      }

      // Send invitations to users by email
      if (recipientEmails && recipientEmails.length > 0) {
        for (const email of recipientEmails) {
          // Find user by email
          const recipient = await User.findOne({ email });

          if (recipient) {
            // User exists, create invitation with user ID
            const existingInvitation = await PartyInvitation.findOne({
              partyId: party._id,
              recipientId: recipient._id,
              status: 'pending'
            });

            if (!existingInvitation) {
              const invitation = await PartyInvitation.create({
                partyId: party._id,
                senderId: req.user.userId,
                recipientId: recipient._id,
                recipientEmail: email,
                inviteLink,
                inviteCode: party.inviteCode,
                message: message || `You're invited to join "${party.roomName}" watch party!`,
                status: 'pending',
                expiresAt
              });

              createdInvitations.push(invitation);

              // Send real-time notification
              const watchPartyManager = WatchPartyManager.getInstance();
              const recipientIdNum = typeof recipient._id === 'string' ? recipient._id : recipient._id.toString();
              watchPartyManager.sendToUser(recipientIdNum, {
                type: WebSocketMessageType.PARTY_INVITATION,
                payload: {
                  invitationId: invitation._id,
                  partyName: party.roomName,
                  senderName: req.user.username,
                  inviteCode: party.inviteCode,
                  message: invitation.message
                }
              });
            }
          } else {
            // User doesn't exist, create email-only invitation
            const invitation = await PartyInvitation.create({
              partyId: party._id,
              senderId: req.user.userId,
              recipientEmail: email,
              inviteLink,
              inviteCode: party.inviteCode,
              message: message || `You're invited to join "${party.roomName}" watch party!`,
              status: 'pending',
              expiresAt
            });

            createdInvitations.push(invitation);

            // Here you would typically send an email invitation
            // For now, we'll just log it
            logger.info(`Email invitation created for ${email} to party ${partyId}`);
          }
        }
      }

      logger.info(`${createdInvitations.length} invitations sent for party ${partyId}`);

      return res.status(201).json({
        message: `${createdInvitations.length} invitation(s) sent successfully`,
        invitations: createdInvitations.length,
        inviteLink
      });
    } catch (error) {
      logger.error('Error sending invitations:', error);
      return next(error);
    }
  },

  // Get received invitations for current user
  async getReceivedInvitations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const PartyInvitation = mongoose.model<PartyInvitationDocument>('PartyInvitation');

      const invitations = await PartyInvitation.find({
        $or: [
          { recipientId: req.user.userId },
          // Also check email if user has email in their profile
        ],
        status: 'pending',
        expiresAt: { $gt: new Date() }
      })
        .populate('partyId', 'roomName currentMovieId hostId')
        .populate('senderId', 'username')
        .populate({
          path: 'partyId',
          populate: {
            path: 'currentMovieId',
            select: 'title posterUrl'
          }
        })
        .populate({
          path: 'partyId',
          populate: {
            path: 'hostId',
            select: 'username'
          }
        })
        .sort({ createdAt: -1 });

      return res.json(invitations);
    } catch (error) {
      logger.error('Error getting received invitations:', error);
      return next(error);
    }
  },

  // Respond to invitation (accept/decline)
  async respondToInvitation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { invitationId } = req.params;
      const { response } = req.body; // 'accept' or 'decline'

      if (!['accept', 'decline'].includes(response)) {
        return res.status(400).json({ error: 'Response must be "accept" or "decline"' });
      }

      const PartyInvitation = mongoose.model<PartyInvitationDocument>('PartyInvitation');
      const WatchParty = mongoose.model<WatchPartyDocument>('WatchParty');

      const invitation = await PartyInvitation.findById(invitationId)
        .populate('partyId');

      if (!invitation) {
        return res.status(404).json({ error: 'Invitation not found' });
      }

      // Check if invitation belongs to current user
      if (invitation.recipientId?.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ error: 'Not authorized to respond to this invitation' });
      }

      // Check if invitation is still valid
      if (invitation.status !== 'pending' || invitation.expiresAt < new Date()) {
        return res.status(400).json({ error: 'Invitation is no longer valid' });
      }

      // Update invitation status
      invitation.status = response === 'accept' ? 'accepted' : 'declined';
      await invitation.save();

      if (response === 'accept') {
        // Add user to party
        const party = await WatchParty.findById(invitation.partyId);
        if (party && party.isActive) {
          // Check if user is already in the party
          const isParticipant = party.participants.some(
            (p: Participant) => p.userId.toString() === req.user!.userId.toString()
          );

          if (!isParticipant) {
            party.participants.push({
              userId: new mongoose.Types.ObjectId(req.user.userId),
              joinedAt: new Date()
            });
            await party.save();

            // Add to WebSocket room
            const watchPartyManager = WatchPartyManager.getInstance();
            const partyRoom = watchPartyManager.getParty((party._id as mongoose.Types.ObjectId).toString());
            if (partyRoom) {
              const wsConnection = watchPartyManager.getUserConnection(req.user.userId);
              if (wsConnection) {
                partyRoom.addUser(wsConnection);
              }
            }

            logger.info(`User ${req.user.userId} accepted invitation and joined party ${party._id}`);

            return res.json({
              message: 'Invitation accepted and joined party successfully',
              partyId: party._id,
              inviteCode: party.inviteCode
            });
          } else {
            return res.json({
              message: 'Invitation accepted (already in party)',
              partyId: party._id,
              inviteCode: party.inviteCode
            });
          }
        } else {
          return res.status(400).json({ error: 'Party is no longer active' });
        }
      }

      logger.info(`User ${req.user.userId} declined invitation ${invitationId}`);

      return res.json({
        message: 'Invitation declined successfully'
      });
    } catch (error) {
      logger.error('Error responding to invitation:', error);
      return next(error);
    }
  },

  // Get party details
  async getPartyDetails(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { partyId } = req.params;
      const WatchParty = mongoose.model<WatchPartyDocument>('WatchParty');

      const party = await WatchParty.findById(partyId)
        .populate('currentMovieId', 'title posterUrl streamUrl')
        .populate('hostId', 'username email')
        .populate('participants.userId', 'username email');

      if (!party) {
        return res.status(404).json({ error: 'Watch party not found' });
      }

      // Check if user is a participant - Fix the comparison for populated objects
      const isParticipant = party.participants.some((p: Participant) => {
        // Handle both populated and non-populated userId
        const participantId = (p.userId as any)?._id?.toString() || p.userId?.toString() || '';
        const currentUserId = req.user!.userId.toString();
        return participantId === currentUserId;
      });

      // Also check if user is the host - Fix for populated hostId
      const hostId = (party.hostId as any)?._id?.toString() || party.hostId?.toString() || '';
      const isHost = hostId === req.user.userId.toString();

      if (!isParticipant && !isHost) {
        return res.status(403).json({ error: 'Access denied. You are not a participant in this party.' });
      }

      return res.json({
        ...party.toObject(),
        inviteLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join/${party.inviteCode}`
      });
    } catch (error) {
      logger.error('Error getting party details:', error);
      return next(error);
    }
  },

  // Get user's parties
  async getUserParties(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const WatchParty = mongoose.model<WatchPartyDocument>('WatchParty');
      const parties = await WatchParty.find({
        'participants.userId': req.user.userId,
        isActive: true
      })
        .populate('currentMovieId', 'title posterUrl')
        .populate('hostId', 'username')
        .sort({ createdAt: -1 });

      return res.json(parties);
    } catch (error) {
      logger.error('Error getting user parties:', error);
      return next(error);
    }
  },

  // Get active public parties
  async getActiveParties(_req: Request, res: Response, next: NextFunction) {
    try {
      const WatchParty = mongoose.model<WatchPartyDocument>('WatchParty');

      const parties = await WatchParty.find({
        isActive: true
      })
        .populate('currentMovieId', 'title posterUrl')
        .populate('hostId', 'username')
        .sort({ createdAt: -1 })
        .limit(20);

      return res.json(parties);
    } catch (error) {
      logger.error('Error getting active parties:', error);
      return next(error);
    }
  },

  // Leave party
  async leaveParty(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { partyId } = req.params;
      const WatchParty = mongoose.model<WatchPartyDocument>('WatchParty');

      const party = await WatchParty.findById(partyId);
      if (!party) {
        return res.status(404).json({ error: 'Watch party not found' });
      }

      // Remove user from party
      party.participants = party.participants.filter(
        (p: Participant) => p.userId.toString() !== req.user!.userId.toString()
      );

      // If no participants left or host leaves, end the party
      if (party.participants.length === 0 || party.hostId.toString() === req.user.userId.toString()) {
        party.isActive = false;
        const watchPartyManager = WatchPartyManager.getInstance();
        watchPartyManager.deleteParty((party._id as mongoose.Types.ObjectId).toString());
      } else if (party.hostId.toString() === req.user.userId.toString()) {
        // If host leaves but there are participants, assign new host
        party.hostId = party.participants[0].userId;
      }

      await party.save();

      // Remove from WebSocket room
      const watchPartyManager = WatchPartyManager.getInstance();
      const partyRoom = watchPartyManager.getParty(partyId);
      if (partyRoom) {
        partyRoom.removeUser(req.user.userId);
      }

      logger.info(`User ${req.user.userId} left party ${partyId}`);

      return res.json({ message: 'Left watch party successfully' });
    } catch (error) {
      logger.error('Error leaving party:', error);
      return next(error);
    }
  },

  // Delete party (host only)
  async deleteParty(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { partyId } = req.params;
      const WatchParty = mongoose.model<WatchPartyDocument>('WatchParty');

      const party = await WatchParty.findById(partyId);
      if (!party) {
        return res.status(404).json({ error: 'Watch party not found' });
      }

      // Only host can delete party
      if (party.hostId.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ error: 'Only host can delete the party' });
      }

      // Mark party as inactive
      party.isActive = false;
      await party.save();

      // Remove WebSocket room
      const watchPartyManager = WatchPartyManager.getInstance();
      watchPartyManager.deleteParty((party._id as mongoose.Types.ObjectId).toString());

      logger.info(`Party ${partyId} deleted by host ${req.user.userId}`);

      return res.json({ message: 'Watch party deleted successfully' });
    } catch (error) {
      logger.error('Error deleting party:', error);
      return next(error);
    }
  }
};
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';
import { WatchPartyManager } from '../websocket/WatchPartyManager';

interface WatchPartyDocument extends mongoose.Document {
  movieId: string | mongoose.Types.ObjectId;
  hostId: string | mongoose.Types.ObjectId;
  status: 'waiting' | 'playing' | 'paused' | 'ended';
  currentTime: number;
  participants: {
    userId: string | mongoose.Types.ObjectId;
    username: string;
    joinedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface Participant {
  userId: string | mongoose.Types.ObjectId;
  username: string;
  joinedAt: Date;
}

export const watchPartyController = {
  async createParty(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { movieId } = req.body;
      const WatchParty = mongoose.model<WatchPartyDocument>('WatchParty');
      const Movie = mongoose.model('Movie');

      // Check if movie exists
      const movie = await Movie.findById(movieId);
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
      }

      // Create watch party
      const party = await WatchParty.create({
        movieId,
        hostId: req.user.userId,
        status: 'waiting',
        currentTime: 0,
        participants: [{
          userId: req.user.userId,
          username: req.user.username,
          joinedAt: new Date()
        }]
      });

      // Create WebSocket room
      const watchPartyManager = WatchPartyManager.getInstance();
      watchPartyManager.createParty(
        watchPartyManager.getUserConnection(req.user.userId)!,
        `Party ${party._id}`,
        Number(movieId),
        Number(party._id)
      );

      return res.status(201).json(party);
    } catch (error) {
      return next(error);
    }
  },

  async joinParty(req: AuthRequest, res: Response, next: NextFunction) {
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

      // Check if user is already in the party
      const isParticipant = party.participants.some(
        (p: Participant) => p.userId.toString() === req.user!.userId.toString()
      );

      if (isParticipant) {
        return res.status(409).json({ error: 'Already in watch party' });
      }

      // Add user to party
      party.participants.push({
        userId: new mongoose.Types.ObjectId(req.user.userId),
        username: req.user.username,
        joinedAt: new Date()
      });

      await party.save();

      // Notify room of new participant
      const watchPartyManager = WatchPartyManager.getInstance();
      const partyRoom = watchPartyManager.getParty(Number(partyId));
      if (partyRoom) {
        const userWs = watchPartyManager.getUserConnection(req.user.userId);
        if (userWs) {
          partyRoom.addUser(userWs);
        }
      }

      return res.json(party);
    } catch (error) {
      return next(error);
    }
  },

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

      // If no participants left, end the party
      if (party.participants.length === 0) {
        party.status = 'ended';
        const watchPartyManager = WatchPartyManager.getInstance();
        watchPartyManager.deleteParty(Number(partyId));
      } else if (party.hostId.toString() === req.user.userId.toString()) {
        // If host leaves, assign new host
        party.hostId = party.participants[0].userId;
      }

      await party.save();

      // Notify room of participant leaving
      const watchPartyManager = WatchPartyManager.getInstance();
      const partyRoom = watchPartyManager.getParty(Number(partyId));
      if (partyRoom) {
        partyRoom.removeUser(req.user.userId);
      }

      return res.json({ message: 'Left watch party successfully' });
    } catch (error) {
      return next(error);
    }
  },

  async getPartyDetails(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { partyId } = req.params;
      const WatchParty = mongoose.model<WatchPartyDocument>('WatchParty');

      const party = await WatchParty.findById(partyId)
        .populate('movieId', 'title thumbnailUrl')
        .populate('hostId', 'username');

      if (!party) {
        return res.status(404).json({ error: 'Watch party not found' });
      }

      return res.json(party);
    } catch (error) {
      return next(error);
    }
  },

  async updatePartyStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { partyId } = req.params;
      const { status, currentTime } = req.body;
      const WatchParty = mongoose.model<WatchPartyDocument>('WatchParty');

      const party = await WatchParty.findById(partyId);
      if (!party) {
        return res.status(404).json({ error: 'Watch party not found' });
      }

      // Only host can update status
      if (party.hostId.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ error: 'Only host can update party status' });
      }

      // Update party status
      party.status = status;
      if (currentTime !== undefined) {
        party.currentTime = currentTime;
      }

      await party.save();

      // Notify room of status update
      const watchPartyManager = WatchPartyManager.getInstance();
      const partyRoom = watchPartyManager.getParty(Number(partyId));
      if (partyRoom) {
        partyRoom.updateVideoState(req.user.userId, {
          isPlaying: status === 'playing',
          currentTime: currentTime || 0
        });
      }

      return res.json(party);
    } catch (error) {
      return next(error);
    }
  },

  async getActiveParties(_req: Request, res: Response, next: NextFunction) {
    try {
      const WatchParty = mongoose.model<WatchPartyDocument>('WatchParty');

      const parties = await WatchParty.find({ status: { $ne: 'ended' } })
        .populate('movieId', 'title thumbnailUrl')
        .populate('hostId', 'username')
        .sort({ createdAt: -1 });

      return res.json(parties);
    } catch (error) {
      return next(error);
    }
  },

  async getUserParties(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const WatchParty = mongoose.model<WatchPartyDocument>('WatchParty');
      const parties = await WatchParty.find({
        'participants.userId': req.user.userId,
        status: { $ne: 'ended' }
      })
        .populate('movieId', 'title thumbnailUrl')
        .populate('hostId', 'username')
        .sort({ createdAt: -1 });

      return res.json(parties);
    } catch (error) {
      return next(error);
    }
  },

  async joinByInviteCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { inviteCode } = req.params;
      const WatchParty = mongoose.model<WatchPartyDocument>('WatchParty');

      const party = await WatchParty.findOne({ inviteCode, status: { $ne: 'ended' } });
      if (!party) {
        return res.status(404).json({ error: 'Invalid invite code' });
      }

      // Check if user is already in the party
      const isParticipant = party.participants.some(
        (p: Participant) => p.userId.toString() === req.user!.userId.toString()
      );

      if (isParticipant) {
        return res.status(409).json({ error: 'Already in watch party' });
      }

      // Add user to party
      party.participants.push({
        userId: new mongoose.Types.ObjectId(req.user.userId),
        username: req.user.username,
        joinedAt: new Date()
      });

      await party.save();

      return res.json(party);
    } catch (error) {
      return next(error);
    }
  },

  async sendInvitation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { partyId } = req.params;
      const { userId } = req.body;
      const WatchParty = mongoose.model<WatchPartyDocument>('WatchParty');

      const party = await WatchParty.findById(partyId);
      if (!party) {
        return res.status(404).json({ error: 'Watch party not found' });
      }

      // Only host can send invitations
      if (party.hostId.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ error: 'Only host can send invitations' });
      }

      // Create invitation
      const Invitation = mongoose.model('Invitation');
      await Invitation.create({
        partyId: party._id,
        senderId: req.user.userId,
        receiverId: userId,
        status: 'pending'
      });

      return res.json({ message: 'Invitation sent successfully' });
    } catch (error) {
      return next(error);
    }
  },

  async getReceivedInvitations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const Invitation = mongoose.model('Invitation');
      const invitations = await Invitation.find({
        receiverId: req.user.userId,
        status: 'pending'
      })
        .populate('partyId', 'roomName')
        .populate('senderId', 'username')
        .sort({ createdAt: -1 });

      return res.json(invitations);
    } catch (error) {
      return next(error);
    }
  },

  async respondToInvitation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { invitationId } = req.params;
      const { response } = req.body;
      const Invitation = mongoose.model('Invitation');

      const invitation = await Invitation.findById(invitationId);
      if (!invitation) {
        return res.status(404).json({ error: 'Invitation not found' });
      }

      if (invitation.receiverId.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ error: 'Not authorized to respond to this invitation' });
      }

      invitation.status = response === 'accept' ? 'accepted' : 'rejected';
      await invitation.save();

      if (response === 'accept') {
        // Add user to party
        const WatchParty = mongoose.model<WatchPartyDocument>('WatchParty');
        const party = await WatchParty.findById(invitation.partyId);
        if (party) {
          party.participants.push({
            userId: new mongoose.Types.ObjectId(req.user.userId),
            username: req.user.username,
            joinedAt: new Date()
          });
          await party.save();
        }
      }

      return res.json({ message: 'Invitation response recorded' });
    } catch (error) {
      return next(error);
    }
  }
};
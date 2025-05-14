import mongoose, { Document, Schema } from 'mongoose';
import { WatchPartyType, ParticipantType, ChatMessageType } from '../types/watchParty';

export interface WatchPartyDocument extends Omit<WatchPartyType, 'id'>, Document {}

const participantSchema = new Schema<ParticipantType>({
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const chatMessageSchema = new Schema<ChatMessageType>({
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const watchPartySchema = new Schema<WatchPartyDocument>({
  name: {
    type: String
  },
  movieId: {
    type: String,
    required: true,
    ref: 'Movie'
  },
  hostId: {
    type: String,
    required: true,
    ref: 'User'
  },
  currentTime: {
    type: Number,
    default: 0
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  participants: [participantSchema],
  chatMessages: [chatMessageSchema]
}, {
  timestamps: true
});

export const WatchParty = mongoose.model<WatchPartyDocument>('WatchParty', watchPartySchema);
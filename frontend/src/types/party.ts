export interface Party {
  id: string;
  roomName: string;
  inviteCode: string;
  inviteLink: string;
  hostId: string;
  hostName: string;
  currentMovieId?: string;
  movieTitle?: string;
  moviePoster?: string;
  participants: Participant[];
  participantCount: number;
  maxParticipants?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Participant {
  userId: string;
  username: string;
  joinedAt: string;
  isHost: boolean;
  isOnline: boolean;
  avatarUrl?: string;
}

export interface CreatePartyRequest {
  movieId: string;
  name: string;  // Frontend uses 'name', backend maps to 'roomName'
  description?: string;
  isPrivate?: boolean;
  maxParticipants?: number;
  startTime?: string;
  password?: string;
}

export interface JoinPartyRequest {
  partyId: string;
  password?: string;
}

export interface SendInvitationRequest {
  recipientIds?: string[];
  recipientEmails?: string[];
  message?: string;
}

export interface PartyInvitation {
  _id: string;
  partyId: {
    _id: string;
    roomName: string;
    currentMovieId?: {
      title: string;
      posterUrl: string;
    };
    hostId: {
      username: string;
    };
  };
  senderId: {
    username: string;
  };
  message: string;
  inviteCode: string;
  inviteLink: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: string;
  createdAt: string;
}

export interface PartyInfo {
  roomName: string;
  movieTitle?: string;
  moviePoster?: string;
  hostName: string;
  participantCount: number;
  createdAt: string;
  inviteCode: string;
}

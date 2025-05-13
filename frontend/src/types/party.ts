export interface Party {
  id: string;
  movieId: string;
  name: string;
  description?: string;
  host: string;
  hostId: string;
  participants: number;
  maxParticipants: number;
  startTime: string;
  isPrivate: boolean;
  password?: string;
  createdAt: string;
}

export interface CreatePartyRequest {
  movieId: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  password?: string;
  maxParticipants: number;
  startTime: string;
}

export interface JoinPartyRequest {
  partyId: string;
  password?: string;
}
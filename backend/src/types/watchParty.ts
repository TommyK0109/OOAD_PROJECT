export interface WatchPartyType {
    id: string;
    name?: string;
    movieId: string;
    hostId: string;
    currentTime: number;
    isPlaying: boolean;
    participants: ParticipantType[];
    chatMessages: ChatMessageType[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface ParticipantType {
    userId: string;
    username: string;
    joinedAt: Date;
  }
  
  export interface ChatMessageType {
    userId: string;
    username: string;
    message: string;
    timestamp: Date;
  }
  
  export interface WatchPartyEventType {
    type: 'play' | 'pause' | 'seek' | 'join' | 'leave' | 'chat';
    payload: any;
    timestamp: Date;
  }
  
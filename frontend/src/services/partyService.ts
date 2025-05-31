import { authService } from './authService';

// API Base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

// Types
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

class PartyService {
  private getAuthHeaders() {
    return authService.getAuthHeader();
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Create a new watch party
  async createParty(data: CreatePartyRequest): Promise<Party> {
    try {
      const response = await fetch(`${API_BASE}/parties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse(response);
      return this.formatPartyResponse(result);
    } catch (error) {
      console.error('Failed to create party:', error);
      throw error;
    }
  }

  // Get party details by ID
  async getPartyById(partyId: string): Promise<Party> {
    try {
      const response = await fetch(`${API_BASE}/parties/${partyId}`, {
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse(response);
      return this.formatPartyResponse(result);
    } catch (error) {
      console.error('Failed to get party details:', error);
      throw error;
    }
  }

  // Join party by invite code
  async joinPartyByInviteCode(inviteCode: string): Promise<Party> {
    try {
      const response = await fetch(`${API_BASE}/parties/join/${inviteCode}`, {
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse(response);
      return this.formatPartyResponse(result);
    } catch (error) {
      console.error('Failed to join party:', error);
      throw error;
    }
  }

  // Join by invite code with enhanced response
  async joinByInviteCode(inviteCode: string): Promise<{ success: boolean; message: string; partyId: string; redirectTo: string; alreadyJoined: boolean }> {
    try {
      const response = await fetch(`${API_BASE}/parties/join/${inviteCode}`, {
        headers: this.getAuthHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to join party by invite code:', error);
      throw error;
    }
  }

  // Validate invite code without joining
  async validateInviteCode(inviteCode: string): Promise<{ valid: boolean; party?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/parties/validate/${inviteCode}`);

      if (!response.ok) {
        return { valid: false, error: 'Invalid invite code' };
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to validate invite code:', error);
      return { valid: false, error: 'Failed to validate invite code' };
    }
  }

  // Get party info by invite code (public, no auth required)
  async getPartyInfoByInviteCode(inviteCode: string): Promise<PartyInfo> {
    try {
      const response = await fetch(`${API_BASE}/parties/join/${inviteCode}/info`);

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Party not found or no longer active');
      }
    } catch (error) {
      console.error('Failed to get party info:', error);
      throw error;
    }
  }

  // Leave party
  async leaveParty(partyId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/parties/${partyId}/leave`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to leave party:', error);
      throw error;
    }
  }

  // Delete party (host only)
  async deleteParty(partyId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/parties/${partyId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to delete party:', error);
      throw error;
    }
  }

  // Send invitations
  async sendInvitations(partyId: string, data: SendInvitationRequest): Promise<{ message: string; invitations: number; inviteLink: string }> {
    try {
      const response = await fetch(`${API_BASE}/parties/${partyId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to send invitations:', error);
      throw error;
    }
  }

  // Get received invitations
  async getReceivedInvitations(): Promise<PartyInvitation[]> {
    try {
      const response = await fetch(`${API_BASE}/parties/invitations/received`, {
        headers: this.getAuthHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to get invitations:', error);
      throw error;
    }
  }

  // Respond to invitation
  async respondToInvitation(invitationId: string, response: 'accept' | 'decline'): Promise<{ message: string; partyId?: string; inviteCode?: string }> {
    try {
      const apiResponse = await fetch(`${API_BASE}/parties/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ response }),
      });

      return await this.handleResponse(apiResponse);
    } catch (error) {
      console.error('Failed to respond to invitation:', error);
      throw error;
    }
  }

  // Get user's parties
  async getUserParties(): Promise<Party[]> {
    try {
      const response = await fetch(`${API_BASE}/parties`, {
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse(response);
      return result.map((party: any) => this.formatPartyResponse(party));
    } catch (error) {
      console.error('Failed to get user parties:', error);
      throw error;
    }
  }

  // Get active public parties
  async getActiveParties(): Promise<Party[]> {
    try {
      const response = await fetch(`${API_BASE}/parties/active`, {
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse(response);
      return result.map((party: any) => this.formatPartyResponse(party));
    } catch (error) {
      console.error('Failed to get active parties:', error);
      throw error;
    }
  }

  // Get parties for a specific movie
  async getPartiesByMovieId(movieId: string): Promise<Party[]> {
    try {
      const parties = await this.getActiveParties();
      return parties.filter(party => party.currentMovieId === movieId);
    } catch (error) {
      console.error('Failed to get parties by movie:', error);
      throw error;
    }
  }

  // Utility function to format party response from backend
  private formatPartyResponse(party: any): Party {
    return {
      id: party._id || party.id,
      roomName: party.roomName,
      inviteCode: party.inviteCode,
      inviteLink: party.inviteLink || `${window.location.origin}/join/${party.inviteCode}`,
      hostId: party.hostId?._id || party.hostId,
      hostName: party.hostId?.username || 'Unknown Host',
      currentMovieId: party.currentMovieId?._id || party.currentMovieId,
      movieTitle: party.currentMovieId?.title,
      moviePoster: party.currentMovieId?.posterUrl,
      participants: this.formatParticipants(party.participants || []),
      participantCount: party.participants?.length || 0,
      maxParticipants: party.maxParticipants,
      isActive: party.isActive !== false,
      createdAt: party.createdAt,
      updatedAt: party.updatedAt,
    };
  }

  // Format participants array
  private formatParticipants(participants: any[]): Participant[] {
    return participants.map(participant => ({
      userId: participant.userId?._id || participant.userId,
      username: participant.userId?.username || participant.username || 'Unknown User',
      joinedAt: participant.joinedAt,
      isHost: false, // This will be determined by comparing with hostId
      isOnline: true, // This would come from WebSocket status
      avatarUrl: `https://i.pravatar.cc/150?u=${participant.userId?._id || participant.userId}`,
    }));
  }

  // Generate invite link for sharing
  generateInviteLink(inviteCode: string): string {
    return `${window.location.origin}/join/${inviteCode}`;
  }

  // Validate invite code format
  isValidInviteCode(inviteCode: string): boolean {
    return /^[A-Z0-9]{6,12}$/.test(inviteCode);
  }
}

// Export singleton instance
export const partyService = new PartyService();

// Legacy exports for backward compatibility
export const createParty = (data: CreatePartyRequest) => partyService.createParty(data);
export const getPartyById = (partyId: string) => partyService.getPartyById(partyId);
export const getPartiesByMovieId = (movieId: string) => partyService.getPartiesByMovieId(movieId);
export const getPublicParties = () => partyService.getActiveParties();
export const joinParty = ({ partyId, password }: { partyId: string; password?: string }) => {
  // For legacy compatibility, assume partyId is actually inviteCode
  return partyService.joinPartyByInviteCode(partyId);
};
export const leaveParty = (partyId: string) => partyService.leaveParty(partyId);

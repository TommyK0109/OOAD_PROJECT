import { Party, CreatePartyRequest, JoinPartyRequest } from '../types/party';

// Mock data for development
const mockParties: Party[] = [
  {
    id: 'party1',
    movieId: '1', // Angles and Demons
    name: "Tom's Angels & Demons Party",
    description: "Let's watch this thriller together!",
    host: "MovieBuff",
    hostId: "user1",
    participants: 3,
    maxParticipants: 10,
    startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    isPrivate: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'party2',
    movieId: '1', // Angles and Demons
    name: "Movie Night with Friends",
    description: "Friday night movie ritual",
    host: "FilmFan",
    hostId: "user2",
    participants: 5,
    maxParticipants: 8,
    startTime: new Date(Date.now() + 1800000).toISOString(), // 30 mins from now
    isPrivate: true,
    password: "secret123",
    createdAt: new Date().toISOString()
  },
  {
    id: 'party3',
    movieId: '3', // Family Guy
    name: "Family Guy Marathon",
    description: "Binge watching the funniest episodes",
    host: "ComedyLover",
    hostId: "user3",
    participants: 7,
    maxParticipants: 15,
    startTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
    isPrivate: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'party4',
    movieId: '4', // Solo Leveling
    name: "Anime Night: Solo Leveling",
    description: "First time watching this series!",
    host: "AnimeFan",
    hostId: "user4",
    participants: 4,
    maxParticipants: 10,
    startTime: new Date(Date.now() + 5400000).toISOString(), // 1.5 hours from now
    isPrivate: true,
    password: "anime123",
    createdAt: new Date().toISOString()
  }
];

// Get all parties for a specific movie
export const getPartiesByMovieId = async (movieId: string): Promise<Party[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const parties = mockParties.filter(party => party.movieId === movieId);
      resolve(parties);
    }, 800); // Simulate network delay
  });
};

// Get all public parties (for discovery)
export const getPublicParties = async (): Promise<Party[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const publicParties = mockParties.filter(party => !party.isPrivate);
      resolve(publicParties);
    }, 800);
  });
};

// Get a specific party by ID
export const getPartyById = async (partyId: string): Promise<Party | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const party = mockParties.find(p => p.id === partyId) || null;
      resolve(party);
    }, 500);
  });
};

// Create a new party
export const createParty = async (partyData: CreatePartyRequest): Promise<Party> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, this would be handled by the backend
      const newParty: Party = {
        id: 'party-' + Math.random().toString(36).substring(2, 11),
        movieId: partyData.movieId,
        name: partyData.name,
        description: partyData.description,
        host: "Current User", // This would be the logged-in user
        hostId: "current-user-id", // This would be the logged-in user ID
        participants: 1, // Start with just the host
        maxParticipants: partyData.maxParticipants,
        startTime: partyData.startTime,
        isPrivate: partyData.isPrivate,
        password: partyData.password,
        createdAt: new Date().toISOString()
      };
      
      // In a real app, the new party would be saved to a database
      // For our mock, we could push to the array, but that's not necessary
      // since it's just mock data
      
      resolve(newParty);
    }, 1000);
  });
};

// Join a party
export const joinParty = async (request: JoinPartyRequest): Promise<Party | null> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const party = mockParties.find(p => p.id === request.partyId);
      
      if (!party) {
        reject(new Error("Party not found"));
        return;
      }
      
      if (party.isPrivate && party.password !== request.password) {
        reject(new Error("Incorrect password"));
        return;
      }
      
      if (party.participants >= party.maxParticipants) {
        reject(new Error("Party is full"));
        return;
      }
      
      // In a real app, we would update the party's participants list
      // For our mock, we'll just return the party
      resolve(party);
    }, 800);
  });
};

// Leave a party
export const leaveParty = async (partyId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, we would remove the user from the party
      resolve(true);
    }, 500);
  });
};
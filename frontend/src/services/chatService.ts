import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
  isHost?: boolean; // Add isHost property for host badge
  // Remove avatarUrl as we're using initials now
}

// Mock data for chat messages
const generateMockMessages = (partyId: string): ChatMessage[] => {
  const messages: ChatMessage[] = [];
  const usernames = ["MovieBuff", "FilmFan", "CinemaLover", "MovieGeek", "FlickChick"];
  
  // Generate 10-20 random messages
  const messageCount = Math.floor(Math.random() * 11) + 10;
  
  for (let i = 0; i < messageCount; i++) {
    const userId = `user-${(i % 5) + 1}`;
    const username = usernames[i % 5];
    
    // Create messages spaced over the last 30 minutes
    const timestamp = new Date(Date.now() - (i * 2 * 60000)).toISOString();
    
    // Generate message text based on user and position in conversation
    let text = '';
    if (i === 0) {
      text = "Hey everyone, welcome to the party!";
    } else if (i === 1) {
      text = "Thanks for hosting!";
    } else if (i === 2) {
      text = "I've been waiting to watch this movie for ages!";
    } else if (i % 5 === 0) {
      text = "This part is so good!";
    } else if (i % 7 === 0) {
      text = "Can you pause for a sec? Getting snacks!";
    } else if (i % 4 === 0) {
      text = "What do you guys think so far?";
    } else {
      const phrases = [
        "Awesome scene!",
        "I didn't see that coming",
        "The cinematography is amazing",
        "Who's your favorite character?",
        "The music fits so well",
        "This director always delivers",
        "I'm confused about the plot",
        "Is that the same actor from...?",
        "Classic moment right here",
        "I need more popcorn lol"
      ];
      text = phrases[Math.floor(Math.random() * phrases.length)];
    }
    
    messages.push({
      id: uuidv4(),
      userId,
      username,
      text,
      timestamp,
      isHost: userId === 'user-1' // Make the first user a host
    });
  }
  
  // Sort by timestamp (oldest first)
  return messages.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
};

// Get messages for a party
export const getChatMessages = async (partyId: string): Promise<ChatMessage[]> => {
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      resolve(generateMockMessages(partyId));
    }, 800);
  });
};

// Send a message
export const sendChatMessage = async (partyId: string, message: string): Promise<ChatMessage> => {
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      const newMessage: ChatMessage = {
        id: uuidv4(),
        userId: 'current-user', // Assume this is the current user
        username: 'You',
        text: message,
        timestamp: new Date().toISOString(),
        isHost: false // Current user is not a host in this example
      };
      resolve(newMessage);
    }, 300);
  });
};

// Add function to get active users
export interface ActiveUser {
  userId: string;
  username: string;
  isActive: boolean;
  isHost: boolean;
}

export const getActiveUsers = async (partyId: string): Promise<ActiveUser[]> => {
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      const users: ActiveUser[] = [];
      const usernames = ["MovieBuff", "FilmFan", "CinemaLover", "MovieGeek", "FlickChick"];
      
      for (let i = 0; i < 5; i++) {
        const userId = `user-${i + 1}`;
        users.push({
          userId,
          username: usernames[i],
          isActive: Math.random() > 0.3, // 70% chance of being active
          isHost: i === 0 // First user is host
        });
      }
      
      // Add current user
      users.push({
        userId: 'current-user',
        username: 'You',
        isActive: true, // Current user is always active
        isHost: false
      });
      
      resolve(users);
    }, 500);
  });
};
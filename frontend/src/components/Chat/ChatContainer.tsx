// src/components/Chat/ChatContainer.tsx
import { useState, useEffect, useRef } from 'react';
import './Chat.css';
import { getChatMessages, sendChatMessage, ChatMessage, getActiveUsers } from '../../services/chatService';
import { useWebSocket } from '../../hooks/useWebSocket';

interface Participant {
  userId: string;
  username: string;
  isActive: boolean;
  isHost: boolean;
}

interface ChatContainerProps {
  partyId: string;
  participants?: Participant[]; // Optional if you want to pass in the participants
}

const UserAvatar = ({ username, isActive, isHost }: { username: string, isActive?: boolean, isHost?: boolean }) => {
  // Get first letter of username
  const initial = username ? username.charAt(0).toUpperCase() : '?';
  
  // Generate a consistent color based on the username
  const getColorFromUsername = (name: string) => {
    const colors = [
      '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
      '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
      '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722'
    ];
    
    // Simple hash function to get consistent color for same username
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  const bgColor = getColorFromUsername(username);
  
  return (
    <div className="avatar-container">
      <div 
        className="user-avatar" 
        style={{
          backgroundColor: bgColor,
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '14px',
          position: 'relative'
        }}
      >
        {initial}
        {isActive !== undefined && (
          <div 
            className={`status-indicator ${isActive ? 'active' : 'inactive'}`} 
            style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              bottom: '0',
              right: '0',
              border: '1px solid #1c1d24',
              backgroundColor: isActive ? '#4caf50' : '#f44336'
            }}
          />
        )}
      </div>
      {isHost && (
        <div 
          className="host-badge"
          style={{
            fontSize: '8px',
            backgroundColor: '#ffc107',
            color: '#000',
            padding: '1px 3px',
            borderRadius: '2px',
            marginLeft: '4px',
            fontWeight: 'bold'
          }}
        >
          HOST
        </div>
      )}
    </div>
  );
};

const ChatContainer = ({ partyId }: ChatContainerProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { connectionStatus } = useWebSocket();
  
  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const chatMessages = await getChatMessages(partyId);
        setMessages(chatMessages);
      } catch (error) {
        console.error('Failed to load chat messages:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (partyId) {
      loadMessages();
    }
  }, [partyId]);
  
  // Add code to fetch active users and update the activeUsers state
  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const users = await getActiveUsers(partyId);
        const activeMap: Record<string, boolean> = {};
        users.forEach(user => {
          activeMap[user.userId] = user.isActive;
        });
        setActiveUsers(activeMap);
      } catch (error) {
        console.error('Failed to fetch active users:', error);
      }
    };
    
    if (partyId) {
      fetchActiveUsers();
      
      // Set up polling or websocket connection to get updates
      const interval = setInterval(fetchActiveUsers, 30000);
      return () => clearInterval(interval);
    }
  }, [partyId]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !partyId) return;
    
    try {
      const sentMessage = await sendChatMessage(partyId, newMessage);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Live Chat</h3>
        <div className="chat-header-controls">
          <div className="connection-status-compact">
            <div className={`connection-indicator ${connectionStatus}`} />
            {connectionStatus === 'disconnected' && (
              <span className="reconnect-text">Reconnecting...</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="messages">
        {loading ? (
          <div className="loading-messages">Loading chat history...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">No messages yet. Be the first to chat!</div>
        ) : (
          messages.map(message => (
            <div 
              key={message.id} 
              className={`message ${message.userId === 'current-user' ? 'own-message' : ''}`}
            >
              <div className="message-header">
                <UserAvatar 
                  username={message.username} 
                  isActive={activeUsers[message.userId]} 
                  isHost={message.isHost} 
                />
                <span className="username">{message.username}</span>
                <span className="timestamp">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="message-content">{message.text}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form 
        className="message-input" 
        onSubmit={handleSendMessage}
        style={{
          display: 'flex',
          padding: '1rem',
          borderTop: '1px solid #3a3b42',
          backgroundColor: '#1c1d24'
        }}
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && newMessage.trim()) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
          style={{
            flex: 1,
            backgroundColor: '#2c2d34',
            border: 'none',
            padding: '0.8rem',
            borderRadius: '4px',
            color: '#e1e1e1',
            width: '100%'
          }}
        />
      </form>
    </div>
  );
};

export default ChatContainer;

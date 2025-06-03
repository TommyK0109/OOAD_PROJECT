// src/components/Chat/ChatContainer.tsx
import { useState, useEffect, useRef } from 'react';
import './ChatContainer.css';
import { getChatMessages, ChatMessage, getActiveUsers } from '../../services/chatService';
import { useWebSocketContext } from '../../context/WebSocketContext';

interface Participant {
  userId: string;
  username: string;
  isActive: boolean;
  isHost: boolean;
}

interface ChatContainerProps {
  partyId: string;
  participants?: Participant[];
}

const UserAvatar = ({ username, isActive, isHost }: { username: string, isActive?: boolean, isHost?: boolean }) => {
  const initial = username ? username.charAt(0).toUpperCase() : '?';

  const getColorFromUsername = (name: string) => {
    const colors = [
      '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
      '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
      '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722'
    ];

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
  const { sendChatMessage, connectionStatus, isAuthenticated } = useWebSocketContext();

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

  // Handle real-time chat messages
  useEffect(() => {
    const handleChatMessage = (event: CustomEvent) => {
      const messageData = event.detail;
      const newChatMessage: ChatMessage = {
        id: messageData.messageId || Date.now().toString(),
        userId: messageData.userId,
        username: messageData.username,
        text: messageData.content,
        timestamp: new Date(messageData.timestamp).toISOString(),
        isHost: messageData.isHost || false
      };

      setMessages(prev => {
        // Avoid duplicate messages
        const exists = prev.some(msg => msg.id === newChatMessage.id);
        if (exists) return prev;

        return [...prev, newChatMessage];
      });
    };

    const handleChatHistory = (event: CustomEvent) => {
      const { messages: historyMessages } = event.detail;
      const formattedMessages: ChatMessage[] = historyMessages.map((msg: any) => ({
        id: msg.messageId,
        userId: msg.userId,
        username: msg.username,
        text: msg.content,
        timestamp: new Date(msg.timestamp).toISOString(),
        isHost: msg.isHost || false
      }));

      setMessages(formattedMessages);
      setLoading(false);
    };

    const handleParticipantUpdate = () => {
      // Refresh active users when participants change
      fetchActiveUsers();
    };

    window.addEventListener('ws:chat_message', handleChatMessage as EventListener);
    window.addEventListener('ws:chat_history', handleChatHistory as EventListener);
    window.addEventListener('ws:participant_joined', handleParticipantUpdate as EventListener);
    window.addEventListener('ws:participant_left', handleParticipantUpdate as EventListener);

    return () => {
      window.removeEventListener('ws:chat_message', handleChatMessage as EventListener);
      window.removeEventListener('ws:chat_history', handleChatHistory as EventListener);
      window.removeEventListener('ws:participant_joined', handleParticipantUpdate as EventListener);
      window.removeEventListener('ws:participant_left', handleParticipantUpdate as EventListener);
    };
  }, []);

  // Fetch active users
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

  useEffect(() => {
    if (partyId) {
      fetchActiveUsers();
      const interval = setInterval(fetchActiveUsers, 30000);
      return () => clearInterval(interval);
    }
  }, [partyId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    // Only auto-scroll if user is already at bottom or new message is from current user
    const messagesContainer = messagesEndRef.current?.parentElement;
    if (!messagesContainer) return;
    
    const isScrolledToBottom = 
      messagesContainer.scrollHeight - messagesContainer.clientHeight <= 
      messagesContainer.scrollTop + 50; // Add tolerance of 50px
    
    const isNewMessageFromCurrentUser = messages.length > 0 && 
      messages[messages.length - 1]?.userId === 'current-user';
    
    if (isScrolledToBottom || isNewMessageFromCurrentUser) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle sending a new message via WebSocket
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !partyId || !isAuthenticated) return;

    try {
      // Send via WebSocket
      sendChatMessage(newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      // Fallback to local addition if WebSocket fails
      const fallbackMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: 'current-user',
        username: 'You',
        text: newMessage,
        timestamp: new Date().toISOString(),
        isHost: false
      };
      setMessages(prev => [...prev, fallbackMessage]);
      setNewMessage('');
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
            {!isAuthenticated && connectionStatus === 'connected' && (
              <span className="auth-text">Authenticating...</span>
            )}
          </div>
        </div>
      </div>

      <div 
        className="messages"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          maxHeight: '250px', // Shows about 3-4 messages
          padding: '10px',
          scrollBehavior: 'smooth',
        }}
      >
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
        <div ref={messagesEndRef} style={{ float: 'left', clear: 'both' }} />
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
          placeholder={
            !isAuthenticated
              ? "Connecting..."
              : connectionStatus !== 'connected'
                ? "Reconnecting..."
                : "Type a message..."
          }
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={loading || !isAuthenticated || connectionStatus !== 'connected'}
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
            width: '100%',
            opacity: (!isAuthenticated || connectionStatus !== 'connected') ? 0.6 : 1
          }}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || !isAuthenticated || connectionStatus !== 'connected'}
          style={{
            marginLeft: '0.5rem',
            padding: '0.8rem 1rem',
            backgroundColor: '#5865f2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: (!newMessage.trim() || !isAuthenticated || connectionStatus !== 'connected') ? 0.6 : 1
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatContainer;
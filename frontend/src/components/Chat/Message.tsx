import React from 'react';
import './Chat.css';

interface MessageProps {
  message: {
    id: string;
    userId: string;
    username: string;
    text: string;
    timestamp: string;
  };
  isOwnMessage: boolean;
}

const UserAvatar = ({ username }: { username: string }) => {
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
    <div 
      className="user-avatar" 
      style={{
        backgroundColor: bgColor,
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: '12px'
      }}
    >
      {initial}
    </div>
  );
};

const Message: React.FC<MessageProps> = ({ message, isOwnMessage }) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message ${isOwnMessage ? 'own-message' : ''}`}>
      <div className="message-header">
        <UserAvatar username={message.username} />
        <span className="username">{message.username}</span>
        <span className="timestamp">{formatTime(message.timestamp)}</span>
      </div>
      <div className="message-text">{message.text}</div>
    </div>
  );
};

export default Message;

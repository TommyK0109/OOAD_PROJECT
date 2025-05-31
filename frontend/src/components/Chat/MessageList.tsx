import React, { useEffect, useRef } from 'react';
import Message from './Message';
import './Chat.css';

interface MessageType {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
}

interface MessageListProps {
  messages: MessageType[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="no-messages">No messages yet. Start the conversation!</div>
      ) : (
        <>
          {messages.map(message => (
            <Message 
              key={message.id} 
              message={message} 
              isOwnMessage={message.userId === 'current-user'} 
            />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageList;

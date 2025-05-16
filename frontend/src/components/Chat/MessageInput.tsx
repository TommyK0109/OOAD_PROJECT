// src/components/Chat/MessageInput.tsx
import React, { useState } from 'react';
import './Chat.css';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  isDisabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isDisabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isDisabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={isDisabled ? "Reconnecting..." : "Type a message..."}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isDisabled}
      />
      <button type="submit" disabled={isDisabled || !message.trim()}>
        Send
      </button>
    </form>
  );
};

export default MessageInput;

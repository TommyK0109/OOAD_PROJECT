import { useContext } from 'react';
import { useWebSocketContext } from '../context/WebSocketContext';

export const useWebSocket = () => {
  const context = useWebSocketContext();

  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }

  return {
    socket: context.socket,
    connectionStatus: context.connectionStatus,
    sendMessage: context.sendMessage
  };
};

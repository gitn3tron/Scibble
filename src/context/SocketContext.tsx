import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    // Prevent multiple connections
    if (socket) return;

    const currentHostname = window.location.hostname;
    const serverPort = '3001';
    
    const serverUrl = import.meta.env.PROD
      ? import.meta.env.VITE_SERVER_URL
      : `${window.location.protocol}//${currentHostname}:${serverPort}`;

    console.log('🔌 Creating socket connection to:', serverUrl);

    const socketInstance = io(serverUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 30000,
      transports: ['polling', 'websocket'],
      withCredentials: true,
      forceNew: true,
      autoConnect: true,
      pingTimeout: 60000,
      pingInterval: 25000,
      upgrade: true,
      rememberUpgrade: true,
      path: '/socket.io/'
    });

    socketInstance.on('connect', () => {
      console.log('✅ Connected to server with ID:', socketInstance.id);
      setConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server. Reason:', reason);
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      setConnected(false);
    });

    setSocket(socketInstance);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up socket connection');
      socketInstance.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, []); // Empty dependency array to prevent re-creation

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
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
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  useEffect(() => {
    const connectSocket = () => {
      const currentHostname = window.location.hostname;
      const serverPort = '3001';
      
      // Use the same protocol as the current page to avoid mixed content issues
      const serverUrl = import.meta.env.PROD
        ? import.meta.env.VITE_SERVER_URL
        : `${window.location.protocol}//${currentHostname}:${serverPort}`;

      if (socket) {
        socket.close();
      }

      const socketInstance = io(serverUrl, {
        reconnectionAttempts: maxRetries,
        reconnectionDelay: 5000,      // 5 seconds
        timeout: 60000,               // 1 minute
        transports: ['polling', 'websocket'],
        withCredentials: true,
        forceNew: true,
        autoConnect: true,
        pingTimeout: 60000,           // 1 minute
        pingInterval: 25000,          // 25 seconds
        upgrade: true,
        rememberUpgrade: true,
        path: '/socket.io/',
        rejectUnauthorized: false
      });

      socketInstance.on('connect', () => {
        console.log('Connected to server:', serverUrl);
        setConnected(true);
        setRetryCount(0);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Disconnected from server. Reason:', reason);
        setConnected(false);

        if (reason === 'io server disconnect' || reason === 'transport close') {
          // Server initiated disconnect or transport closed, try reconnecting
          setTimeout(() => {
            if (retryCount < maxRetries) {
              console.log('Attempting to reconnect...');
              socketInstance.connect();
            }
          }, 5000);
        }
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
        setConnected(false);
        setRetryCount(prev => prev + 1);

        if (retryCount < maxRetries) {
          console.log(`Attempting reconnection (${retryCount + 1}/${maxRetries})...`);
          
          // Switch to polling if websocket fails
          if (retryCount > 1) {
            socketInstance.io.opts.transports = ['polling'];
          }
          
          setTimeout(() => {
            socketInstance.connect();
          }, 5000);
        } else {
          console.error('Max retry attempts reached. Please refresh the page or check server status.');
        }
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    };

    if (!socket && retryCount < maxRetries) {
      connectSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket, retryCount]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
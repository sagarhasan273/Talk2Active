import { useCredentials } from '@/core/slices';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { connectSocket } from '../socket';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useCredentials();

  const currentUserId = user?.userId;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    if (!currentUserId) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // 1. Establish ONE singleton socket connection for the user
    const s = connectSocket(currentUserId);
    setSocket(s);

    const handleConnect = () => {
      setIsConnected(true);
      s.emit('join_global_chat', currentUserId);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    s.on('connect', handleConnect);
    s.on('disconnect', handleDisconnect);

    // If already connected when effect runs
    if (s.connected) {
      handleConnect();
    }

    // 2. Clean up connection when user logs out or provider unmounts
    return () => {
      s.off('connect', handleConnect);
      s.off('disconnect', handleDisconnect);
      s.disconnect();
    };
  }, [currentUserId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom Hook to consume the socket anywhere
export const useSocket = () => {
  return useContext(SocketContext);
};

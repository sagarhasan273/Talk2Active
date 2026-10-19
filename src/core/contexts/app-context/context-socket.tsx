// src/core/contexts/context-socket.tsx

import { useCredentials } from '@/core/slices';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { connectSocket } from '../../socket';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUserId } = useCredentials();

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

    if (s.connected) {
      handleConnect();
    }

    return () => {
      s.off('connect', handleConnect);
      s.off('disconnect', handleDisconnect);
      s.disconnect();
    };
  }, [currentUserId]);

  const value = useMemo(() => ({ socket, isConnected }), [socket, isConnected]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
import type { ReactNode } from 'react';

import React, { useContext, createContext } from 'react';

import { useSocket, type UseSocketReturn, type UseSocketOptions } from 'src/hooks/use-socket';

const SocketContext = createContext<UseSocketReturn | null>(null);

interface SocketProviderProps {
  children: ReactNode;
  options?: UseSocketOptions;
}

export function SocketProvider({ children, options }: SocketProviderProps) {
  const socket = useSocket({
    autoConnect: true,
    ...options,
  });

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider');
  }
  return context;
}

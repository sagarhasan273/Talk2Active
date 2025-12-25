import { io, type Socket } from 'socket.io-client';
import { useRef, useState, useEffect, useCallback } from 'react';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

export type UseSocketOptions = {
  autoConnect?: boolean;
  transports?: ('websocket' | 'polling')[];
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  namespace?: string;
  path?: string;
};

export type UseSocketReturn = {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  isError: boolean;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
};

// Singleton socket instance
let globalSocket: Socket | null = null;
let connectionCount = 0;
const globalListeners: Map<string, Set<(...args: any[]) => void>> = new Map();

const GLOBAL_EVENTS = [
  'connect',
  'connect_error',
  'disconnect',
  'reconnect',
  'reconnect_error',
  'reconnect_failed',
];

// ----------------------------------------------------------------------

export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const {
    autoConnect = true,
    transports = ['websocket'],
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
    namespace = '',
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const socketRef = useRef<Socket | null>(null);

  // Create or get singleton socket
  const initializeSocket = useCallback(() => {
    if (globalSocket) {
      socketRef.current = globalSocket;
      return globalSocket;
    }

    const socket = io(`${CONFIG.serverUrl}${namespace}`, {
      transports,
      autoConnect: false,
      reconnection,
      reconnectionAttempts,
      reconnectionDelay,
    });

    // Centralized event dispatcher
    GLOBAL_EVENTS.forEach((event) => {
      socket.on(event, (...args) => {
        globalListeners.get(event)?.forEach((listener) => listener(...args));
      });
    });

    globalSocket = socket;
    socketRef.current = socket;
    return globalSocket;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transports.join(','), reconnection, reconnectionAttempts, reconnectionDelay, namespace]);

  // Register global event listeners for this instance
  const registerGlobalListeners = useCallback(() => {
    const handlers = {
      connect: () => {
        setIsConnected(true);
        setIsConnecting(false);
        setIsError(false);
      },
      connect_error: (err: Error) => {
        setIsError(true);
        setError(err);
        setIsConnecting(false);
      },
      disconnect: () => setIsConnected(false),
      reconnect: () => {
        setIsConnected(true);
        setIsError(false);
      },
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      if (!globalListeners.has(event)) globalListeners.set(event, new Set());
      globalListeners.get(event)!.add(handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        globalListeners.get(event)?.delete(handler);
      });
    };
  }, []);

  // Connect function
  const connect = useCallback(() => {
    const s = initializeSocket();
    if (!s.connected) {
      setIsConnecting(true);
      s.connect();
    }
  }, [initializeSocket]);

  useEffect(() => {
    const cleanup = registerGlobalListeners();
    connectionCount += 1;

    if (autoConnect) connect();

    return () => {
      cleanup();
      connectionCount -= 1;
      if (connectionCount <= 0 && globalSocket) {
        globalSocket.disconnect();
        globalSocket.removeAllListeners();
        globalSocket = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect]);

  // Store socket globally for WebRTC hook access
  useEffect(() => {
    (window as any).socket = globalSocket;
    return () => {
      delete (window as any).socket;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalSocket]);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    isError,
    error,
    connect,
    disconnect: useCallback(() => globalSocket?.disconnect(), []),
    reconnect: connect,
  };
}

// ----------------------------------------------------------------------

// Helper functions for manual singleton management

export function getGlobalSocket(): Socket | null {
  return globalSocket;
}

export function disconnectGlobalSocket(): void {
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
    connectionCount = 0;
    globalListeners.clear();
  }
}

export function isGlobalSocketConnected(): boolean {
  return globalSocket?.connected || false;
}

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

export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const {
    autoConnect = true,
    transports = ['websocket'],
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize socket
  const initializeSocket = useCallback(() => {
    if (socketRef.current?.connected) {
      return socketRef.current;
    }

    // Cleanup existing socket if any
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
    }

    const socket = io(CONFIG.serverUrl, {
      transports,
      autoConnect: false,
      reconnection,
      reconnectionAttempts,
      reconnectionDelay,
    });

    // Connection handlers
    socket.on('connect', () => {
      setIsConnected(true);
      setIsConnecting(false);
      setIsError(false);
      setError(null);
    });

    socket.on('connect_error', (err) => {
      setIsError(true);
      setError(err);
      setIsConnecting(false);
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect
        setIsError(true);
        setError(new Error('Server disconnected'));
      }
    });

    socket.on('reconnect', () => {
      setIsConnected(true);
      setIsError(false);
      setError(null);
    });

    socket.on('reconnect_error', (err) => {
      setIsError(true);
      setError(err);
    });

    socket.on('reconnect_failed', () => {
      setIsError(true);
      setError(new Error('Reconnection failed'));
    });

    socketRef.current = socket;
    return socket;
  }, [transports, reconnection, reconnectionAttempts, reconnectionDelay]);

  // Connect function
  const connect = useCallback(() => {
    if (!socketRef.current) {
      initializeSocket();
    }

    if (socketRef.current && !socketRef.current.connected) {
      setIsConnecting(true);
      socketRef.current.connect();
    }
  }, [initializeSocket]);

  // Disconnect function
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setIsConnected(false);
      setIsConnecting(false);
    }
  }, []);

  // Reconnect function
  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.connect();
      setIsConnecting(true);
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [autoConnect, connect]);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    isError,
    error,
    connect,
    disconnect,
    reconnect,
  };
}

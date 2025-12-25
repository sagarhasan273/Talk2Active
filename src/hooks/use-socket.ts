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
] as const;

// ----------------------------------------------------------------------

export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const {
    autoConnect = true,
    transports = ['websocket'],
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
    namespace = '/',
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create or get singleton socket
  const initializeSocket = useCallback(() => {
    if (globalSocket?.connected) {
      socketRef.current = globalSocket;
      setIsConnected(true);
      return globalSocket;
    }

    if (!globalSocket) {
      const socket = io(`${CONFIG.serverUrl}${namespace}`, {
        transports,
        autoConnect: false,
        reconnection,
        reconnectionAttempts,
        reconnectionDelay,
      });

      // Setup global event handlers
      const handleConnect = () => {
        GLOBAL_EVENTS.forEach((event) => {
          const listeners = globalListeners.get(event);
          if (listeners) {
            listeners.forEach((listener) => {
              listener();
            });
          }
        });
      };

      const handleConnectError = (err: Error) => {
        const listeners = globalListeners.get('connect_error');
        if (listeners) {
          listeners.forEach((listener) => {
            listener(err);
          });
        }
      };

      const handleDisconnect = (reason: string) => {
        const listeners = globalListeners.get('disconnect');
        if (listeners) {
          listeners.forEach((listener) => {
            listener(reason);
          });
        }
      };

      const handleReconnect = () => {
        const listeners = globalListeners.get('reconnect');
        if (listeners) {
          listeners.forEach((listener) => {
            listener();
          });
        }
      };

      const handleReconnectError = (err: Error) => {
        const listeners = globalListeners.get('reconnect_error');
        if (listeners) {
          listeners.forEach((listener) => {
            listener(err);
          });
        }
      };

      const handleReconnectFailed = () => {
        const listeners = globalListeners.get('reconnect_failed');
        if (listeners) {
          listeners.forEach((listener) => {
            listener();
          });
        }
      };

      socket.on('connect', handleConnect);
      socket.on('connect_error', handleConnectError);
      socket.on('disconnect', handleDisconnect);
      socket.on('reconnect', handleReconnect);
      socket.on('reconnect_error', handleReconnectError);
      socket.on('reconnect_failed', handleReconnectFailed);

      globalSocket = socket;
    }

    socketRef.current = globalSocket;
    connectionCount += 1;
    return globalSocket;
  }, [transports, reconnection, reconnectionAttempts, reconnectionDelay, namespace]);

  // Register global event listeners for this instance
  const registerGlobalListeners = useCallback(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setIsConnecting(false);
      setIsError(false);
      setError(null);
    };

    const handleConnectError = (err: Error) => {
      setIsError(true);
      setError(err);
      setIsConnecting(false);
    };

    const handleDisconnect = (reason: string) => {
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        setIsError(true);
        setError(new Error('Server disconnected'));
      }
    };

    const handleReconnect = () => {
      setIsConnected(true);
      setIsError(false);
      setError(null);
    };

    const handleReconnectError = (err: Error) => {
      setIsError(true);
      setError(err);
    };

    const handleReconnectFailed = () => {
      setIsError(true);
      setError(new Error('Reconnection failed'));
    };

    // Register each listener
    const listeners = {
      connect: handleConnect,
      connect_error: handleConnectError,
      disconnect: handleDisconnect,
      reconnect: handleReconnect,
      reconnect_error: handleReconnectError,
      reconnect_failed: handleReconnectFailed,
    };

    Object.entries(listeners).forEach(([event, handler]) => {
      if (!globalListeners.has(event)) {
        globalListeners.set(event, new Set());
      }
      globalListeners.get(event)!.add(handler);
    });

    // Return cleanup function
    return () => {
      Object.entries(listeners).forEach(([event, handler]) => {
        const eventListeners = globalListeners.get(event);
        if (eventListeners) {
          eventListeners.delete(handler);
          if (eventListeners.size === 0) {
            globalListeners.delete(event);
          }
        }
      });
    };
  }, []);

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

  // Disconnect function - only disconnects if no other instances are using it
  const disconnect = useCallback(() => {
    if (socketRef.current && connectionCount <= 1) {
      socketRef.current.disconnect();
    }
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  // Reconnect function
  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.connect();
      setIsConnecting(true);
    }
  }, []);

  // Set up listeners and auto-connect
  useEffect(() => {
    const cleanupListeners = registerGlobalListeners();

    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      cleanupListeners();

      if (socketRef.current) {
        connectionCount -= 1;

        // If this was the last instance, clean up the global socket
        if (connectionCount === 0 && globalSocket) {
          globalSocket.removeAllListeners();
          globalSocket.disconnect();
          globalSocket = null;
          socketRef.current = null;
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect, registerGlobalListeners]);

  // Update connection state from global socket
  useEffect(() => {
    if (socketRef.current?.connected) {
      setIsConnected(true);
      setIsConnecting(false);
      setIsError(false);
    }
  }, []);

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

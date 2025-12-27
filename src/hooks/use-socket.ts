// hooks/use-socket.ts
import type { Socket } from 'socket.io-client';

import { useRef, useState, useEffect, useCallback } from 'react';

import SocketManager, {
  type SocketEventHandlers,
  type SocketManagerOptions,
} from 'src/lib/socket-manager';

// ----------------------------------------------------------------------

export type UseSocketOptions = SocketManagerOptions & {
  autoConnect?: boolean;
  eventHandlers?: SocketEventHandlers;
  enableStateUpdates?: boolean;
};

export type UseSocketReturn = {
  socket: Socket | null;
  isSocketConnected: boolean;
  isSocketConnecting: boolean;
  isError: boolean;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  emit: (event: string, ...args: any[]) => void;
  on: (event: string, handler: Function) => () => void;
  off: (event: string, handler?: Function) => void;
  getId: () => string | undefined;
  authenticate: (token: string) => void;
  updateAuth: (token: string) => void;
};

export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const {
    autoConnect = true,
    eventHandlers,
    enableStateUpdates = true,
    ...socketOptions
  } = options;

  const socketManagerRef = useRef(SocketManager.getInstance(socketOptions));
  const [state, setState] = useState(() => socketManagerRef.current.getConnectionState());

  const cleanupRef = useRef<() => void>();

  // Update options if they change
  useEffect(() => {
    if (socketOptions) {
      socketManagerRef.current.updateOptions(socketOptions);
    }
  }, [socketOptions]);

  // Subscribe to connection state changes
  useEffect(() => {
    if (!enableStateUpdates) return undefined;

    const unsubscribe = socketManagerRef.current.subscribeToConnectionState(
      (newState: ReturnType<typeof socketManagerRef.current.getConnectionState>) => {
        setState(newState);
      }
    );

    return () => unsubscribe();
  }, [enableStateUpdates]);

  // Setup event handlers
  useEffect(() => {
    if (!eventHandlers) return undefined;

    const cleanupFns: (() => void)[] = [];

    if (eventHandlers.onConnect) {
      cleanupFns.push(socketManagerRef.current.on('connect', eventHandlers.onConnect));
    }

    if (eventHandlers.onDisconnect) {
      cleanupFns.push(socketManagerRef.current.on('disconnect', eventHandlers.onDisconnect));
    }

    if (eventHandlers.onConnectError) {
      cleanupFns.push(socketManagerRef.current.on('connect_error', eventHandlers.onConnectError));
    }

    cleanupRef.current = () => {
      cleanupFns.forEach((cleanup) => cleanup());
    };

    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [eventHandlers]);

  // Auto-connect
  useEffect(() => {
    if (autoConnect) {
      socketManagerRef.current.connect(eventHandlers);
    }

    // Cleanup on unmount (but don't disconnect the socket!)
    return () => {
      // Only cleanup event listeners, not the socket connection
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [autoConnect, eventHandlers]);

  // Connect function
  const connect = useCallback(() => {
    socketManagerRef.current.connect(eventHandlers);
  }, [eventHandlers]);

  // Disconnect function
  const disconnect = useCallback(() => {
    socketManagerRef.current.disconnect();
  }, []);

  // Reconnect function
  const reconnect = useCallback(() => {
    socketManagerRef.current.reconnect();
  }, []);

  // Emit function
  const emit = useCallback((event: string, ...args: any[]) => {
    socketManagerRef.current.emit(event, ...args);
  }, []);

  // On function
  const on = useCallback(
    (event: string, handler: Function) => socketManagerRef.current.on(event, handler),
    []
  );

  // Off function
  const off = useCallback((event: string, handler?: Function) => {
    socketManagerRef.current.off(event, handler);
  }, []);

  return {
    socket: socketManagerRef.current.getSocket(),
    isSocketConnected: state.isConnected,
    isSocketConnecting: state.isConnecting,
    isError: state.isError,
    error: state.error,
    connect,
    disconnect,
    reconnect,
    emit,
    on,
    off,
    getId: () => socketManagerRef.current.getId(),
    authenticate: (token: string) => socketManagerRef.current.authenticate(token),
    updateAuth: (token: string) => socketManagerRef.current.updateAuth(token),
  };
}

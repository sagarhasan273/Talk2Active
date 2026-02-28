// lib/socket/socket-manager.ts
import { io, type Socket } from 'socket.io-client';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

export type SocketManagerOptions = {
  transports?: ('websocket' | 'polling')[];
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  auth?: (cb: (data: object) => void) => void;
  query?: Record<string, string>;
  extraHeaders?: Record<string, string>;
};

export type SocketEventHandlers = {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onConnectError?: (error: Error) => void;
  onReconnect?: (attempt: number) => void;
  onReconnectError?: (error: Error) => void;
  onReconnectFailed?: () => void;
};

class SocketManager {
  private static instance: SocketManager;

  private socket: Socket | null = null;

  private options: SocketManagerOptions;

  private eventHandlers: Map<string, Set<Function>> = new Map();

  private connectionState: {
    isConnected: boolean;
    isConnecting: boolean;
    isError: boolean;
    error: Error | null;
  } = {
    isConnected: false,
    isConnecting: false,
    isError: false,
    error: null,
  };

  private connectionListeners: Set<(state: typeof this.connectionState) => void> = new Set();

  private constructor(options: SocketManagerOptions = {}) {
    this.options = {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      ...options,
    };
  }

  // Singleton getter
  static getInstance(options?: SocketManagerOptions): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager(options);
    }
    // Update options if provided
    if (options) {
      SocketManager.instance.updateOptions(options);
    }
    return SocketManager.instance;
  }

  // Get current connection state
  getConnectionState() {
    return { ...this.connectionState };
  }

  // Subscribe to connection state changes
  subscribeToConnectionState(listener: (state: typeof this.connectionState) => void): () => void {
    this.connectionListeners.add(listener);
    // Immediately call with current state
    listener(this.getConnectionState());

    // Return unsubscribe function
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  // Update connection state and notify listeners
  private updateConnectionState(updates: Partial<typeof this.connectionState>) {
    this.connectionState = { ...this.connectionState, ...updates };
    this.notifyConnectionStateListeners();
  }

  private notifyConnectionStateListeners() {
    const state = this.getConnectionState();
    this.connectionListeners.forEach((listener) => listener(state));
  }

  // Update options dynamically
  updateOptions(options: Partial<SocketManagerOptions>) {
    this.options = { ...this.options, ...options };

    // If socket exists and options changed, reconnect with new options
    if (this.socket) {
      const needsReconnection =
        options.transports &&
        JSON.stringify(options.transports) !== JSON.stringify(this.socket.io.opts.transports);

      if (needsReconnection) {
        this.reconnect();
      }
    }
  }

  // Initialize or get the socket
  connect(customHandlers?: SocketEventHandlers): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    // Cleanup existing socket
    if (this.socket) {
      this.cleanupSocket();
    }

    this.updateConnectionState({
      isConnecting: true,
      isError: false,
      error: null,
    });

    this.socket = io(CONFIG.serverUrl, {
      transports: this.options.transports,
      autoConnect: true,
      reconnection: this.options.reconnection,
      reconnectionAttempts: this.options.reconnectionAttempts,
      reconnectionDelay: this.options.reconnectionDelay,
      auth: this.options.auth,
      query: this.options.query,
      extraHeaders: this.options.extraHeaders,
    });

    this.setupEventHandlers(customHandlers);

    (window as any).socket = this.socket;
    return this.socket;
  }

  // Setup event handlers
  private setupEventHandlers(customHandlers?: SocketEventHandlers) {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.updateConnectionState({
        isConnected: true,
        isConnecting: false,
        isError: false,
        error: null,
      });
      customHandlers?.onConnect?.();
      this.emitToListeners('connect');
    });

    this.socket.on('connect_error', (error: Error) => {
      this.updateConnectionState({
        isConnecting: false,
        isError: true,
        error,
      });
      customHandlers?.onConnectError?.(error);
      this.emitToListeners('connect_error', error);
    });

    this.socket.on('disconnect', (reason: string) => {
      this.updateConnectionState({
        isConnected: false,
        isConnecting: false,
      });

      if (reason === 'io server disconnect') {
        this.updateConnectionState({
          isError: true,
          error: new Error('Server disconnected'),
        });
      }

      customHandlers?.onDisconnect?.(reason);
      this.emitToListeners('disconnect', reason);
    });

    this.socket.on('reconnect', (attempt: number) => {
      this.updateConnectionState({
        isConnected: true,
        isError: false,
        error: null,
      });
      customHandlers?.onReconnect?.(attempt);
      this.emitToListeners('reconnect', attempt);
    });

    this.socket.on('reconnect_error', (error: Error) => {
      this.updateConnectionState({
        isError: true,
        error,
      });
      customHandlers?.onReconnectError?.(error);
      this.emitToListeners('reconnect_error', error);
    });

    this.socket.on('reconnect_failed', () => {
      this.updateConnectionState({
        isError: true,
        error: new Error('Reconnection failed'),
      });
      customHandlers?.onReconnectFailed?.();
      this.emitToListeners('reconnect_failed');
    });
  }

  // Cleanup socket
  private cleanupSocket() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.updateConnectionState({
        isConnected: false,
        isConnecting: false,
      });
    }
  }

  // Manual reconnect
  reconnect() {
    if (this.socket) {
      this.updateConnectionState({
        isConnecting: true,
      });
      this.socket.connect();
    }
  }

  // Event subscription management
  on(event: string, handler: Function): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // Also subscribe to socket if connected
    if (this.socket) {
      const socketHandler = (...args: any[]) => handler(...args);
      this.socket.on(event, socketHandler);
    }

    // Return cleanup function
    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.eventHandlers.delete(event);
        }
      }
    };
  }

  // Remove event listener

  off(event: string, handler?: Function) {
    // Remove from local handlers
    if (handler) {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.eventHandlers.delete(event);
        }
      }

      // Remove from socket if connected
      if (this.socket) {
        this.socket.off(event, handler as (...args: any[]) => void);
      }
    } else {
      // Remove all handlers for this event
      this.eventHandlers.delete(event);

      // Remove from socket if connected
      if (this.socket) {
        this.socket.off(event);
      }
    }
  }

  // Emit event
  emit(event: string, ...args: any[]) {
    if (this.socket?.connected) {
      this.socket.emit(event, ...args);
    } else {
      console.warn(`Socket not connected. Event "${event}" not sent.`);
    }
  }

  // Private method to emit to registered listeners
  private emitToListeners(event: string, ...args: any[]) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(...args));
    }
  }

  // Get raw socket instance
  getSocket(): Socket | null {
    return this.socket;
  }

  // Check if connected
  isConnected(): boolean {
    return this.connectionState.isConnected;
  }

  // Get socket ID
  getId(): string | undefined {
    return this.socket?.id;
  }

  // Authentication
  authenticate(token: string) {
    if (this.socket) {
      this.socket.auth = { token };
      if (!this.socket.connected) {
        this.socket.connect();
      } else {
        // If already connected, emit authentication event
        this.socket.emit('authenticate', { token });
      }
    }
  }

  // Update auth token
  updateAuth(token: string) {
    if (this.socket) {
      this.socket.auth = { token };
    }
  }

  // Destroy instance (for testing or complete cleanup)
  static destroy() {
    if (SocketManager.instance) {
      SocketManager.instance.disconnect();
      SocketManager.instance.cleanupSocket();
      SocketManager.instance.eventHandlers.clear();
      SocketManager.instance.connectionListeners.clear();
      SocketManager.instance = null as any;
    }
  }
}

export default SocketManager;

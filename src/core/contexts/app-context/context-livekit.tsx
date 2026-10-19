// src/providers/livekit-provider.tsx

import { RoomContext } from '@livekit/components-react';
import { ConnectionState, Room, RoomEvent, RoomOptions } from 'livekit-client';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface LiveKitSessionContextType {
  room: Room;
  token: string | null;
  serverUrl: string | null;
  isInRoom: boolean;
  connectionState: ConnectionState;
  connectToRoom: (token: string, serverUrl?: string) => Promise<void>;
  disconnectRoom: () => Promise<void>;
}

const LiveKitSessionContext = createContext<LiveKitSessionContextType | null>(null);

export function LiveKitProvider({
  children,
  defaultServerUrl = import.meta.env.VITE_LIVEKIT_URL,
  roomOptions,
}: {
  children: React.ReactNode;
  defaultServerUrl?: string;
  roomOptions?: RoomOptions;
}) {
  const room = useMemo(() => new Room(roomOptions), [roomOptions]);

  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(defaultServerUrl || null);
  const [connectionState, setConnectionState] = useState<ConnectionState>(room.state);

  useEffect(() => {
    const handleStateChange = (state: ConnectionState) => {
      setConnectionState(state);
    };

    room.on(RoomEvent.ConnectionStateChanged, handleStateChange);

    return () => {
      room.off(RoomEvent.ConnectionStateChanged, handleStateChange);
      room.disconnect();
    };
  }, [room]);

  const connectToRoom = useCallback(async (newToken: string, customServerUrl?: string) => {
    const targetUrl = customServerUrl || serverUrl;
    if (!targetUrl) throw new Error('LiveKit Server URL is required');

    if (room.state !== ConnectionState.Disconnected) {
      await room.disconnect();
    }

    setToken(newToken);
    if (customServerUrl) setServerUrl(customServerUrl);

    try {
      await room.connect(targetUrl, newToken);
    } catch (error) {
      console.error('LiveKit connection failed:', error);
      setToken(null);
      setConnectionState(ConnectionState.Disconnected);
      await room.disconnect().catch(() => { });
      throw error;
    }
  }, [room, serverUrl]);

  // ARCHITECTURE FIX: Wrap in useCallback
  const disconnectRoom = useCallback(async () => {
    try {
      if (room.localParticipant) {
        await room.localParticipant.setMicrophoneEnabled(false).catch(() => { });
      }
      await room.disconnect();
    } finally {
      setToken(null);
      setConnectionState(ConnectionState.Disconnected);
    }
  }, [room]);

  const isInRoom = connectionState === ConnectionState.Connected;

  const sessionValue = useMemo(
    () => ({
      room,
      token,
      serverUrl,
      isInRoom,
      connectionState,
      connectToRoom,
      disconnectRoom,
    }),
    [room, token, serverUrl, isInRoom, connectionState, connectToRoom, disconnectRoom]
  );

  return (
    <RoomContext.Provider value={room}>
      <LiveKitSessionContext.Provider value={sessionValue}>
        {children}
      </LiveKitSessionContext.Provider>
    </RoomContext.Provider>
  );
}

export const useLiveKitSession = () => {
  const context = useContext(LiveKitSessionContext);
  if (!context) {
    throw new Error('useLiveKitSession must be used within a LiveKitProvider');
  }
  return context;
};
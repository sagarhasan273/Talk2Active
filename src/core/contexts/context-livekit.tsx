// src/providers/livekit-provider.tsx

import { RoomContext } from '@livekit/components-react';
import { ConnectionState, Room, RoomEvent, RoomOptions } from 'livekit-client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface LiveKitSessionContextType {
  room: Room;
  token: string | null;
  serverUrl: string | null;
  isInRoom: boolean; // <-- Add this
  connectionState: ConnectionState; // <-- Add this
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

  const connectToRoom = async (newToken: string, customServerUrl?: string) => {
    const targetUrl = customServerUrl || serverUrl;
    if (!targetUrl) throw new Error('LiveKit Server URL is required');

    setToken(newToken);
    if (customServerUrl) setServerUrl(customServerUrl);
    await room.connect(targetUrl, newToken);
  };

  const disconnectRoom = async () => {
    await room.disconnect();
    setToken(null);
  };

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
    [room, token, serverUrl, isInRoom, connectionState]
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

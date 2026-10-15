// src/core/contexts/context-voice-room-action.tsx

import { useJoinRoomMutation, useLeaveRoomMutation } from '@/core/apis';
import { useLiveKitSession } from '@/core/contexts/context-livekit';
import { useSocket } from '@/core/contexts/context-socket';
import { useCredentials, useRoomTools } from '@/core/slices';
import useRoomSounds from '@/hooks/use-room-sounds';
import type { RoomType } from '@/types/type-room';
import { toastErrorResponse } from '@/utils/response';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface VoiceRoomActionContextType {
  selectedRoom: RoomType | null;
  livekitToken: string | null;
  isJoinGateOpen: boolean;
  selectedTab: 'room-list' | 'room-space';
  setSelectedTab: React.Dispatch<React.SetStateAction<'room-list' | 'room-space'>>;
  handleSelectRoom: (roomSelected: RoomType) => void;
  handleCancelJoin: () => void;
  handleJoinRoom: () => Promise<void>;
  handleLeaveRoom: () => Promise<void>;
  handleBackToRooms: () => void;
}

const VoiceRoomActionContext = createContext<VoiceRoomActionContextType | undefined>(undefined);

export const VoiceRoomActionProvider: React.FC<{
  children: React.ReactNode;
  onOpenAuth: () => void;
}> = ({ children, onOpenAuth }) => {
  const { user, isAuthenticated } = useCredentials();
  const { socket } = useSocket();
  const { connectToRoom, disconnectRoom, isInRoom } = useLiveKitSession();
  const { room, setRoom, resetRoom } = useRoomTools();
  const { playUserJoin, playUserLeave } = useRoomSounds({ volume: 1 });

  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [isJoinGateOpen, setIsJoinGateOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'room-list' | 'room-space'>('room-list');

  const [joinRoomMutation] = useJoinRoomMutation();
  const [leaveRoomMutation] = useLeaveRoomMutation();

  const handleSelectRoom = useCallback(
    (roomSelected: RoomType) => {
      if (!isAuthenticated) {
        onOpenAuth();
        return;
      }
      setSelectedRoom(roomSelected);
      setIsJoinGateOpen(true);
    },
    [isAuthenticated, onOpenAuth]
  );

  const handleCancelJoin = useCallback(() => {
    setIsJoinGateOpen(false);
    setSelectedRoom(null);
  }, []);

  const handleLeaveRoom = useCallback(async () => {
    try {
      // Emit socket room leave event if in a room
      if (room?.roomId && user?.userId && socket) {
        socket.emit('room_left', { roomId: room.roomId, userId: user.userId });
      }

      await disconnectRoom();
      if (room?.roomId && user?.userId) {
        await leaveRoomMutation({ roomId: room.roomId, userId: user.userId });
      }
    } catch (err) {
      console.warn('LiveKit disconnect warning:', err);
    }

    setSelectedTab('room-list');
    setSelectedRoom(null);
    setLivekitToken(null);
    setIsJoinGateOpen(false);
    resetRoom();
    playUserLeave();
  }, [room?.roomId, user?.userId, socket, disconnectRoom, leaveRoomMutation, resetRoom, playUserLeave]);

  const handleJoinRoom = useCallback(async () => {
    if (!selectedRoom || !user) return;

    if (isInRoom) {
      await handleLeaveRoom();
    }

    try {
      const response = await joinRoomMutation({
        roomId: selectedRoom.roomId,
        userId: user.userId,
      }).unwrap();

      if (response.status && response.data.token) {
        setRoom(response.data.room);
        setLivekitToken(response.data.token);
        setIsJoinGateOpen(false);
        setSelectedTab('room-space');
        await connectToRoom(response.data.token);
        playUserJoin();

        // Emit room join event through socket
        if (socket) {
          socket.emit('room_joined', {
            roomId: selectedRoom.roomId,
            user: {
              userId: user.userId,
              name: user.name,
              profilePhoto: user.profilePhoto,
              accountType: user.accountType,
            },
          });
        }
      }
    } catch (error) {
      toastErrorResponse(error);
    }
  }, [selectedRoom, user, isInRoom, joinRoomMutation, setRoom, connectToRoom, playUserJoin, socket, handleLeaveRoom]);

  const handleBackToRooms = useCallback(() => {
    setSelectedTab('room-list');
  }, []);

  const value = useMemo(
    () => ({
      selectedRoom,
      livekitToken,
      isJoinGateOpen,
      selectedTab,
      setSelectedTab,
      handleSelectRoom,
      handleCancelJoin,
      handleJoinRoom,
      handleLeaveRoom,
      handleBackToRooms,
    }),
    [
      selectedRoom,
      livekitToken,
      isJoinGateOpen,
      selectedTab,
      handleSelectRoom,
      handleCancelJoin,
      handleJoinRoom,
      handleLeaveRoom,
      handleBackToRooms,
    ]
  );

  return (
    <VoiceRoomActionContext.Provider value={value}>
      {children}
    </VoiceRoomActionContext.Provider>
  );
};

export const useVoiceRoomAction = () => {
  const context = useContext(VoiceRoomActionContext);
  if (!context) {
    throw new Error('useVoiceRoomAction must be used within a VoiceRoomActionProvider');
  }
  return context;
};

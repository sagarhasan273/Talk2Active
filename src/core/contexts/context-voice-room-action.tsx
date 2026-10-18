// src/core/contexts/context-voice-room-action.tsx

import { useJoinRoomMutation, useLeaveRoomMutation } from '@/core/apis';
import { useLiveKitSession } from '@/core/contexts/context-livekit';
import { useCredentials, useRoomTools } from '@/core/slices';
import useRoomSounds from '@/hooks/use-room-sounds';
import type { RoomType } from '@/types/type-room';
import { toastErrorResponse } from '@/utils/response';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface VoiceRoomActionContextType {
  selectedRoom: RoomType | null;
  livekitToken: string | null;
  isJoinGateOpen: boolean;
  isJoining: boolean;
  isLeaving: boolean;
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
  const { connectToRoom, disconnectRoom, isInRoom } = useLiveKitSession();
  const { room, setRoom, setRoomLoading, resetRoom } = useRoomTools();
  const { playUserJoin, playUserLeave } = useRoomSounds({ volume: 1 });

  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [isJoinGateOpen, setIsJoinGateOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'room-list' | 'room-space'>('room-list');

  // Track the full async lifecycle (API + LiveKit WebRTC)
  const [isJoiningState, setIsJoiningState] = useState(false);
  const [isLeavingState, setIsLeavingState] = useState(false);

  const [joinRoomMutation, { isLoading: isJoinMutationLoading }] = useJoinRoomMutation();
  const [leaveRoomMutation, { isLoading: isLeaveMutationLoading }] = useLeaveRoomMutation();

  const isJoining = isJoiningState || isJoinMutationLoading;
  const isLeaving = isLeavingState || isLeaveMutationLoading;

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
    setIsLeavingState(true);
    try {
      await disconnectRoom();
      setSelectedTab('room-list');
      setSelectedRoom(null);
      setLivekitToken(null);
      setIsJoinGateOpen(false);

      if (room?.roomId && user?.userId) {
        await leaveRoomMutation({ roomId: room.roomId, userId: user.userId });
      }
    } catch (err) {
      console.warn('LiveKit disconnect warning:', err);
      window.location.reload();
    } finally {
      resetRoom();
      playUserLeave();
      setIsLeavingState(false);
    }
  }, [room?.roomId, user?.userId, disconnectRoom, leaveRoomMutation, resetRoom, playUserLeave]);

  const handleJoinRoom = useCallback(async () => {
    if (!selectedRoom || !user) return;

    setIsJoiningState(true);
    setRoomLoading(true);
    setIsJoinGateOpen(false);

    if (isInRoom) {
      await handleLeaveRoom();
    }

    try {
      setSelectedTab('room-space');
      const response = await joinRoomMutation({
        roomId: selectedRoom.roomId,
        userId: user.userId,
      }).unwrap();

      if (response.status && response.data.token) {
        setRoom(response.data.room);
        setLivekitToken(response.data.token);

        await connectToRoom(response.data.token);
        playUserJoin();
      }
    } catch (error) {
      toastErrorResponse(error);

      try {
        await leaveRoomMutation({
          roomId: selectedRoom.roomId,
          userId: user.userId,
        });
      } catch (cleanupError) {
        console.error('Failed to cleanup DB after WebRTC failure:', cleanupError);
      }

      // 4. Reload page to wipe broken state
      setTimeout(() => {
        window.location.reload();
      }, 3500);
    } finally {
      setIsJoiningState(false);
      setRoomLoading(false);
    }
  }, [
    selectedRoom,
    user,
    isInRoom,
    joinRoomMutation,
    leaveRoomMutation,
    setRoom,
    setRoomLoading,
    connectToRoom,
    playUserJoin,
    handleLeaveRoom,
  ]);

  const handleBackToRooms = useCallback(() => {
    setSelectedTab((prev) => (prev === 'room-list' ? 'room-space' : 'room-list'));
  }, []);

  const value = useMemo(
    () => ({
      selectedRoom,
      livekitToken,
      isJoinGateOpen,
      isJoining,
      isLeaving,
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
      isJoining,
      isLeaving,
      selectedTab,
      handleSelectRoom,
      handleCancelJoin,
      handleJoinRoom,
      handleLeaveRoom,
      handleBackToRooms,
    ]
  );

  return (
    <VoiceRoomActionContext.Provider value={value}>{children}</VoiceRoomActionContext.Provider>
  );
};

export const useVoiceRoomAction = () => {
  const context = useContext(VoiceRoomActionContext);
  if (!context) {
    throw new Error('useVoiceRoomAction must be used within a VoiceRoomActionProvider');
  }
  return context;
};

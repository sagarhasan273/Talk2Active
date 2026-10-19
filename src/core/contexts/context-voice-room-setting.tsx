// src/core/contexts/context-room-setting.tsx

import { useJoinRoomMutation, useLeaveRoomMutation } from '@/core/apis';
import { useVoiceRoomStorage } from '@/core/contexts';
import { useLiveKitSession } from '@/core/contexts/context-livekit';
import { useCredentials, useRoomTools } from '@/core/slices';
import { useBoolean, UseBooleanReturn } from '@/hooks/use-boolean';
import useRoomSounds from '@/hooks/use-room-sounds';
import type { RoomType } from '@/types/type-room';
import { toastErrorResponse } from '@/utils/response';
import { useMediaQuery, useTheme } from '@mui/material';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface RoomSettingContextType {
  isInRoom: boolean;
  selectedTab: 'room-list' | 'room-space';
  setSelectedTab: React.Dispatch<React.SetStateAction<'room-list' | 'room-space'>>;

  isJoinGateOpen: boolean;
  isJoining: boolean;
  isLeaving: boolean;

  chatOpen: boolean;
  setChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chatCollapsedBoolean: UseBooleanReturn;
  isChatVisible: boolean;

  onToggleChat: () => void;
  setIsAtBottom: (atBottom: boolean) => void;

  handleSelectRoom: (roomSelected: RoomType) => void;
  handleCancelJoin: () => void;
  handleJoinRoom: () => Promise<void>;
  handleLeaveRoom: () => Promise<void>;
  handleBackToRooms: () => void;
}

const RoomSettingContext = createContext<RoomSettingContextType | undefined>(undefined);

export const VoiceRoomSettingProvider: React.FC<{
  children: React.ReactNode;
  onOpenAuth: () => void;
}> = ({ children, onOpenAuth }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { user, isAuthenticated } = useCredentials();
  const { connectToRoom, disconnectRoom, isInRoom } = useLiveKitSession();
  const { setRoom, setRoomLoading, resetRoom } = useRoomTools();
  const { playUserJoin, playUserLeave } = useRoomSounds({ volume: 1 });

  // Connect to the isolated Data layer
  const { selectedRoom, setSelectedRoom, setLivekitToken, updateChatViewport, handleCleanup } =
    useVoiceRoomStorage();

  const [isJoinGateOpen, setIsJoinGateOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'room-list' | 'room-space'>('room-list');

  // UI State for Chat Drawers
  const [chatOpen, setChatOpen] = useState(false);
  const chatCollapsedBoolean = useBoolean(false);

  const isChatVisible = isMobile ? chatOpen : !chatCollapsedBoolean.value;
  const isAtBottomRef = useRef<boolean>(true);

  const [isJoiningState, setIsJoiningState] = useState(false);
  const [isLeavingState, setIsLeavingState] = useState(false);

  const [joinRoomMutation, { isLoading: isJoinMutationLoading }] = useJoinRoomMutation();
  const [leaveRoomMutation, { isLoading: isLeaveMutationLoading }] = useLeaveRoomMutation();

  const isJoining = isJoiningState || isJoinMutationLoading;
  const isLeaving = isLeavingState || isLeaveMutationLoading;

  // Sync Chat Visibility to Storage Context so Unread Badges update
  useEffect(() => {
    updateChatViewport(isChatVisible, isAtBottomRef.current);
  }, [isChatVisible, updateChatViewport]);

  const setIsAtBottom = useCallback(
    (atBottom: boolean) => {
      isAtBottomRef.current = atBottom;
      updateChatViewport(isChatVisible, atBottom);
    },
    [isChatVisible, updateChatViewport]
  );

  const onToggleChat = useCallback(() => {
    if (isMobile) {
      setChatOpen((prev) => !prev);
    } else {
      chatCollapsedBoolean.onToggle();
    }
  }, [isMobile, chatCollapsedBoolean]);

  const handleSelectRoom = useCallback(
    (roomSelected: RoomType) => {
      if (!isAuthenticated) return onOpenAuth();
      setSelectedRoom(roomSelected);
      setIsJoinGateOpen(true);
    },
    [isAuthenticated, onOpenAuth, setSelectedRoom]
  );

  const handleCancelJoin = useCallback(() => {
    setIsJoinGateOpen(false);
    setSelectedRoom(null);
  }, [setSelectedRoom]);

  const handleLeaveRoom = useCallback(async () => {
    setIsLeavingState(true);
    try {
      await disconnectRoom();
      setSelectedTab('room-list');
      setIsJoinGateOpen(false);
      handleCleanup();
    } catch (err) {
      window.location.reload();
    } finally {
      resetRoom();
      playUserLeave();
      setIsLeavingState(false);
    }
  }, [disconnectRoom, handleCleanup, resetRoom, playUserLeave]);

  const handleJoinRoom = useCallback(async () => {
    if (!selectedRoom || !user) return;
    setIsJoiningState(true);
    setRoomLoading(true);
    setIsJoinGateOpen(false);

    try {
      if (isInRoom) await disconnectRoom();

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
        await leaveRoomMutation({ roomId: selectedRoom.roomId, userId: user.userId });
      } catch (cleanupError) {
        window.location.reload();
      } finally {
        setTimeout(() => window.location.reload(), 3500);
      }
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
    setLivekitToken,
    connectToRoom,
    playUserJoin,
    disconnectRoom,
  ]);

  const handleBackToRooms = useCallback(() => {
    setSelectedTab((prev) => (prev === 'room-list' ? 'room-space' : 'room-list'));
  }, []);

  const value = useMemo(
    () => ({
      isInRoom,
      selectedTab,
      setSelectedTab,
      isJoinGateOpen,
      isJoining,
      isLeaving,
      chatOpen,
      setChatOpen,
      chatCollapsedBoolean,
      isChatVisible,
      onToggleChat,
      setIsAtBottom,
      handleSelectRoom,
      handleCancelJoin,
      handleJoinRoom,
      handleLeaveRoom,
      handleBackToRooms,
    }),
    [
      isInRoom,
      selectedTab,
      isJoinGateOpen,
      isJoining,
      isLeaving,
      chatOpen,
      chatCollapsedBoolean,
      isChatVisible,
      onToggleChat,
      setIsAtBottom,
      handleSelectRoom,
      handleCancelJoin,
      handleJoinRoom,
      handleLeaveRoom,
      handleBackToRooms,
    ]
  );

  return <RoomSettingContext.Provider value={value}>{children}</RoomSettingContext.Provider>;
};

export const useVoiceRoomSetting = () => {
  const context = useContext(RoomSettingContext);
  if (!context) throw new Error('useVoiceRoomSetting must be used within a VoiceRoomSettingProvider');
  return context;
};

// src/core/contexts/context-room-setting.tsx

import { useJoinRoomRequestMutation } from '@/core/apis';
import { useVoiceRoomStorage } from '@/core/contexts';
import { useLiveKitSession } from '@/core/contexts/app-context/context-livekit';
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

  const { setRoom, setRoomLoading, resetRoom, markRoomAsVisited } = useRoomTools();
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

  const [joinRoomRequestMutation, { isLoading: isJoinMutationLoading }] = useJoinRoomRequestMutation();


  const isJoining = isJoiningState || isJoinMutationLoading;

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
    }
  }, [disconnectRoom, handleCleanup, resetRoom, playUserLeave]);

  const handleJoinRoom = useCallback(async () => {
    if (!selectedRoom || !user) return;

    try {
      if (isInRoom) await disconnectRoom();

      setIsJoiningState(true);
      setRoomLoading(true);
      setIsJoinGateOpen(false);
      setSelectedTab('room-space');

      const response = await joinRoomRequestMutation({
        roomId: selectedRoom.roomId,
        userId: user.userId,
      }).unwrap();

      if (response.status && response.data.token) {
        setRoom(response.data.room);
        setLivekitToken(response.data.token);
        markRoomAsVisited(selectedRoom.roomId)
        try {
          await connectToRoom(response.data.token);
          playUserJoin();
        } catch (connectionError) {
          console.error('[RoomContainer] LiveKit connection failed. Cleaning up backend state...', connectionError);
          throw connectionError;
        }
      }
    } catch (error) {
      setSelectedTab('room-list');
      toastErrorResponse("Unable to join room.");
      console.error(error);
    } finally {
      setIsJoiningState(false);
      setRoomLoading(false);
    }
  }, [
    selectedRoom,
    user,
    isInRoom,
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

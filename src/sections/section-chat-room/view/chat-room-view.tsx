import type { UserType } from 'src/types/type-user';

import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { styled } from '@mui/material/styles';
import { Box, Container, Typography } from '@mui/material';

import { useParams } from 'src/routes/route-hooks';

import useWebRTC from 'src/hooks/use-web-rtc';
import { useBoolean } from 'src/hooks/use-boolean';

import { useRoomTools } from 'src/core/slices/slice-room';
import { setAccount, selectAccount } from 'src/core/slices';
import { useSocketContext } from 'src/core/contexts/socket-context';
import { useJoinRoomMutation, useLeaveRoomMutation } from 'src/core/apis';

import { ChatRoomFooter } from './chat-room-footer';
import { ChatRoomChatBody } from './chat-room-body';
import { ChatRoomHeader } from './chat-room-header';
import { ChatRoomChatJoinNow } from './chat-room-join-now';
import { useChatSocketListeners } from '../chat-hooks/chat-socket-listeners';
import { CreateRoomModal } from '../../section-voice-room/voice-room-create-modal';

// Types
interface VoiceRoomState {
  isConnected: boolean;
  isInitializing: boolean;
  hasLeft: boolean;
}

const RoomContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(1),
  paddingBottom: theme.spacing(2),
  height: '95vh',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
}));

// Constants
const ERROR_MESSAGES = {
  JOIN_ROOM: 'Failed to join the room. Please try again.',
  INITIALIZATION: 'Failed to initialize voice chat:',
  LEAVE_ROOM: 'Failed to leave room properly',
  NO_ROOM_ID: 'Room ID is missing',
  NO_AUTH: 'User not authenticated',
  MISSING_DATA: 'Missing required data for initialization',
  MIC_ACCESS: 'Unable to access microphone. Please check permissions.',
} as const;

export function VoiceRoomChat() {
  const dispatch = useDispatch();
  const roomId = useParams().roomId as string;
  const user = useSelector(selectAccount);

  // Room management
  const { room, remoteParticipants, resetRemoteParticipants } = useRoomTools();

  // WebRTC
  const webRTC = useWebRTC();
  const {
    remoteStreams,
    localStream,
    isMicMuted,
    initializeMicrophone,
    toggleMicrophone,
    cleanup: cleanupWebRTC,
  } = webRTC;

  // Socket listeners
  const { setupChatSocketListeners } = useChatSocketListeners(webRTC);

  // Socket
  const { socket, isSocketConnected } = useSocketContext();

  // State
  const editRoomBoolean = useBoolean(false);

  const [state, setState] = useState<VoiceRoomState>({
    isConnected: false,
    isInitializing: false,
    hasLeft: false,
  });
  const [status, setStatus] = useState<UserType['status']>('online');
  const [micError, setMicError] = useState<string | null>(null);

  // Refs
  const cleanupPerformed = useRef(false);
  const initializationAttempted = useRef(false);
  const setupChatSocketListenersRef = useRef<(() => void) | undefined>();

  // API mutations
  const [joinRoomMutation, { isLoading: isJoining }] = useJoinRoomMutation();
  const [leaveRoomMutation, { isLoading: isLeaving }] = useLeaveRoomMutation();

  // Memoized values
  const participantsArray = useMemo(() => Object.values(remoteParticipants), [remoteParticipants]);

  const isRoomReady = Boolean(roomId && user?.id && isSocketConnected);
  const isLoading = state.isInitializing || isJoining;
  const canJoin = isRoomReady && !state.isConnected && !isLoading;

  // Initialize voice room
  const initializeVoiceRoom = useCallback(async (): Promise<boolean> => {
    if (!socket || !roomId || !user?.id) {
      console.error(ERROR_MESSAGES.MISSING_DATA);
      return false;
    }

    try {
      setState((prev) => ({ ...prev, isInitializing: true }));
      setMicError(null);

      // Initialize microphone
      await initializeMicrophone();

      // Join voice room
      socket.emit('join-voice-room', {
        roomId,
        userId: user.id,
        name: user.name,
        profilePhoto: user.profilePhoto,
        isMuted: isMicMuted,
        status: 'online',
        userType: room.host?.id === user.id ? 'Host' : 'Guest',
        verified: user.verified,
      });

      setState((prev) => ({ ...prev, isConnected: true, isInitializing: false }));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('permission') || errorMessage.includes('microphone')) {
        setMicError(ERROR_MESSAGES.MIC_ACCESS);
      }

      console.error('Error initializing voice room:', error);
      toast.error(`${ERROR_MESSAGES.INITIALIZATION} ${errorMessage}`);

      setState((prev) => ({ ...prev, isInitializing: false }));
      return false;
    }
  }, [socket, roomId, user, isMicMuted, room.host?.id, initializeMicrophone]);

  // Join room
  const joinRoom = useCallback(async () => {
    if (!canJoin || initializationAttempted.current) return;

    try {
      initializationAttempted.current = true;

      const response = await joinRoomMutation({ roomId, userId: user.id }).unwrap();

      if (response.status) {
        const initialized = await initializeVoiceRoom();
        setupChatSocketListenersRef.current = setupChatSocketListeners?.();
        if (initialized) {
          toast.success('Joined the room successfully');
        }
      }
    } catch (error) {
      console.error('Join room failed:', error);
      toast.error(ERROR_MESSAGES.JOIN_ROOM);
      setState((prev) => ({ ...prev, isConnected: false }));
    } finally {
      initializationAttempted.current = false;
    }
  }, [canJoin, roomId, user?.id, setupChatSocketListeners, joinRoomMutation, initializeVoiceRoom]);

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (!socket || !roomId || !user?.id || cleanupPerformed.current) return;

    try {
      setState((prev) => ({ ...prev, hasLeft: true }));

      // Notify server
      socket.emit('leave-voice-room', {
        roomId,
        userId: user.id,
        name: user.name,
      });

      // Update API
      await leaveRoomMutation({ roomId, userId: user.id }).unwrap();

      // Cleanup WebRTC
      cleanupWebRTC();

      // chat listeners close
      setupChatSocketListenersRef.current?.();

      // Reset local state
      resetRemoteParticipants();

      setState({
        isConnected: false,
        isInitializing: false,
        hasLeft: true,
      });

      // Update user status
      dispatch(setAccount({ ...user, status: 'online' }));

      initializationAttempted.current = false;

      toast.success('Left the room successfully');
    } catch (error) {
      console.error('Error leaving room:', error);
      toast.error(ERROR_MESSAGES.LEAVE_ROOM);
    }
  }, [socket, roomId, user, leaveRoomMutation, cleanupWebRTC, resetRemoteParticipants, dispatch]);

  // Microphone toggle handler
  const handleToggleMicrophone = useCallback(() => {
    if (!socket) return;

    try {
      const isNowMuted = toggleMicrophone();

      socket.emit('user-audio-toggle', {
        socketId: socket.id,
        roomId,
        isMuted: isNowMuted,
        name: user.name,
      });
    } catch (error) {
      toast.error('Failed to toggle microphone');
    }
  }, [socket, roomId, user?.name, toggleMicrophone]);

  // Status toggle handler
  const handleToggleUserStatus = useCallback(
    (selectedStatus: UserType['status']) => {
      if (!socket) return;

      socket.emit('user-status-select', {
        roomId,
        socketId: socket.id,
        status: selectedStatus,
        name: user.name,
      });
      setStatus(selectedStatus);
    },
    [socket, roomId, user?.name]
  );

  // Auto-leave on socket disconnect
  useEffect(() => {
    if (!socket) return undefined;

    const handleSocketDisconnect = () => {
      if (state.isConnected) {
        leaveRoom();
      }
    };

    socket.on('disconnect', handleSocketDisconnect);

    return () => {
      socket.off('disconnect', handleSocketDisconnect);
    };
  }, [socket, state.isConnected, leaveRoom]);

  // Cleanup on unmount
  useEffect(() => {
    cleanupPerformed.current = false;
    return () => {
      if (!cleanupPerformed.current) {
        cleanupPerformed.current = true;
        leaveRoom();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validation
  if (!roomId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h5" color="error">
          {ERROR_MESSAGES.NO_ROOM_ID}
        </Typography>
      </Box>
    );
  }

  if (!user?.id) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h5" color="error">
          {ERROR_MESSAGES.NO_AUTH}
        </Typography>
      </Box>
    );
  }

  // Socket connection warning
  const showSocketWarning = !isSocketConnected && !state.hasLeft;

  return (
    <RoomContainer maxWidth="xl">
      <ChatRoomHeader
        isConnected={state.isConnected}
        editRoomBoolean={editRoomBoolean}
        // roomName={room?.name}
      />

      {showSocketWarning && (
        <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1, mb: 2 }}>
          <Typography variant="body2" color="warning.contrastText">
            Connecting to server...
          </Typography>
        </Box>
      )}

      {micError && (
        <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1, mb: 2 }}>
          <Typography variant="body2" color="error.contrastText">
            {micError}
          </Typography>
        </Box>
      )}

      {!state.isConnected ? (
        <ChatRoomChatJoinNow
          onJoinRoom={joinRoom}
          isLoading={isLoading}
          isDisabled={!canJoin}
          micError={micError}
        />
      ) : (
        <>
          <ChatRoomChatBody
            isConnected={state.isConnected}
            isInitializing={state.isInitializing}
            isMicMuted={isMicMuted}
            status={status}
            participants={participantsArray}
            remoteStreams={remoteStreams}
            localStream={localStream}
          />

          {state.isConnected && localStream && (
            <ChatRoomFooter
              isMicMuted={isMicMuted}
              onClickMic={handleToggleMicrophone}
              onStatusChange={handleToggleUserStatus}
              onClickLeaveRoom={leaveRoom}
              isLeaving={isLeaving}
            />
          )}
        </>
      )}

      <CreateRoomModal
        open={editRoomBoolean.value}
        onClose={editRoomBoolean.onFalse}
        onCreateRoom={() => {}}
      />
    </RoomContainer>
  );
}

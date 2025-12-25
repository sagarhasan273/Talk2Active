import type { UserType } from 'src/types/type-user';
import type { Message, Participant, ReactionMessageData } from 'src/types/type-room';

import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import { styled } from '@mui/material/styles';
import { Box, Container, Typography } from '@mui/material';

import { useParams } from 'src/routes/route-hooks';

import useWebRTC from 'src/hooks/use-web-rtc';
import { useSocket } from 'src/hooks/use-socket';
import { useBoolean } from 'src/hooks/use-boolean';

import { useRoomTools } from 'src/core/slices/slice-room';
import { setAccount, selectAccount } from 'src/core/slices';
import { useJoinRoomMutation, useLeaveRoomMutation } from 'src/core/apis';

import { ChatRoomFooter } from './chat-room-footer';
import { ChatRoomChatBody } from './chat-room-body';
import { ChatRoomHeader } from './chat-room-header';
import { ChatRoomChatJoinNow } from './chat-room-join-now';
import { CreateRoomModal } from '../../section-voice-room/voice-room-create-modal';

interface WebRTCEventData {
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  sender?: string;
  target?: string;
}

interface ExistingParticipantsData {
  participants: Participant[];
  roomId: string;
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
const JOIN_ROOM_ERROR = 'Failed to join the room. Please try again.';
const INITIALIZATION_ERROR = 'Failed to initialize voice chat:';

export function VoiceRoomChat() {
  const dispatch = useDispatch();
  const roomId = useParams().roomId as string;
  const user = useSelector(selectAccount);

  // Room management
  const {
    room,
    remoteParticipants,
    addRemoteParticipant,
    removeRemoteParticipant,
    updateRemoteParticipantAudio,
    updateRemoteParticipantStatus,
    resetRemoteParticipants,
    addChatRoomMessage,
    reactionChatRoomMessage,
  } = useRoomTools();

  // WebRTC
  const {
    remoteStreams,
    localStream,
    isMicMuted,
    initializeMicrophone,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    toggleMicrophone,
    cleanup: cleanupWebRTC,
  } = useWebRTC();

  // Socket
  const { socket, connect } = useSocket({ autoConnect: false });

  // State
  const editRoomBoolean = useBoolean(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [status, setStatus] = useState<UserType['status']>('online');

  // API mutations
  const [joinRoomMutation, { isLoading: isJoining }] = useJoinRoomMutation();
  const [leaveRoomMutation, { isLoading: isLeaving }] = useLeaveRoomMutation();

  // Memoized values
  const participantsArray = useMemo(() => Object.values(remoteParticipants), [remoteParticipants]);

  const isRoomReady = Boolean(roomId && user?.id);

  // WebRTC and socket event handlers
  const setupSocketListeners = useCallback(() => {
    if (!socket) {
      return undefined;
    }

    // Existing participants
    const handleExistingParticipants = (data: ExistingParticipantsData) => {
      if (data.roomId !== roomId) return;
      data.participants.forEach((participant) => {
        if (participant.socketId !== socket.id) {
          addRemoteParticipant(participant);
          createOffer(participant.socketId, socket);
        }
      });
    };

    // User joined
    const handleUserJoined = (data: Participant) => {
      if (data.socketId !== socket?.id) {
        addRemoteParticipant(data);
        createOffer(data.socketId, socket);
      }
    };

    // User left
    const handleUserLeft = (data: { socketId: string; roomId?: string }) => {
      removeRemoteParticipant(data.socketId);
    };

    // Audio toggled
    const handleAudioToggled = (data: { socketId: string; isMuted: boolean; roomId?: string }) => {
      updateRemoteParticipantAudio({ socketId: data.socketId, isMuted: data.isMuted });
    };

    // Status updated
    const handleStatusUpdated = (data: {
      socketId: string;
      status: UserType['status'];
      roomId?: string;
    }) => {
      if (!data.roomId || data.roomId === roomId) {
        updateRemoteParticipantStatus({ socketId: data.socketId, status: data.status });
      }
    };

    // Message handlers
    const handleGroupMessage = (data: Message) => {
      const receiveMessage: Message = {
        id: data.id,
        text: data.text,
        sender: data.sender,
        time: data.time,
        isUnread: true,
        isPrivate: false,
        type: data.type,
        systemMessageType: data?.systemMessageType,
        userInfo: data.userInfo,
        mentions: data.mentions || [],
        messageRepliedOf: data?.messageRepliedOf,
      };
      addChatRoomMessage(receiveMessage);
    };

    const handleReactionMessage = (data: ReactionMessageData) => {
      reactionChatRoomMessage({
        messageId: data.messageId,
        reaction: data.reaction,
      });
    };

    const handlePrivateMessage = (data: Message) => {
      const receiveMessage: Message = {
        id: data.id,
        text: data.text,
        sender: data.sender,
        time: data.time,
        userInfo: data.userInfo,
        targetUserInfo: data?.targetUserInfo,
        isUnread: true,
        isPrivate: true,
        type: data.type,
        systemMessageType: data?.systemMessageType,
        mentions: data.mentions || [],
        messageRepliedOf: data?.messageRepliedOf,
      };
      addChatRoomMessage(receiveMessage);
    };

    // WebRTC signaling
    const handleWebRTCOffer = (data: WebRTCEventData) => {
      handleOffer(data, socket);
    };

    const handleWebRTCAnswer = (data: WebRTCEventData) => {
      handleAnswer(data);
    };

    const handleWebRTCIceCandidate = (data: WebRTCEventData) => {
      handleIceCandidate(data);
    };

    // Connection errors
    const handleConnectError = (error: Error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      toast.error('Connection error. Please try again.');
    };

    const handleDisconnect = async () => {
      await leaveRoom();
    };

    // Register listeners
    socket.on('existing-participants', handleExistingParticipants);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('user-audio-toggled', handleAudioToggled);
    socket.on('user-status-selected', handleStatusUpdated);
    socket.on('receive-group-message', handleGroupMessage);
    socket.on('receive-reaction-group-message', handleReactionMessage);
    socket.on('receive-private-message', handlePrivateMessage);
    socket.on('webrtc-offer', handleWebRTCOffer);
    socket.on('webrtc-answer', handleWebRTCAnswer);
    socket.on('webrtc-ice-candidate', handleWebRTCIceCandidate);
    socket.on('connect_error', handleConnectError);
    socket.on('disconnect', handleDisconnect);

    // Return cleanup function
    return () => {
      socket.off('existing-participants', handleExistingParticipants);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('user-audio-toggled', handleAudioToggled);
      socket.off('user-status-selected', handleStatusUpdated);
      socket.off('receive-group-message', handleGroupMessage);
      socket.off('receive-reaction-group-message', handleReactionMessage);
      socket.off('receive-private-message', handlePrivateMessage);
      socket.off('webrtc-offer', handleWebRTCOffer);
      socket.off('webrtc-answer', handleWebRTCAnswer);
      socket.off('webrtc-ice-candidate', handleWebRTCIceCandidate);
      socket.off('connect_error', handleConnectError);
      socket.off('disconnect', handleDisconnect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    socket,
    roomId,
    addRemoteParticipant,
    createOffer,
    removeRemoteParticipant,
    updateRemoteParticipantAudio,
    updateRemoteParticipantStatus,
    addChatRoomMessage,
    reactionChatRoomMessage,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
  ]);

  const initializeVoiceRoom = useCallback(async (): Promise<void> => {
    if (!socket || !roomId || !user?.id) {
      console.error('Missing required data for initialization');
      return;
    }

    try {
      await initializeMicrophone();
      setIsConnected(true);

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
    } catch (error) {
      console.error('Error initializing voice room:', error);
      toast.error(`${INITIALIZATION_ERROR} ${(error as Error).message}`);
      throw error;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, roomId, user, isMicMuted, room.host?.id, initializeMicrophone]);

  const handleToggleMicrophone = useCallback((): void => {
    if (!socket) return;

    const isNowMuted = toggleMicrophone();

    socket.emit('user-audio-toggle', {
      socketId: socket.id,
      roomId,
      isMuted: isNowMuted,
      name: user.name,
    });
  }, [socket, roomId, user.name, toggleMicrophone]);

  const handleToggleUserStatus = useCallback(
    (selectedStatus: UserType['status']): void => {
      if (!socket) return;

      socket.emit('user-status-select', {
        roomId,
        socketId: socket.id,
        status: selectedStatus,
        name: user.name,
      });
      setStatus(selectedStatus);
    },
    [socket, roomId, user.name]
  );

  const joinRoom = useCallback(async () => {
    if (!isRoomReady || isConnected || isInitializing || isJoining) return;

    try {
      setIsInitializing(true);

      connect();
      const response = await joinRoomMutation({ roomId, userId: user.id }).unwrap();

      if (response.status) {
        toast.success('Joined the room successfully');
      }
    } catch (error) {
      setIsConnected(false);
      toast.error(JOIN_ROOM_ERROR);
    } finally {
      setIsInitializing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isRoomReady,
    isConnected,
    isInitializing,
    isJoining,
    initializeVoiceRoom,
    joinRoomMutation,
    roomId,
    user.id,
  ]);

  const leaveRoom = useCallback(async () => {
    if (!socket || !roomId || !user?.id || isLeaving) return;

    try {
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

      // Reset local state
      resetRemoteParticipants();
      setIsConnected(false);
      setIsInitializing(false);

      // Update user status
      dispatch(setAccount({ ...user, status: 'online' }));

      toast.success('Left the room successfully');
    } catch (error) {
      console.error('Error leaving room:', error);
      toast.error('Failed to leave room properly');
    }
  }, [
    socket,
    roomId,
    user,
    isLeaving,
    leaveRoomMutation,
    cleanupWebRTC,
    resetRemoteParticipants,
    dispatch,
  ]);

  // Setup socket listeners on mount and socket change
  useEffect(() => {
    if (!socket) return undefined;

    const cleanupListeners = setupSocketListeners();
    return () => {
      cleanupListeners?.();
    };
  }, [socket, setupSocketListeners]);

  useEffect(() => {
    if (!socket) return undefined;

    initializeVoiceRoom();
    return undefined;
  }, [socket, initializeVoiceRoom]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (isConnected) {
        leaveRoom();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (!roomId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h5" color="error">
          Room ID is missing
        </Typography>
      </Box>
    );
  }

  if (!user?.id) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h5" color="error">
          User not authenticated
        </Typography>
      </Box>
    );
  }

  return (
    <RoomContainer maxWidth="xl">
      <ChatRoomHeader isConnected={isConnected} editRoomBoolean={editRoomBoolean} />

      {!isConnected ? (
        <ChatRoomChatJoinNow
          onJoinRoom={joinRoom}
          isLoading={isInitializing || isJoining}
          isDisabled={!isRoomReady}
        />
      ) : (
        <>
          <ChatRoomChatBody
            isConnected={isConnected}
            isInitializing={isInitializing}
            isMicMuted={isMicMuted}
            status={status}
            participants={participantsArray}
            remoteStreams={remoteStreams}
            localStream={localStream}
          />

          {isConnected && localStream && (
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

import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect, useCallback } from 'react'; // Added useCallback

import { styled } from '@mui/material/styles';
import { Box, Container, Typography } from '@mui/material';

// NOTE: Replace the mocks above with your actual imports if using a real project structure
import { useParams } from 'src/routes/route-hooks';

import useWebRTC from 'src/hooks/use-web-rtc'; // Assumed actual use
// Assumed actual use
import { setAccount, selectAccount } from 'src/core/slices'; // Assumed actual use
import { useJoinRoomMutation, useLeaveRoomMutation } from 'src/core/apis'; // Assumed actual use
import type { UserType } from 'src/types/type-user';
import type { Message, Participant, ReactionMessageData } from 'src/types/type-room';

// Assumed actual use
import { toast } from 'sonner';

import { useSocket } from 'src/hooks/use-socket';
import { useBoolean } from 'src/hooks/use-boolean';

import { useRoomTools } from 'src/core/slices/slice-room';

import { ChatRoomFooter } from './chat-room-footer';
import { ChatRoomChatBody } from './chat-room-body';
import { ChatRoomHeader } from './chat-room-header';
import { ChatRoomChatJoinNow } from './chat-room-join-now';
// Assumed actual import
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

// Styled components
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

// Main Component
export function VoiceRoomChat() {
  const dispatch = useDispatch();

  const roomId = useParams().roomId as string;
  const user = useSelector(selectAccount);
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
    cleanup,
  } = useWebRTC();

  const { socket } = useSocket({ autoConnect: true });

  const editRoomBoolean = useBoolean(false);

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [initialize, setInitialize] = useState<boolean>(true); // Tracks if we're ready to join
  const [status, setStatus] = useState<UserType['status']>('online');

  const [joinRoomMutation] = useJoinRoomMutation();
  const [leaveRoomMutation] = useLeaveRoomMutation();

  // Convert map to array for rendering
  const participantsArray = useMemo(() => Object.values(remoteParticipants), [remoteParticipants]);

  const initializeVoiceRoom = async (): Promise<void> => {
    try {
      await initializeMicrophone();

      console.log('socket', socket?.id);

      setIsConnected(true);
      socket?.emit('join-voice-room', {
        roomId,
        userId: user.id,
        name: user.name,
        profilePhoto: user.profilePhoto,
        isMuted: isMicMuted,
        status: 'online',
        userType: room.host.id === user.id ? 'Host' : 'Guest',
        verified: user.verified,
      });

      // Handle existing participants and start WebRTC handshake
      socket?.on('existing-participants', (data: ExistingParticipantsData) => {
        data.participants.forEach((participant) => {
          addRemoteParticipant(participant);
          createOffer(participant.socketId, socket!);
        });
      });

      // Handle new user joining
      socket?.on('user-joined', (data: Participant) => {
        if (data.socketId !== socket?.id) {
          addRemoteParticipant(data);
          createOffer(data.socketId, socket!);
        }
      });

      // Handle user leaving
      socket?.on('user-left', (data: { socketId: string }) => {
        removeRemoteParticipant(data.socketId);
      });

      // Handle remote user's audio state update (NEW)
      socket?.on('user-audio-toggled', (data: { socketId: string; isMuted: boolean }) => {
        updateRemoteParticipantAudio({ socketId: data.socketId, isMuted: data.isMuted });
      });

      // Handle remote user's status update (NEW)
      socket?.on(
        'user-status-selected',
        (data: { socketId: string; status: UserType['status'] }) => {
          updateRemoteParticipantStatus({ socketId: data.socketId, status: data.status });
        }
      );

      // chat room message received
      socket?.on('receive-group-message', (data: Message) => {
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
      });

      socket?.on('receive-reaction-group-message', (data: ReactionMessageData) => {
        reactionChatRoomMessage({
          messageId: data.messageId,
          reaction: data.reaction,
        });
      });

      socket?.on('receive-private-message', (data: Message) => {
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
      });

      // WebRTC signaling events
      socket?.on('webrtc-offer', (data: WebRTCEventData) => {
        handleOffer(data, socket!);
      });

      socket?.on('webrtc-answer', (data: WebRTCEventData) => {
        handleAnswer(data);
      });

      socket?.on('webrtc-ice-candidate', (data: WebRTCEventData) => {
        handleIceCandidate(data);
      });

      // Connection state handlers
      socket?.on('connect_error', (error: Error) => {
        setIsConnected(false);
      });

      socket?.on('disconnect', async () => {
        await leaveRoomMutation({ roomId, userId: user.id });
        leaveRoom();
      });
    } catch (error) {
      console.error('Error initializing voice room:', error);
      // alert replaced with console error for canvas compatibility
      console.error(`Failed to initialize voice chat: ${(error as Error).message}`);
    }
  };

  const handleToggleMicrophone = (): void => {
    const isNowMuted = toggleMicrophone();
    // Broadcast the new mute state to the signaling server
    socket?.emit('user-audio-toggle', {
      roomId,
      isMuted: isNowMuted,
      name: user.name,
    });
  };

  const handleToggleUserStatus = (selectedStatus: UserType['status']): void => {
    socket?.emit('user-status-select', {
      roomId,
      socketId: socket?.id,
      status: selectedStatus,
      name: user.name,
    });
    setStatus(selectedStatus);
  };

  const joinRoom = async () => {
    if (isConnected || !initialize || !roomId || !user.id) return;

    try {
      setInitialize(false); // Set initializing state
      console.log('Starting voice room initialization...');
      await initializeVoiceRoom();
      const response = await joinRoomMutation({ roomId, userId: user.id }).unwrap();
      if (response.status) {
        toast.success('Joined the room successfully');
      }
    } catch (error) {
      console.error('Initialization failed:', error);
      setInitialize(true); // Allow retry on failure
      setIsConnected(false);
    }
  };

  // --- NEW: Synchronous cleanup for browser events ---
  const performCleanup = useCallback(async () => {
    if (socket) {
      socket?.emit('leave-voice-room', { roomId, userId: user.id, name: user.name });
      await leaveRoomMutation({ roomId, userId: user.id });
    }

    cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user.id, cleanup]);
  // --- END NEW: Synchronous cleanup for browser events ---

  // Updated leaveRoom to use performCleanup
  const leaveRoom = async () => {
    console.log('Leaving voice room...');

    performCleanup();

    resetRemoteParticipants();

    setInitialize(true);
    dispatch(setAccount({ ...user, status: 'online' }));
  };

  // Store socket globally for WebRTC hook access
  // useEffect(() => {
  //   (window as any).socket = socket;
  //   return () => {
  //     delete (window as any).socket;
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [socket]);

  useEffect(
    () => () => {
      performCleanup();
    },
    [performCleanup]
  );

  // useEffect(() => {
  //   const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  //     performCleanup();
  //   };

  //   window.addEventListener('beforeunload', handleBeforeUnload);

  //   return () => {
  //     window.removeEventListener('beforeunload', handleBeforeUnload);
  //   };
  // }, [performCleanup]);

  if (!roomId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h5" color="error">
          Room ID is missing
        </Typography>
      </Box>
    );
  }

  return (
    <RoomContainer maxWidth="xl">
      <ChatRoomHeader isConnected={isConnected} editRoomBoolean={editRoomBoolean} />

      {!isConnected ? (
        <ChatRoomChatJoinNow onJoinRoom={() => joinRoom()} />
      ) : (
        <>
          {/* Participants Grid */}
          <ChatRoomChatBody
            isConnected={isConnected}
            initialize={initialize}
            isMicMuted={isMicMuted}
            status={status}
            participants={participantsArray}
            remoteStreams={remoteStreams}
            localStream={localStream}
          />

          {/* Voice Controls - Only show if connected and localStream is ready */}
          {isConnected && localStream && (
            <ChatRoomFooter
              isMicMuted={isMicMuted}
              onClickMic={() => handleToggleMicrophone()}
              onStatusChange={handleToggleUserStatus}
              onClickLeaveRoom={() => leaveRoom()}
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

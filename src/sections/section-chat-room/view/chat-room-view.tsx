import type { Socket } from 'socket.io-client';

import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react'; // Added useCallback

import { styled } from '@mui/material/styles';
import { Box, Container, Typography } from '@mui/material';

// NOTE: Replace the mocks above with your actual imports if using a real project structure
import { useParams } from 'src/routes/route-hooks';

import useWebRTC from 'src/hooks/use-web-rtc'; // Assumed actual use
import { CONFIG } from 'src/config-global'; // Assumed actual use
import { setAccount, selectAccount } from 'src/core/slices'; // Assumed actual use
import { useJoinRoomMutation, useLeaveRoomMutation } from 'src/core/apis'; // Assumed actual use
import type { UserType } from 'src/types/type-user';
import type { Message, Participant } from 'src/types/type-room';

// Assumed actual use
import { toast } from 'sonner';

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
  } = useRoomTools();

  const editRoomBoolean = useBoolean(false);

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [initialize, setInitialize] = useState<boolean>(true); // Tracks if we're ready to join
  const [status, setStatus] = useState<UserType['status']>('online');

  const socketRef = useRef<Socket | null>(null);

  const [joinRoomMutation] = useJoinRoomMutation();
  const [leaveRoomMutation] = useLeaveRoomMutation();

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

  // Convert map to array for rendering
  const participantsArray = useMemo(() => Object.values(remoteParticipants), [remoteParticipants]);

  const initializeVoiceRoom = async (): Promise<void> => {
    try {
      await initializeMicrophone();

      // Ensure no double connection
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      socketRef.current = io(CONFIG.serverUrl, {
        transports: ['websocket'],
      });

      socketRef.current.on('connect', () => {
        setIsConnected(true);
        socketRef.current?.emit('join-voice-room', {
          roomId,
          userId: user.id,
          name: user.name,
          profilePhoto: user.profilePhoto,
          isMuted: isMicMuted,
          status: 'online',
          userType: room.host.id === user.id ? 'Host' : 'Guest',
          verified: user.verified,
        });
      });

      // Handle existing participants and start WebRTC handshake
      socketRef.current.on('existing-participants', (data: ExistingParticipantsData) => {
        data.participants.forEach((participant) => {
          addRemoteParticipant(participant);
          createOffer(participant.socketId, socketRef.current!);
        });
      });

      // Handle new user joining
      socketRef.current.on('user-joined', (data: Participant) => {
        if (data.socketId !== socketRef.current?.id) {
          addRemoteParticipant(data);
          createOffer(data.socketId, socketRef.current!);
        }
      });

      // Handle user leaving
      socketRef.current.on('user-left', (data: { socketId: string }) => {
        removeRemoteParticipant(data.socketId);
      });

      // Handle remote user's audio state update (NEW)
      socketRef.current.on('user-audio-toggled', (data: { socketId: string; isMuted: boolean }) => {
        updateRemoteParticipantAudio({ socketId: data.socketId, isMuted: data.isMuted });
      });

      // Handle remote user's status update (NEW)
      socketRef.current.on(
        'user-status-selected',
        (data: { socketId: string; status: UserType['status'] }) => {
          updateRemoteParticipantStatus({ socketId: data.socketId, status: data.status });
        }
      );

      // chat room message received
      socketRef.current.on('receive-group-message', (data: any) => {
        const receiveMessage: Message = {
          id: data.id,
          text: data.text,
          sender: 'them',
          time: data.time,
          isUnread: true,
          isPrivate: false,
          type: data.type,
          systemMessageType: data?.systemMessageType,
          userInfo: data.userInfo,
          mentions: data.mentions || [],
        };
        addChatRoomMessage(receiveMessage);
      });

      socketRef.current.on('receive-private-message', (data: Message) => {
        const receiveMessage: Message = {
          id: data.id,
          text: data.text,
          sender: 'them',
          time: data.time,
          userInfo: data.userInfo,
          targetUserInfo: data?.targetUserInfo,
          isUnread: true,
          isPrivate: true,
          type: data.type,
          systemMessageType: data?.systemMessageType,
          mentions: data.mentions || [],
        };
        addChatRoomMessage(receiveMessage);
      });

      // WebRTC signaling events
      socketRef.current.on('webrtc-offer', (data: WebRTCEventData) => {
        handleOffer(data, socketRef.current!);
      });

      socketRef.current.on('webrtc-answer', (data: WebRTCEventData) => {
        handleAnswer(data);
      });

      socketRef.current.on('webrtc-ice-candidate', (data: WebRTCEventData) => {
        handleIceCandidate(data);
      });

      // Connection state handlers
      socketRef.current.on('connect_error', (error: Error) => {
        setIsConnected(false);
      });

      socketRef.current.on('disconnect', async () => {
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
    socketRef.current?.emit('user-audio-toggle', {
      roomId,
      isMuted: isNowMuted,
      name: user.name,
    });
  };

  const handleToggleUserStatus = (selectedStatus: UserType['status']): void => {
    socketRef.current?.emit('user-status-select', {
      roomId,
      socketId: socketRef.current?.id,
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
    if (socketRef.current) {
      socketRef.current.emit('leave-voice-room', { roomId, userId: user.id, name: user.name });

      socketRef.current.disconnect();
      socketRef.current = null;
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
    setIsConnected(false);
    setInitialize(true);
    dispatch(setAccount({ ...user, status: 'online' }));
  };

  // Store socket globally for WebRTC hook access
  useEffect(() => {
    (window as any).socket = socketRef.current;
    return () => {
      delete (window as any).socket;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketRef.current]);

  useEffect(
    () => () => {
      performCleanup();
    },
    [performCleanup]
  );

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      performCleanup();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [performCleanup]);

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

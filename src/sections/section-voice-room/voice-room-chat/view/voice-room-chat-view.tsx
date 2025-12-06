import type { Socket } from 'socket.io-client';
// NOTE: Assuming UserType is correctly defined and imported in the full project
// import type { UserType } from 'src/types/user';

import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react'; // Added useCallback

import { styled } from '@mui/material/styles';
import { Box, Container, Typography } from '@mui/material';

// NOTE: Replace the mocks above with your actual imports if using a real project structure
import { useParams } from 'src/routes/route-hooks';

import useWebRTC from 'src/hooks/use-web-rtc'; // Assumed actual use
import { CONFIG } from 'src/config-global'; // Assumed actual use
import { selectAccount } from 'src/core/slices'; // Assumed actual use
import { useJoinRoomMutation, useLeaveRoomMutation } from 'src/core/apis'; // Assumed actual use
import type { UserType } from 'src/types/type-user';

// Assumed actual use
import { toast } from 'sonner';

import { useBoolean } from 'src/hooks/use-boolean';

import { VoiceRoomChatBody } from './voice-room-chat-body';
import { VoiceRoomChatHeader } from './voice-room-chat-header';
import { VoiceRoomChatFooter } from './voice-room-chat-footer';
// Assumed actual import
import { CreateRoomModal } from '../../voice-room-create-modal';
import { VoiceRoomChatJoinNow } from './voice-room-chat-join-now';

import type { Participant } from '../type';

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
  const roomId = useParams().roomId as string;
  const user = useSelector(selectAccount);

  const editRoomBoolean = useBoolean(false);

  // State to store remote participants, using a map for easy updates
  const [remoteParticipants, setRemoteParticipants] = useState<{ [socketId: string]: Participant }>(
    {}
  );
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [initialize, setInitialize] = useState<boolean>(true); // Tracks if we're ready to join

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
    // ... (initializeVoiceRoom logic remains the same)
    try {
      // 1. Get local audio stream
      await initializeMicrophone();

      // Ensure no double connection
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      // 2. Connect to Socket.IO
      socketRef.current = io(CONFIG.serverUrl, {
        transports: ['websocket'],
      });

      socketRef.current.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to voice room with ID:', socketRef.current?.id);

        // 3. Join room and send initial mute state
        socketRef.current?.emit('join-voice-room', {
          roomId,
          userId: user.id,
          name: user.name,
          profilePhoto: user.profilePhoto,
          isMuted: isMicMuted,
        });
      });

      // Handle existing participants and start WebRTC handshake
      socketRef.current.on('existing-participants', (data: ExistingParticipantsData) => {
        const participantMap: { [key: string]: Participant } = {};
        const otherParticipants = data.participants.filter(
          (participant) => participant.socketId !== socketRef.current?.id
        ) as Participant[];

        otherParticipants.forEach((participant) => {
          participantMap[participant.socketId] = participant;
          createOffer(participant.socketId, socketRef.current!);
        });
        setRemoteParticipants(participantMap);
      });

      // Handle new user joining
      socketRef.current.on('user-joined', (data: Participant) => {
        if (data.socketId !== socketRef.current?.id) {
          setRemoteParticipants((prev) => ({
            ...prev,
            [data.socketId]: data,
          }));
          createOffer(data.socketId, socketRef.current!);
        }
      });

      // Handle user leaving
      socketRef.current.on('user-left', (data: { socketId: string }) => {
        console.log('User left:', data);
        setRemoteParticipants((prev) => {
          const newState = { ...prev };
          delete newState[data.socketId];
          return newState;
        });
      });

      // Handle remote user's audio state update (NEW)
      socketRef.current.on('user-audio-toggled', (data: { socketId: string; isMuted: boolean }) => {
        console.log('User audio toggled:', data);
        setRemoteParticipants((prev) => {
          const participant = prev[data.socketId];
          if (participant) {
            return {
              ...prev,
              [data.socketId]: {
                ...participant,
                isMuted: data.isMuted,
              },
            };
          }
          return prev;
        });
      });

      // Handle remote user's status update (NEW)
      socketRef.current.on(
        'user-status-select',
        (data: { socketId: string; status: UserType['status'] }) => {
          console.log('User audio toggled:', data);
          setRemoteParticipants((prev) => {
            const participant = prev[data.socketId];
            if (participant) {
              return {
                ...prev,
                [data.socketId]: {
                  ...participant,
                  status: data.status,
                },
              };
            }
            return prev;
          });
        }
      );

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
        console.error('Connection error:', error);
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

  const handleToggleUserStatus = (status: string): void => {
    socketRef.current?.emit('user-status-select', {
      roomId,
      status,
      name: user.name,
    });
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
      // 1. Send leave signal (best effort, may be blocked by browser)
      socketRef.current.emit('leave-voice-room', { roomId, userId: user.id });

      // 2. Immediate disconnect
      socketRef.current.disconnect();
      socketRef.current = null;
      // Perform async backend mutation (can be unreliable on page close, but safe here)
    }
    // 3. WebRTC resource cleanup (must be synchronous)
    cleanup();
  }, [roomId, user.id, cleanup]);
  // --- END NEW: Synchronous cleanup for browser events ---

  // Updated leaveRoom to use performCleanup
  const leaveRoom = async () => {
    console.log('Leaving voice room...');
    performCleanup(); // Execute synchronous cleanup first

    // Perform state updates and async mutation immediately after
    setRemoteParticipants({});
    setIsConnected(false);
    setInitialize(true);
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
      <VoiceRoomChatHeader isConnected={isConnected} editRoomBoolean={editRoomBoolean} />

      {!isConnected ? (
        <VoiceRoomChatJoinNow onJoinRoom={() => joinRoom()} />
      ) : (
        <>
          {/* Participants Grid */}
          <VoiceRoomChatBody
            isConnected={isConnected}
            initialize={initialize}
            isMicMuted={isMicMuted}
            participants={participantsArray}
            remoteStreams={remoteStreams}
            localStream={localStream}
          />

          {/* Voice Controls - Only show if connected and localStream is ready */}
          {isConnected && localStream && (
            <VoiceRoomChatFooter
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

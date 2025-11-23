import type { Socket } from 'socket.io-client';
// NOTE: Assuming UserType is correctly defined and imported in the full project
// import type { UserType } from 'src/types/user';

import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react'; // Added useCallback

import { styled } from '@mui/material/styles';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  CallEnd as CallEndIcon,
  Headphones as HeadphonesIcon,
} from '@mui/icons-material';
import {
  Box,
  Chip,
  Card,
  Grid,
  Paper,
  Stack,
  Button,
  Avatar,
  Container,
  Typography,
  IconButton,
  CardContent,
  LinearProgress,
} from '@mui/material';

// --- MOCK IMPORTS (Replace with actual imports in your environment) ---
// const useParams = () => ({ roomId: 'mock-room-123' });
// const selectAccount = () => ({ id: 'user-001', name: 'Local User', profilePhoto: '' });
// const selectRoom = () => ({ name: 'Language Exchange', language: 'Japanese', level: 'Advanced' });
// const useLeaveRoomMutation = () => [async () => console.log('Mock: Leaving room...')];
// const CONFIG = { serverUrl: 'http://localhost:3000' };
// --- END MOCK IMPORTS ---

// NOTE: Replace the mocks above with your actual imports if using a real project structure
import { useParams } from 'src/routes/route-hooks';

import useWebRTC from 'src/hooks/use-web-rtc'; // Assumed actual use
import { CONFIG } from 'src/config-global'; // Assumed actual use
import { selectAccount } from 'src/core/slices'; // Assumed actual use
import { useLeaveRoomMutation } from 'src/core/apis'; // Assumed actual use
import { selectRoom } from 'src/core/slices/slice-room'; // Assumed actual use
import UserAudio from './user-audio'; // Assumed actual import

// Define UserType structure for context
interface UserType {
  id: string;
  name: string;
  profilePhoto: string;
}

// Updated participant type
type Participant = UserType & { socketId: string; isMuted?: boolean };

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
  padding: theme.spacing(3),
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const HeaderPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
}));

const ParticipantCard = styled(Card)(({ theme }) => ({
  height: '220px', // Slightly larger to accommodate status
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  background: theme.palette.background.default,
  border: `2px solid ${theme.palette.primary.main}`,
}));

const LocalParticipantCard = styled(ParticipantCard)(({ theme }) => ({
  border: `2px solid ${theme.palette.secondary.main}`,
  background: theme.palette.background.paper,
}));

const ControlsPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(2),
}));

const StatsPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  textAlign: 'center',
  background: theme.palette.background.default,
}));

// Main Component
export function VoiceRoomChat() {
  const room = useSelector(selectRoom);
  const roomId = useParams().roomId as string;
  const user = useSelector(selectAccount); // Local user data

  // State to store remote participants, using a map for easy updates
  const [remoteParticipants, setRemoteParticipants] = useState<{ [socketId: string]: Participant }>(
    {}
  );
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [initialize, setInitialize] = useState<boolean>(true); // Tracks if we're ready to join
  const socketRef = useRef<Socket | null>(null);

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
    cleanup, // WebRTC cleanup
  } = useWebRTC();

  // Convert map to array for rendering
  const participantsArray = useMemo(() => Object.values(remoteParticipants), [remoteParticipants]);
  const totalParticipants = participantsArray.length + (isConnected ? 1 : 0);

  // Store socket globally for WebRTC hook access
  useEffect(() => {
    (window as any).socket = socketRef.current;
    return () => {
      delete (window as any).socket;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketRef.current]);

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

      socketRef.current.on('disconnect', () => {
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
    });
  };

  const [leaveRoomMutation] = useLeaveRoomMutation();

  // --- NEW: Synchronous cleanup for browser events ---
  const performCleanup = useCallback(() => {
    if (socketRef.current) {
      // 1. Send leave signal (best effort, may be blocked by browser)
      socketRef.current.emit('leave-voice-room', { roomId, userId: user.id });

      // 2. Immediate disconnect
      socketRef.current.disconnect();
      socketRef.current = null;
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

    // Perform async backend mutation (can be unreliable on page close, but safe here)
    await leaveRoomMutation({ roomId, userId: user.id });
  };

  const joinRoom = async () => {
    if (isConnected || !initialize || !roomId || !user.id) return;

    try {
      setInitialize(false); // Set initializing state
      console.log('Starting voice room initialization...');
      await initializeVoiceRoom();
    } catch (error) {
      console.error('Initialization failed:', error);
      setInitialize(true); // Allow retry on failure
      setIsConnected(false);
    }
  };

  // 1. Cleanup on component unmount (for navigation away)
  useEffect(
    () => () => {
      // If the component unmounts normally, run the full cleanup
      performCleanup();
    },
    [performCleanup]
  );

  // 2. NEW: Cleanup on browser window close or reload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Execute synchronous cleanup without state updates (React state is gone)
      performCleanup();
      // Note: RTK mutation (async) is unreliable here, only signal is critical.
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
      {/* Header */}
      <HeaderPaper elevation={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {room?.name || `Voice Room ${roomId}`}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={room?.language || 'English'} color="secondary" size="small" />
            <Chip
              label={room?.level || 'Intermediate'}
              variant="outlined"
              size="small"
              sx={{ color: 'white', borderColor: 'white' }}
            />
            <Chip
              icon={isConnected ? <HeadphonesIcon /> : <CallEndIcon />}
              label={isConnected ? 'Connected' : 'Disconnected'}
              color={isConnected ? 'success' : 'error'}
              size="small"
            />
          </Stack>
        </Box>
        {/* Conditional Join/Leave Buttons */}
        {!isConnected ? (
          <Button
            variant="contained"
            color="success"
            startIcon={<HeadphonesIcon />}
            onClick={joinRoom}
            size="large"
            disabled={!initialize}
          >
            {initialize ? 'Join Room' : 'Connecting...'}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="error"
            startIcon={<CallEndIcon />}
            onClick={leaveRoom}
            size="large"
          >
            Leave Room
          </Button>
        )}
      </HeaderPaper>

      {/* Participants Grid */}
      <Box flex={1} display="flex" flexDirection="column">
        <Typography variant="h6" gutterBottom>
          Participants ({totalParticipants})
        </Typography>

        {!isConnected && !initialize && <LinearProgress color="warning" sx={{ mb: 2 }} />}

        <Grid container spacing={3}>
          {/* Local User - Only show if localStream is available */}
          {localStream && (
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <LocalParticipantCard elevation={2}>
                <CardContent sx={{ textAlign: 'center', width: '100%' }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: 'secondary.main',
                      mb: 2,
                      mx: 'auto',
                    }}
                  >
                    {user.username.charAt(0)}
                  </Avatar>
                  <Typography variant="h6" gutterBottom noWrap>
                    {user.username} (You)
                  </Typography>
                  <UserAudio
                    stream={localStream} // USE LOCAL STREAM
                    isLocal
                    userName={user.username}
                  />
                  <Typography
                    variant="body2"
                    color={isMicMuted ? 'error' : 'success.main'}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={0.5}
                  >
                    {isMicMuted ? <MicOffIcon fontSize="small" /> : <MicIcon fontSize="small" />}
                    {isMicMuted ? 'Muted' : 'Speaking'}
                  </Typography>
                </CardContent>
              </LocalParticipantCard>
            </Grid>
          )}

          {/* Remote Participants */}
          {participantsArray.map((participant) => (
            <Grid key={participant.socketId} item xs={12} sm={6} md={4} lg={3}>
              <ParticipantCard elevation={1}>
                <CardContent sx={{ textAlign: 'center', width: '100%' }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: 'primary.main',
                      mb: 2,
                      mx: 'auto',
                    }}
                  >
                    {participant.name.charAt(0)}
                  </Avatar>

                  <Typography variant="h6" gutterBottom noWrap>
                    {participant.name}
                  </Typography>

                  <UserAudio
                    stream={remoteStreams[participant.socketId] || null}
                    isLocal={false}
                    userName={participant.name}
                  />

                  {/* Remote Participant Mute/Speaking Status */}
                  <Typography
                    variant="body2"
                    // Use isMuted status from the participant object
                    color={participant.isMuted ? 'error' : 'success.main'}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={0.5}
                  >
                    {participant.isMuted ? (
                      <MicOffIcon fontSize="small" />
                    ) : (
                      <MicIcon fontSize="small" />
                    )}
                    {participant.isMuted ? 'Muted' : 'Speaking'}
                  </Typography>
                </CardContent>
              </ParticipantCard>
            </Grid>
          ))}
        </Grid>

        {participantsArray.length === 0 && isConnected && (
          <Box textAlign="center" mt={4}>
            <Typography variant="h6" color="text.secondary">
              Waiting for other participants to join...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Voice Controls - Only show if connected and localStream is ready */}
      {isConnected && localStream && (
        <ControlsPaper elevation={3}>
          <IconButton
            color={isMicMuted ? 'error' : 'primary'}
            onClick={handleToggleMicrophone}
            sx={{
              width: 80,
              height: 80,
              backgroundColor: isMicMuted ? 'error.light' : 'primary.light',
              '&:hover': {
                backgroundColor: isMicMuted ? 'error.main' : 'primary.main',
              },
            }}
          >
            {isMicMuted ? <MicOffIcon fontSize="large" /> : <MicIcon fontSize="large" />}
          </IconButton>

          <IconButton
            color="error"
            onClick={leaveRoom}
            sx={{
              width: 80,
              height: 80,
              backgroundColor: 'error.light',
              '&:hover': {
                backgroundColor: 'error.main',
              },
            }}
          >
            <CallEndIcon fontSize="large" />
          </IconButton>
        </ControlsPaper>
      )}

      {/* Room Stats */}
      <StatsPaper elevation={1}>
        <Typography variant="body2" color="text.secondary">
          Participants: {totalParticipants}
          {!isConnected && localStream && ' • Disconnected'}
          {!localStream && !isConnected && ' • Microphone Access Required'}
        </Typography>
      </StatsPaper>
    </RoomContainer>
  );
}

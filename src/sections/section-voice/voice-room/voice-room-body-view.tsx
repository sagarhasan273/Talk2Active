import type { UserType } from 'src/types/type-user';
import type { Participant } from 'src/types/type-room';

import { useSelector } from 'react-redux';
import React, { useMemo, useState, useCallback } from 'react';

import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SettingsIcon from '@mui/icons-material/Settings';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import {
  Box,
  Zoom,
  Fade,
  Paper,
  Slide,
  Stack,
  Slider,
  styled,
  Avatar,
  Tooltip,
  Divider,
  useTheme,
  Typography,
  IconButton,
  useMediaQuery,
} from '@mui/material';

import { useRoomTools, selectAccount } from 'src/core/slices';
import { useWebRTCContext } from 'src/core/contexts/webRTC-context';
import { useSocketContext } from 'src/core/contexts/socket-context';

import { Scrollbar } from 'src/components/scrollbar';
import { VoiceRoomMessageGroupDrawer } from 'src/components/drawers';

import { ChatStatusButton } from 'src/sections/section-chat-room/chat-status-button';
import { ChatMessageGroup } from 'src/sections/section-chat-room/chat-message-group';

import { VoiceUserCard } from '../voice-user-card';
import { RaiseHandButton } from '../voice-raise-hand-button';

// Styled Components - FIXED: Remove isSelected from DOM
const FeaturedSection = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isSelected', // Prevent isSelected from reaching DOM
})<{ isSelected: boolean }>(({ theme, isSelected }) => ({
  width: '100%',
  height: isSelected ? '60%' : '0%',
  minHeight: isSelected ? '300px' : '0',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: theme.palette.background.neutral,
  borderRadius: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    height: isSelected ? '50%' : '0%',
    minHeight: isSelected ? '250px' : '0',
  },
}));

const GridSection = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isSelected', // Prevent isSelected from reaching DOM
})<{ isSelected: boolean }>(({ theme, isSelected }) => ({
  width: '100%',
  height: isSelected ? '40%' : '100%',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.neutral,
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    height: isSelected ? '50%' : '100%',
    padding: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
}));

// Rest of your styled components (no changes needed)
const ControlBar = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 20,
  left: '50%',
  transform: 'translateX(-50%)',
  padding: theme.spacing(0.5, 2),
  borderRadius: 50,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'auto',
  minWidth: 250,
  gap: theme.spacing(1),
  backgroundColor: 'rgba(30, 31, 34, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  zIndex: 1000,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5, 1),
    minWidth: 250,
    position: 'relative',
    left: 0,
    bottom: 10,
  },
}));

const StageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  position: 'relative',
  overflow: 'hidden',
}));

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  gap: theme.spacing(2),
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const FeaturedCard = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: '500px',
  height: '100%',
  maxHeight: '400px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const RoomControlers = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(1, 2),
  borderRadius: 40,
  backgroundColor: theme.palette.background.paper,
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  marginTop: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.2, 1),
    gap: theme.spacing(0.5),
  },
}));

const FeaturedControls = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(1, 2),
  borderRadius: 40,
  backgroundColor: theme.palette.background.paper,
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  marginTop: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.2, 1),
    gap: theme.spacing(0.5),
  },
}));

const BackToGridButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  left: 16,
  zIndex: 100,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

const VolumeSlider = styled(Slider)({
  width: 100,
  color: '#5865f2',
  '& .MuiSlider-thumb': {
    width: 12,
    height: 12,
    '&:hover': {
      boxShadow: '0 0 0 8px rgba(88, 101, 242, 0.2)',
    },
  },
  '& .MuiSlider-track': {
    height: 4,
  },
  '& .MuiSlider-rail': {
    height: 4,
    backgroundColor: '#4e5058',
  },
});

// FIXED: Wrapped components that need refs for Tooltip
const TooltipIconButton = React.forwardRef<HTMLButtonElement, any>((props, ref) => (
  <IconButton {...props} ref={ref} />
));

const TooltipBox = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <Box {...props} ref={ref} />
));

export function VoiceRoomBodyView({ onLeaveRoom }: { onLeaveRoom: () => void }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const webRTC = useWebRTCContext();
  const { emit, socket } = useSocketContext();
  const {
    room,
    participants,
    userVoiceState,
    updateUserVoiceState,
    updateUserVolumesState,
    updateParticipantStatus,
  } = useRoomTools();

  const user = useSelector(selectAccount);

  const {
    localStream,
    remoteStreams,
    setRemoteVolume,
    isMicMuted,
    connectionStatus,
    onClickMicrophone,
  } = webRTC;

  const { userVolumes, roomId } = userVoiceState;

  const handleMicMute = () => {
    onClickMicrophone(!isMicMuted);
    updateUserVoiceState({ isMicMuted: !isMicMuted });
    if (roomId) {
      emit('user-audio-toggle', {
        socketId: socket?.id,
        roomId,
        isMuted: !isMicMuted,
        name: user.name,
      });
    }
  };

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [reaction, setReaction] = useState<string | null>(null);

  const selectedParticipant = useMemo(
    () => (selectedUserId ? participants[selectedUserId] : null),
    [selectedUserId, participants]
  );

  const otherParticipants = useMemo(
    () => Object.values(participants).filter((p) => p.socketId !== selectedUserId),
    [participants, selectedUserId]
  );

  const handleSelectParticipant = (participant: Participant) => {
    setSelectedUserId(participant.socketId);
  };

  const handleBackToGrid = () => {
    setSelectedUserId(null);
  };

  const handleVolumeChange = (socketId: string, volume: number) => {
    updateUserVolumesState({ socketId, volume });
    setRemoteVolume(socketId, volume);
  };

  const handleReaction = (type: string) => {
    if (!socket) {
      return;
    }
    setReaction(type);
    setTimeout(() => setReaction(null), 2000);
    emit('send-user-actions-in-voice', {
      roomId: room.id,
      type: 'reaction',
      senderInfo: {
        socketId: socket.id,
        userId: user.id,
        emoji: type,
      },
    });
  };

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

      if (socket.id) updateParticipantStatus({ socketId: socket.id, status: selectedStatus });
    },
    [socket, roomId, user?.name, updateParticipantStatus]
  );

  return (
    <StageContainer>
      {/* Top Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {room.name}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {Object.keys(participants).length} participants • 01:24:05
          </Typography>
        </Box>

        <RoomControlers>
          <VoiceRoomMessageGroupDrawer>
            <ChatMessageGroup />
          </VoiceRoomMessageGroupDrawer>

          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'divider', mx: 0.5 }} />

          {/* FIXED: Wrapped IconButton in Tooltip with forwardRef */}
          <Tooltip title="Room settings">
            <TooltipIconButton
              size="small"
              sx={{
                color: '#b5bac1',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'divider',
                  transform: 'rotate(90deg)',
                  color: '#43b581',
                },
              }}
            >
              <SettingsIcon fontSize="small" />
            </TooltipIconButton>
          </Tooltip>
        </RoomControlers>
      </Box>

      {/* Main Content */}
      <Scrollbar>
        <MainContent>
          {/* Featured Speaker Section */}
          <FeaturedSection isSelected={Boolean(selectedParticipant)}>
            {selectedParticipant && (
              <Fade in={Boolean(selectedParticipant)} timeout={500}>
                <FeaturedCard>
                  {/* Back button for mobile */}
                  {isMobile && (
                    <Tooltip title="Back to grid">
                      <BackToGridButton size="small" onClick={handleBackToGrid}>
                        <KeyboardBackspaceIcon />
                      </BackToGridButton>
                    </Tooltip>
                  )}

                  {/* Reaction animation */}
                  {reaction && (
                    <Zoom in timeout={4000}>
                      <TooltipBox
                        sx={{
                          position: 'absolute',
                          top: '40%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          zIndex: 20,
                          animation: 'float 1s ease-out',
                          '@keyframes float': {
                            '0%': { transform: 'translateX(-50%) translateY(0)', opacity: 1 },
                            '100%': { transform: 'translateX(-50%) translateY(-50px)', opacity: 0 },
                          },
                        }}
                      >
                        <Avatar sx={{ bgcolor: reaction === '❤️' ? '#dbdbdb' : '#5865f2' }}>
                          {reaction}
                        </Avatar>
                      </TooltipBox>
                    </Zoom>
                  )}

                  {/* User Card */}
                  <Box sx={{ transform: 'scale(1.2)' }}>
                    <VoiceUserCard
                      participant={{
                        userId: selectedParticipant.userId,
                        name: selectedParticipant.name,
                        profilePhoto: selectedParticipant.profilePhoto,
                        status: selectedParticipant.status,
                        isSpeaking: false,
                        isMuted: Boolean(selectedParticipant.isMuted),
                        userType: room.host.id === selectedParticipant.userId ? 'Host' : 'Guest',
                        verified: selectedParticipant.verified,
                        isLocal: selectedParticipant.isLocal,
                        connectionStatus: connectionStatus[selectedParticipant.socketId],
                        hasJoin: selectedParticipant.hasJoin,
                      }}
                      size="large"
                      stream={
                        selectedParticipant.isLocal
                          ? localStream
                          : remoteStreams[selectedParticipant.socketId]
                      }
                      showName={false}
                    />
                  </Box>

                  {/* User Name and Role */}
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedParticipant.name}
                    {selectedParticipant.isLocal && ' (You)'}
                  </Typography>

                  {/* Controls for featured user */}
                  {!selectedParticipant.isLocal && (
                    <FeaturedControls>
                      <Stack
                        direction="row"
                        sx={{ color: '#b5bac1', alignItems: 'center', gap: 0.5 }}
                      >
                        <VolumeOffIcon fontSize="small" />
                        <VolumeSlider
                          size="small"
                          value={userVolumes[selectedParticipant.socketId] ?? 50}
                          onChange={(_, value) =>
                            handleVolumeChange(selectedParticipant.socketId, value as number)
                          }
                        />
                        <VolumeUpIcon fontSize="small" />
                      </Stack>

                      <Divider orientation="vertical" flexItem sx={{ bgcolor: 'divider', mx: 1 }} />

                      {/* FIXED: Wrapped IconButton in Tooltip with forwardRef */}
                      <Tooltip title="React">
                        <TooltipIconButton
                          size="small"
                          onClick={() => handleReaction('❤️')}
                          sx={{ color: '#b5bac1', '&:hover': { color: '#ff4d4d' } }}
                        >
                          <FavoriteIcon fontSize="small" />
                        </TooltipIconButton>
                      </Tooltip>

                      <VoiceRoomMessageGroupDrawer title="Private Message">
                        <ChatMessageGroup
                          privateMessage={{
                            socketId: selectedParticipant.socketId,
                            userId: selectedParticipant.userId,
                            name: selectedParticipant.name,
                            profilePhoto: selectedParticipant.profilePhoto,
                          }}
                        />
                      </VoiceRoomMessageGroupDrawer>

                      <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ bgcolor: 'divider', mx: 0.5 }}
                      />

                      {/* FIXED: Wrapped IconButton in Tooltip with forwardRef */}
                      <Tooltip title="More">
                        <TooltipIconButton
                          size="small"
                          sx={{
                            color: '#b5bac1',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: 'divider',
                              transform: 'rotate(90deg)',
                              color: '#43b581',
                            },
                          }}
                        >
                          <SettingsIcon fontSize="small" />
                        </TooltipIconButton>
                      </Tooltip>
                    </FeaturedControls>
                  )}
                </FeaturedCard>
              </Fade>
            )}
          </FeaturedSection>

          {/* Participants Grid Section */}
          <GridSection isSelected={Boolean(selectedParticipant)}>
            <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.7 }}>
              {selectedParticipant ? 'Other Participants' : 'All Participants'} •{' '}
              {otherParticipants.length}
            </Typography>

            <Scrollbar sx={{ minHeight: 'calc(100% - 40px)' }}>
              <ParticipantsGrid>
                {otherParticipants.map((participant, index) => (
                  <Zoom key={participant.socketId} in timeout={300 + index * 50}>
                    <TooltipBox
                      sx={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.02)',
                        },
                      }}
                    >
                      <VoiceUserCard
                        participant={{
                          userId: participant.userId,
                          name: participant.name,
                          profilePhoto: participant.profilePhoto,
                          status: participant.status,
                          isSpeaking: false,
                          isMuted: Boolean(participant.isMuted),
                          userType: participant.userType,
                          verified: participant.verified,
                          connectionStatus: connectionStatus[participant.socketId],
                          isLocal: participant.isLocal,
                          hasJoin: participant.hasJoin,
                        }}
                        size={isMobile ? 'small' : 'medium'}
                        stream={
                          participant.isLocal ? localStream : remoteStreams[participant.socketId]
                        }
                        onClick={() => handleSelectParticipant(participant)}
                      />
                    </TooltipBox>
                  </Zoom>
                ))}
              </ParticipantsGrid>
            </Scrollbar>
          </GridSection>
        </MainContent>
      </Scrollbar>

      {/* Control Bar */}
      <Slide direction="up" in timeout={500}>
        <ControlBar>
          {/* FIXED: Wrapped IconButton in Tooltip with forwardRef */}
          <Tooltip title={isMicMuted ? 'Unmute' : 'Mute'}>
            <TooltipIconButton
              sx={{
                bgcolor: isMicMuted ? '#ff4d4d' : 'transparent',
                color: isMicMuted ? 'white' : 'common.white',
                '&:hover': {
                  bgcolor: isMicMuted ? '#ff0000' : '#3b3d44',
                },
              }}
              size="small"
              onClick={handleMicMute}
            >
              {!isMicMuted ? <MicIcon /> : <MicOffIcon />}
            </TooltipIconButton>
          </Tooltip>

          {/* FIXED: ChatStatusButton might need ref forwarding - check if it accepts refs */}
          <Tooltip title="Camera">
            <Box sx={{ display: 'inline-flex' }}>
              <ChatStatusButton onStatusChange={handleToggleUserStatus} />
            </Box>
          </Tooltip>

          {/* FIXED: Wrapped IconButton in Tooltip with forwardRef */}
          <Tooltip title="Share Screen">
            <TooltipIconButton
              sx={{ color: 'common.white', '&:hover': { bgcolor: '#3b3d44' } }}
              size="small"
            >
              <ScreenShareIcon />
            </TooltipIconButton>
          </Tooltip>

          <RaiseHandButton />

          <Divider orientation="vertical" flexItem sx={{ bgcolor: '#4e5058' }} />

          {/* FIXED: Wrapped IconButton in Tooltip with forwardRef */}
          <Tooltip title="Leave Room">
            <TooltipIconButton
              onClick={onLeaveRoom}
              sx={{
                bgcolor: '#ff4d4d',
                color: 'white',
                '&:hover': {
                  bgcolor: '#ff0000',
                },
              }}
              size="small"
            >
              <ExitToAppIcon />
            </TooltipIconButton>
          </Tooltip>
        </ControlBar>
      </Slide>
    </StageContainer>
  );
}

// Add missing ParticipantsGrid styled component
const ParticipantsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  height: '100%',
  width: '100%',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.spacing(1),
  },
}));

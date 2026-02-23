import type { Participant } from 'src/types/type-room';

import React, { useMemo, useState } from 'react';

import MicIcon from '@mui/icons-material/Mic';
import PanToolIcon from '@mui/icons-material/PanTool';
import VideocamIcon from '@mui/icons-material/Videocam';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import {
  Box,
  Zoom,
  Fade,
  Chip,
  Paper,
  Slide,
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

import { useRoomTools } from 'src/core/slices';
import { useWebRTCContext } from 'src/core/contexts/webRTC-context';

import { Scrollbar } from 'src/components/scrollbar';

import VoiceUserAudio from '../voice-user-audio';
import { VoiceUserCard } from '../voice-user-card';

// Styled Components
const ControlBar = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  bottom: 20,
  left: '50%',
  transform: 'translateX(-50%)',
  padding: theme.spacing(1, 2),
  borderRadius: 50,
  display: 'flex',
  gap: theme.spacing(1),
  backgroundColor: 'rgba(30, 31, 34, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  zIndex: 1000,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5, 1),
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

const FeaturedSection = styled(Box)(
  ({ theme, isSelected }: { theme?: any; isSelected: boolean }) => ({
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
  })
);

const GridSection = styled(Box)(({ theme, isSelected }: { theme?: any; isSelected: boolean }) => ({
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
  },
}));

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
}));

const FeaturedControls = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  borderRadius: 40,
  backgroundColor: theme.palette.background.paper,
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  marginTop: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5, 1),
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

const FullscreenButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  zIndex: 100,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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

export function VoiceRoomBodyView({ onLeaveRoom }: { onLeaveRoom: () => void }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const webRTC = useWebRTCContext();
  const { room, participants } = useRoomTools();

  const { localStream, remoteStreams, setRemoteVolume, isMicMuted, isDeafened, connectionStatus } =
    webRTC;

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userVolumes, setUserVolumes] = useState<Record<string, number>>({});
  const [reaction, setReaction] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    setUserVolumes((prev) => ({ ...prev, [socketId]: volume }));
    setRemoteVolume(socketId, volume);
  };

  const handleReaction = (type: string) => {
    setReaction(type);
    setTimeout(() => setReaction(null), 2000);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const isSelected = Boolean(selectedParticipant);

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
        <Chip
          label="Voice Channel"
          size="small"
          sx={{
            bgcolor: '#5865f2',
            color: 'white',
            fontWeight: 600,
          }}
        />
      </Box>

      {/* Main Content */}
      <MainContent>
        {/* Featured Speaker Section */}
        <FeaturedSection isSelected={isSelected}>
          {selectedParticipant && (
            <Fade in={isSelected} timeout={500}>
              <FeaturedCard>
                {/* Back button for mobile */}
                {isMobile && (
                  <BackToGridButton size="small" onClick={handleBackToGrid}>
                    <KeyboardBackspaceIcon />
                  </BackToGridButton>
                )}

                {/* Fullscreen toggle for desktop */}
                {!isMobile && (
                  <FullscreenButton size="small" onClick={toggleFullscreen}>
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </FullscreenButton>
                )}

                {/* Reaction animation */}
                {reaction && (
                  <Zoom in timeout={400}>
                    <Box
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
                      <Avatar sx={{ bgcolor: reaction === '❤️' ? '#ff4d4d' : '#5865f2' }}>
                        {reaction}
                      </Avatar>
                    </Box>
                  </Zoom>
                )}

                {/* User Card */}
                <Box sx={{ transform: 'scale(1.2)' }}>
                  <VoiceUserCard
                    user={{
                      userId: selectedParticipant.userId,
                      name: selectedParticipant.name,
                      profilePhoto: selectedParticipant.profilePhoto,
                      status: 'online',
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
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                  {selectedParticipant.name}
                  {selectedParticipant.isLocal && ' (You)'}
                </Typography>

                <Chip
                  label={room.host.id === selectedParticipant.userId ? 'Host' : 'Guest'}
                  size="small"
                  sx={{
                    bgcolor: room.host.id === selectedParticipant.userId ? '#5865f2' : '#4e5058',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />

                {/* Controls for featured user */}
                <FeaturedControls>
                  <VolumeSlider
                    size="small"
                    value={userVolumes[selectedParticipant.socketId] ?? 100}
                    onChange={(_, value) =>
                      handleVolumeChange(selectedParticipant.socketId, value as number)
                    }
                  />

                  <Divider orientation="vertical" flexItem sx={{ bgcolor: 'divider', mx: 1 }} />

                  <Tooltip title="React">
                    <IconButton
                      size="small"
                      onClick={() => handleReaction('❤️')}
                      sx={{ color: '#b5bac1', '&:hover': { color: '#ff4d4d' } }}
                    >
                      <FavoriteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Message">
                    <IconButton
                      size="small"
                      sx={{ color: '#b5bac1', '&:hover': { color: '#5865f2' } }}
                    >
                      <ChatBubbleIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {!isMobile && (
                    <Tooltip title="More">
                      <IconButton
                        size="small"
                        sx={{ color: '#b5bac1', '&:hover': { color: '#43b581' } }}
                      >
                        <AddReactionIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </FeaturedControls>
              </FeaturedCard>
            </Fade>
          )}
        </FeaturedSection>

        {/* Participants Grid Section */}
        <GridSection isSelected={isSelected}>
          <Typography variant="subtitle2" sx={{ mb: 2, opacity: 0.7 }}>
            {isSelected ? 'Other Participants' : 'All Participants'} • {otherParticipants.length}
          </Typography>

          <Scrollbar sx={{ height: 'calc(100% - 40px)' }}>
            <ParticipantsGrid>
              {otherParticipants.map((participant, index) => (
                <Zoom key={participant.socketId} in timeout={300 + index * 50}>
                  <Box
                    sx={{
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                      },
                    }}
                  >
                    <VoiceUserCard
                      user={{
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
                  </Box>
                </Zoom>
              ))}
            </ParticipantsGrid>
          </Scrollbar>
        </GridSection>
      </MainContent>

      {/* Control Bar */}
      <Slide direction="up" in timeout={500}>
        <ControlBar>
          <Tooltip title={isMicMuted ? 'Unmute' : 'Mute'}>
            <IconButton
              sx={{
                bgcolor: isMicMuted ? '#ff4d4d' : 'transparent',
                color: isMicMuted ? 'white' : '#b5bac1',
                '&:hover': {
                  bgcolor: isMicMuted ? '#ff0000' : '#3b3d44',
                },
              }}
            >
              <MicIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Camera">
            <IconButton sx={{ color: '#b5bac1', '&:hover': { bgcolor: '#3b3d44' } }}>
              <VideocamIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Share Screen">
            <IconButton sx={{ color: '#b5bac1', '&:hover': { bgcolor: '#3b3d44' } }}>
              <ScreenShareIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Raise Hand">
            <IconButton sx={{ color: '#b5bac1', '&:hover': { bgcolor: '#3b3d44' } }}>
              <PanToolIcon />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ bgcolor: '#4e5058' }} />

          <Tooltip title="Leave Room">
            <IconButton
              onClick={onLeaveRoom}
              sx={{
                bgcolor: '#ff4d4d',
                color: 'white',
                '&:hover': {
                  bgcolor: '#ff0000',
                },
              }}
            >
              <ExitToAppIcon />
            </IconButton>
          </Tooltip>
        </ControlBar>
      </Slide>

      {/* Audio Elements */}
      {Object.values(participants).map((participant) => (
        <VoiceUserAudio
          key={participant.socketId}
          stream={participant.isLocal ? localStream : remoteStreams[participant.socketId]}
          isLocal={participant.isLocal}
          userName={participant.name || 'unknown'}
          volume={userVolumes[participant.socketId]}
          muted={participant.isMuted || isDeafened}
        />
      ))}
    </StageContainer>
  );
}

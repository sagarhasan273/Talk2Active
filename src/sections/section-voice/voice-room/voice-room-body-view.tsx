import type { Participant } from 'src/types/type-room';

import React, { useMemo, useState } from 'react';

import MicIcon from '@mui/icons-material/Mic';
import PanToolIcon from '@mui/icons-material/PanTool';
import VideocamIcon from '@mui/icons-material/Videocam';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import {
  Box,
  Zoom,
  Fade,
  Grow,
  Chip,
  Paper,
  Slide,
  Slider,
  styled,
  Avatar,
  Tooltip,
  Divider,
  SvgIcon,
  Collapse,
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

const ControlBar = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  bottom: 10,
  left: 0,
  right: 0,
  margin: '0 auto',
  width: 'fit-content',
  padding: theme.spacing(1, 2),
  borderRadius: 50,
  display: 'flex',
  gap: theme.spacing(1),
  backgroundColor:
    theme.palette.mode === 'dark' ? 'rgba(2, 2, 2, 0.8)' : 'rgba(255, 255, 255, 0.69)',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5, 1),
    gap: theme.spacing(0.5),
    bottom: 5,
  },
}));

const AnimatedParticipantCard = styled(Box)(({ theme }) => ({
  animation: 'slideInUp 0.5s ease-out',
  '@keyframes slideInUp': {
    '0%': {
      transform: 'translateY(20px) scale(0.95)',
      opacity: 0,
    },
    '100%': {
      transform: 'translateY(0) scale(1)',
      opacity: 1,
    },
  },
}));

const ParticipantGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  padding: theme.spacing(1),
  transition: 'all 0.3s ease',
  [theme.breakpoints.up('xs')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(5, 1fr)',
  },
}));

// New styled components for the interaction strip
const InteractionStrip = styled(Paper)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 1.5),
  borderRadius: 40,
  backgroundColor: 'rgba(30, 31, 34, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(40, 41, 44, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  [theme.breakpoints.up('xs')]: {
    padding: theme.spacing(0.35, 1),
  },
}));

const VolumeControl = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 2, 0.5, 1),
  borderRadius: 30,
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    '& .volume-slider': {
      width: 80,
      opacity: 1,
    },
  },
  [theme.breakpoints.down('sm')]: {
    '& .volume-slider': {
      width: 60,
      padding: theme.spacing(0.5, 2, 0.5, 1),
    },
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'transparent',
  color: 'grey.500',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.06)',
  },
  '& .MuiSvgIcon-root': {
    transition: 'all 0.2s ease',
  },
}));

export function VoiceRoomBodyView({ onLeaveRoom }: { onLeaveRoom: () => void }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const webRTC = useWebRTCContext();

  const { localStream, remoteStreams, setRemoteVolume, isMicMuted, isDeafened } = webRTC;

  const { room, participants } = useRoomTools();

  const [selectedParticipant, setSelectedParticipant] = useState<Participant | undefined>(
    undefined
  );
  const [isSelectionAnimating, setIsSelectionAnimating] = useState(false);
  const [hoveredParticipant, setHoveredParticipant] = useState<string | null>(null);
  const [userVolumes, setUserVolumes] = useState<Record<string, number>>({});
  const [reaction, setReaction] = useState<string | null>(null);

  const participantsArray = useMemo(
    () =>
      Object.values(participants).filter(
        (participant) => participant.userId !== selectedParticipant?.userId
      ),
    [participants, selectedParticipant]
  );

  const handleSelectedParticipant = (data: Participant) => {
    setIsSelectionAnimating(true);
    setSelectedParticipant(data);
    setTimeout(() => setIsSelectionAnimating(false), 200);
  };

  const handleBackToGrid = () => {
    setIsSelectionAnimating(true);
    setSelectedParticipant(undefined);
    setTimeout(() => setIsSelectionAnimating(false), 500);
  };

  const handleVolumeChange = (socketId: string, volume: number) => {
    setUserVolumes((prev) => ({ ...prev, [socketId]: volume }));
    setRemoteVolume(socketId, volume);
  };

  const handleReaction = (reactionType: string) => {
    setReaction(reactionType);
    setTimeout(() => setReaction(null), 2000);
  };

  return (
    <Box
      sx={{
        minHeight: 1,
        height: '100%',
        bgcolor: 'background.neutral',
        color: 'primary.main',
        p: { xs: 1, sm: 2 },
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* Top Navigation */}
      <Fade in timeout={500}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: { xs: 2, sm: 3 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
          }}
        >
          <Box>
            <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="bold">
              {room.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                Ongoing • 01:24:05
              </Typography>
              <Chip
                label={`${participantsArray.length + (selectedParticipant ? 1 : 0)} participants`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  bgcolor: 'rgba(88, 101, 242, 0.2)',
                  color: 'primary.main',
                }}
              />
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              color: 'primary.main',
            }}
          >
            <Tooltip title="Chat">
              <IconButton
                size="small"
                onClick={() => {}}
                sx={{
                  color: 'grey.500',
                }}
              >
                <SvgIcon>
                  <path
                    fill="currentColor"
                    d="m6 18l-2.3 2.3q-.475.475-1.088.213T2 19.575V4q0-.825.588-1.412T4 2h16q.825 0 1.413.588T22 4v12q0 .825-.587 1.413T20 18zm-.85-2H20V4H4v13.125zM4 16V4zm3-2h6q.425 0 .713-.288T14 13t-.288-.712T13 12H7q-.425 0-.712.288T6 13t.288.713T7 14m0-3h10q.425 0 .713-.288T18 10t-.288-.712T17 9H7q-.425 0-.712.288T6 10t.288.713T7 11m0-3h10q.425 0 .713-.288T18 7t-.288-.712T17 6H7q-.425 0-.712.288T6 7t.288.713T7 8"
                  />
                </SvgIcon>
              </IconButton>
            </Tooltip>
            <Tooltip title="More options">
              <IconButton
                size="small"
                onClick={() => {}}
                sx={{
                  color: 'grey.500',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'rotate(90deg)',
                  },
                  transform: 'rotate(0deg)',
                }}
              >
                <SvgIcon>
                  <path
                    fill="currentColor"
                    d="M19.9 12.66a1 1 0 0 1 0-1.32l1.28-1.44a1 1 0 0 0 .12-1.17l-2-3.46a1 1 0 0 0-1.07-.48l-1.88.38a1 1 0 0 1-1.15-.66l-.61-1.83a1 1 0 0 0-.95-.68h-4a1 1 0 0 0-1 .68l-.56 1.83a1 1 0 0 1-1.15.66L5 4.79a1 1 0 0 0-1 .48L2 8.73a1 1 0 0 0 .1 1.17l1.27 1.44a1 1 0 0 1 0 1.32L2.1 14.1a1 1 0 0 0-.1 1.17l2 3.46a1 1 0 0 0 1.07.48l1.88-.38a1 1 0 0 1 1.15.66l.61 1.83a1 1 0 0 0 1 .68h4a1 1 0 0 0 .95-.68l.61-1.83a1 1 0 0 1 1.15-.66l1.88.38a1 1 0 0 0 1.07-.48l2-3.46a1 1 0 0 0-.12-1.17ZM18.41 14l.8.9l-1.28 2.22l-1.18-.24a3 3 0 0 0-3.45 2L12.92 20h-2.56L10 18.86a3 3 0 0 0-3.45-2l-1.18.24l-1.3-2.21l.8-.9a3 3 0 0 0 0-4l-.8-.9l1.28-2.2l1.18.24a3 3 0 0 0 3.45-2L10.36 4h2.56l.38 1.14a3 3 0 0 0 3.45 2l1.18-.24l1.28 2.22l-.8.9a3 3 0 0 0 0 3.98m-6.77-6a4 4 0 1 0 4 4a4 4 0 0 0-4-4m0 6a2 2 0 1 1 2-2a2 2 0 0 1-2 2"
                  />
                </SvgIcon>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Fade>

      {/* Main Content Area */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 2, sm: 3 },
          height: 'calc(100% - 120px)',
          overflow: 'hidden',
        }}
      >
        {/* The Speaker Stage (Viewing another user) */}
        <Collapse in={Boolean(selectedParticipant)} timeout={400}>
          {selectedParticipant && (
            <Grow in={Boolean(selectedParticipant)} timeout={500}>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 700,
                  mx: 'auto',
                  pt: 1,
                  ransform: isSelectionAnimating ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.2s ease',
                }}
              >
                <AnimatedParticipantCard>
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    {/* Back button for mobile */}
                    {isMobile && (
                      <Zoom in={Boolean(selectedParticipant)}>
                        <IconButton
                          onClick={handleBackToGrid}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            zIndex: 10,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                          }}
                          size="small"
                        >
                          <KeyboardBackspaceIcon />
                        </IconButton>
                      </Zoom>
                    )}

                    {/* Reaction animation */}
                    {reaction && (
                      <Zoom in timeout={400}>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '30%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 20,
                            animation: 'float 1s ease-out',
                            '@keyframes float': {
                              '0%': { transform: 'translateX(-50%) translateY(0)', opacity: 1 },
                              '100%': {
                                transform: 'translateX(-50%) translateY(-50px)',
                                opacity: 0,
                              },
                            },
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: reaction === '❤️' ? '#ff4d4d' : '#5865f2',
                              width: 40,
                              height: 40,
                            }}
                          >
                            {reaction}
                          </Avatar>
                        </Box>
                      </Zoom>
                    )}

                    <VoiceUserCard
                      user={{
                        userId: selectedParticipant.userId,
                        name: selectedParticipant.name,
                        profilePhoto: selectedParticipant.profilePhoto,
                        status: 'online',
                        isSpeaking: false,
                        isMuted: isMicMuted,
                        userType: room.host.id === selectedParticipant.userId ? 'Host' : 'Guest',
                        verified: selectedParticipant.verified,
                        isLocal: selectedParticipant.isLocal,
                        connectionState: selectedParticipant.connectionState,
                      }}
                      size="large"
                      stream={
                        selectedParticipant.isLocal
                          ? localStream
                          : remoteStreams[selectedParticipant.socketId]
                      }
                    />

                    {/* Enhanced User Interaction Strip */}
                    <Fade in timeout={600}>
                      <InteractionStrip sx={{ mt: 1 }}>
                        {/* Volume Control - Always visible on hover */}
                        <VolumeControl>
                          <VolumeUpIcon sx={{ fontSize: isMobile ? 14 : 16, color: '#949ba4' }} />
                          <Slider
                            key={selectedParticipant.socketId}
                            className="volume-slider"
                            size="small"
                            value={userVolumes[selectedParticipant.socketId] ?? 100}
                            onChange={(_, value) =>
                              handleVolumeChange(selectedParticipant.socketId, value as number)
                            }
                            sx={{
                              width: { xs: 80, sm: 80 },
                              opacity: { xs: 1, sm: 0.7 },
                              transition: 'all 0.2s ease',
                              color: '#5865f2',
                              '& .MuiSlider-thumb': {
                                width: 10,
                                height: 10,
                                '&:hover': {
                                  boxShadow: '0 0 0 8px rgba(88, 101, 242, 0.2)',
                                },
                              },
                            }}
                          />
                        </VolumeControl>

                        <Divider orientation="vertical" flexItem sx={{ bgcolor: '#4e5058' }} />

                        {/* Quick Social Actions with enhanced tooltips */}
                        <Tooltip title="Send Reaction" placement="top" TransitionComponent={Zoom}>
                          <ActionButton
                            size="small"
                            onClick={() => handleReaction('❤️')}
                            sx={{
                              color: '#b5bac1',
                              '&:hover': {
                                color: '#ff4d4d',
                                bgcolor: 'rgba(255, 77, 77, 0.1)',
                              },
                            }}
                          >
                            <FavoriteIcon fontSize={isMobile ? 'small' : 'medium'} />
                          </ActionButton>
                        </Tooltip>

                        <Tooltip title="Direct Message" placement="top" TransitionComponent={Zoom}>
                          <ActionButton
                            size="small"
                            sx={{
                              '&:hover': {
                                color: '#5865f2',
                                bgcolor: 'rgba(88, 101, 242, 0.1)',
                              },
                            }}
                          >
                            <ChatBubbleIcon fontSize={isMobile ? 'small' : 'medium'} />
                          </ActionButton>
                        </Tooltip>

                        {/* Additional action on desktop */}
                        {!isMobile && (
                          <>
                            <Divider orientation="vertical" flexItem sx={{ bgcolor: '#4e5058' }} />
                            <Tooltip title="Add Friend" placement="top">
                              <ActionButton
                                size="small"
                                sx={{
                                  '&:hover': {
                                    color: '#43b581',
                                    bgcolor: 'rgba(67, 181, 129, 0.1)',
                                  },
                                }}
                              >
                                <AddReactionIcon fontSize="small" />
                              </ActionButton>
                            </Tooltip>
                          </>
                        )}
                      </InteractionStrip>
                    </Fade>

                    {/* User status badge */}
                    <Fade in timeout={500}>
                      <Chip
                        label={room.host.id === selectedParticipant.userId ? 'Host' : 'Guest'}
                        size="small"
                        sx={{
                          position: 'absolute',
                          bottom: { xs: 60, sm: 70 },
                          right: { xs: '50%', sm: 20 },
                          transform: { xs: 'translateX(50%)', sm: 'none' },
                          bgcolor:
                            room.host.id === selectedParticipant.userId
                              ? 'rgba(88, 101, 242, 0.9)'
                              : 'rgba(79, 84, 92, 0.9)',
                          color: '#fff',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          backdropFilter: 'blur(4px)',
                        }}
                      />
                    </Fade>
                  </Box>
                </AnimatedParticipantCard>
              </Box>
            </Grow>
          )}
        </Collapse>

        {/* Participant Grid */}
        <Box
          sx={{
            width: '100%',
            flex: 1,
            minHeight: 0,
            position: 'relative',
            transition: 'all 0.3s ease',
          }}
        >
          <Scrollbar
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: 2,
              pt: 1,
              pb: { xs: 6, sm: 8 },
              opacity: selectedParticipant && isMobile ? 0.3 : 1,
              transition: 'opacity 0.3s ease',
              pointerEvents: selectedParticipant && isMobile ? 'none' : 'auto',
            }}
          >
            <ParticipantGrid>
              {participantsArray.map((participant, index) => (
                <Grow key={participant.socketId} in timeout={200 + index * 50}>
                  <Box
                    onMouseEnter={() => setHoveredParticipant(participant.userId)}
                    onMouseLeave={() => setHoveredParticipant(null)}
                    sx={{
                      transform:
                        hoveredParticipant === participant.userId ? 'scale(1.05)' : 'scale(1)',
                      transition: 'transform 0.2s ease',
                      cursor: 'pointer',
                      position: 'relative',
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
                        connectionState: participant.connectionState,
                        isLocal: participant.isLocal,
                      }}
                      onClick={() => handleSelectedParticipant(participant)}
                      stream={
                        participant.isLocal ? localStream : remoteStreams[participant.socketId]
                      }
                    />
                  </Box>
                </Grow>
              ))}
            </ParticipantGrid>
          </Scrollbar>
        </Box>
      </Box>

      {/* Floating Control Bar */}
      <Slide direction="up" in timeout={500}>
        <ControlBar>
          <Tooltip title={isMicMuted ? 'Unmute' : 'Mute'} TransitionComponent={Zoom}>
            <IconButton
              size={isMobile ? 'small' : 'medium'}
              sx={{
                bgcolor: isMicMuted ? '#ff4d4d' : 'rgba(2, 2, 2, 0.3)',
                color: 'common.white',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: isMicMuted ? '#ff0000' : 'rgba(2, 2, 2, 0.5)',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <MicIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Camera" TransitionComponent={Zoom}>
            <IconButton
              size={isMobile ? 'small' : 'medium'}
              sx={{
                bgcolor: 'rgba(2, 2, 2, 0.3)',
                color: 'common.white',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(2, 2, 2, 0.5)',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <VideocamIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Share Screen" TransitionComponent={Zoom}>
            <IconButton
              size={isMobile ? 'small' : 'medium'}
              sx={{
                bgcolor: 'rgba(2, 2, 2, 0.3)',
                color: 'common.white',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(2, 2, 2, 0.5)',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <ScreenShareIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Raise Hand" TransitionComponent={Zoom}>
            <IconButton
              size={isMobile ? 'small' : 'medium'}
              sx={{
                bgcolor: 'rgba(2, 2, 2, 0.3)',
                color: 'common.white',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(2, 2, 2, 0.5)',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <PanToolIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Leave Room" TransitionComponent={Zoom}>
            <IconButton
              size={isMobile ? 'small' : 'medium'}
              onClick={onLeaveRoom}
              sx={{
                bgcolor: '#ff4d4d',
                color: 'white',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#ff0000',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <ExitToAppIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
          </Tooltip>
        </ControlBar>
      </Slide>

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
    </Box>
  );
}

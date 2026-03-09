import type { UserType } from 'src/types/type-user';

import { useSelector } from 'react-redux';
import React, { useMemo, useState, useCallback } from 'react';

import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import MicOffIcon from '@mui/icons-material/MicOff';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SettingsIcon from '@mui/icons-material/Settings';
import { styled, keyframes } from '@mui/material/styles';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import {
  Box,
  Chip,
  Zoom,
  Fade,
  Slide,
  Stack,
  alpha,
  Slider,
  Avatar,
  Tooltip,
  Divider,
  useTheme,
  Typography,
  IconButton,
  useMediaQuery,
} from '@mui/material';

import { useScreenShare } from 'src/hooks/use-screen-share';

// useScreenShare: getDisplayMedia only — no peer logic
import { useRoomTools, selectAccount } from 'src/core/slices';
import { useWebRTCContext } from 'src/core/contexts/webRTC-context';
import { useSocketContext } from 'src/core/contexts/socket-context';

import { VoiceRoomMessageGroupDrawer } from 'src/components/drawers';

import { VoiceUserCard } from '../voice-user-card';
import { ChatMessageGroup } from '../voice-message-group';
import { HostActionsMenu } from '../voice-host-action-menu';
import { RaiseHandButton } from '../voice-raise-hand-button';
import { ChatStatusButton } from '../voice-user-status-button';
import { ScreenSharePreviewPanel } from './screen-share-preview';

// ─── Animations ───────────────────────────────────────────────────────────────

const liveDot = keyframes`
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:0.4; transform:scale(0.7); }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────

const RootContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1.5),
  position: 'relative',
  overflow: 'hidden',
}));

const TopBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 1)}`,
  backgroundColor: theme.palette.mode === 'dark' ? alpha('#fff', 0.02) : alpha('#000', 0.015),
  flexShrink: 0,
  gap: theme.spacing(1),
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(1, 1.5) },
}));

const ScrollArea = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  minHeight: 0,
});

const ContentPad = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  minHeight: '100%',
  paddingBottom: theme.spacing(12),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    paddingBottom: theme.spacing(10),
  },
}));

const FeaturedPanel = styled(Box, {
  shouldForwardProp: (p) => p !== 'open',
})<{ open: boolean }>(({ theme, open }) => ({
  width: '100%',
  maxHeight: open ? 380 : 0,
  minHeight: open ? 240 : 0,
  overflow: 'hidden',
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
  backgroundColor:
    theme.palette.mode === 'dark' ? alpha('#000', 0.3) : alpha(theme.palette.primary.main, 0.03),
  transition: 'all 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    maxHeight: open ? 280 : 0,
    minHeight: open ? 200 : 0,
  },
}));

const GridPanel = styled(Box)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
  backgroundColor: theme.palette.mode === 'dark' ? alpha('#fff', 0.02) : alpha('#000', 0.015),
  padding: theme.spacing(1.5),
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(1) },
}));

const ParticipantsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(1),
  },
  [theme.breakpoints.down(360)]: { gridTemplateColumns: 'repeat(2, 1fr)' },
}));

const ControlBar = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 20,
  left: '50%',
  transform: 'translateX(-50%)',
  padding: theme.spacing(0.75, 1.5),
  borderRadius: 50,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.25),
  width: 'auto',
  minWidth: 240,
  maxWidth: '95vw',
  backgroundColor:
    theme.palette.mode === 'dark' ? 'rgba(14, 15, 20, 0.96)' : 'rgba(255, 255, 255, 0.96)',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  }`,
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 8px 36px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.04) inset'
      : '0 8px 36px rgba(0,0,0,0.14)',
  zIndex: 1000,
  [theme.breakpoints.down('sm')]: {
    bottom: 12,
    padding: theme.spacing(0.6, 1),
    gap: theme.spacing(0.1),
    minWidth: 'unset',
    width: 'calc(100vw - 24px)',
    justifyContent: 'space-around',
    borderRadius: 20,
  },
}));

// ─── CtrlBtn ──────────────────────────────────────────────────────────────────

const CtrlBtn = React.forwardRef<
  HTMLButtonElement,
  {
    tooltip: string;
    active?: boolean;
    danger?: boolean;
    warn?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
    disabled?: boolean;
  }
>(({ tooltip, active, danger, warn, onClick, children, disabled }, ref) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const p = theme.palette;

  const color = danger
    ? '#ff4d4d'
    : warn
      ? p.warning.main
      : active
        ? p.primary.main
        : isDark
          ? '#b5bac1'
          : alpha('#000', 0.5);
  const bg = danger
    ? alpha('#ff4d4d', 0.12)
    : warn
      ? alpha(p.warning.main, 0.12)
      : active
        ? alpha(p.primary.main, 0.12)
        : 'transparent';
  const bdr = danger
    ? alpha('#ff4d4d', 0.28)
    : warn
      ? alpha(p.warning.main, 0.28)
      : active
        ? alpha(p.primary.main, 0.28)
        : 'transparent';

  return (
    <Tooltip title={tooltip} arrow>
      <span>
        <IconButton
          ref={ref}
          size="small"
          onClick={onClick}
          disabled={disabled}
          sx={{
            borderRadius: '10px',
            color,
            bgcolor: bg,
            border: '1px solid',
            borderColor: bdr,
            transition: 'all 0.16s ease',
            minWidth: 34,
            minHeight: 34,
            '&:hover': {
              bgcolor: danger
                ? alpha('#ff4d4d', 0.22)
                : warn
                  ? alpha(p.warning.main, 0.22)
                  : active
                    ? alpha(p.primary.main, 0.2)
                    : isDark
                      ? alpha('#fff', 0.08)
                      : alpha('#000', 0.06),
              transform: 'scale(1.06)',
            },
            '&:active': { transform: 'scale(0.94)' },
            '&.Mui-disabled': { opacity: 0.38 },
          }}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
});

// ─── NoiseBadge ───────────────────────────────────────────────────────────────

const NoiseBadge = ({
  mode,
  onClick,
}: {
  mode: 'off' | 'basic' | 'aggressive';
  onClick: () => void;
}) => {
  const theme = useTheme();
  const cfg = {
    off: {
      label: 'NC Off',
      color: theme.palette.text.disabled,
      bg: alpha(theme.palette.text.disabled, 0.08),
    },
    basic: {
      label: 'NC On',
      color: theme.palette.success.main,
      bg: alpha(theme.palette.success.main, 0.1),
    },
    aggressive: {
      label: 'NC Max',
      color: theme.palette.primary.main,
      bg: alpha(theme.palette.primary.main, 0.12),
    },
  }[mode];

  return (
    <Tooltip title={`Noise cancellation: ${mode} — click to cycle`} arrow>
      <Box
        onClick={onClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.4,
          bgcolor: cfg.bg,
          border: `1px solid ${alpha(cfg.color, 0.35)}`,
          borderRadius: '8px',
          px: 0.85,
          py: 0.25,
          cursor: 'pointer',
          transition: 'opacity 0.15s',
          '&:hover': { opacity: 0.75 },
        }}
      >
        <GraphicEqIcon sx={{ fontSize: 11, color: cfg.color }} />
        <Typography
          sx={{ fontSize: '0.58rem', fontWeight: 800, color: cfg.color, letterSpacing: 0.6 }}
        >
          {cfg.label}
        </Typography>
      </Box>
    </Tooltip>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export function VoiceRoomBodyView({ onLeaveRoom }: { onLeaveRoom: () => void }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const primary = theme.palette.primary.main;

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
    ncMode,
    toggleNC,
    screenShareWebRTC, // ← from useWebRTC — owns all screen-share PCs & remote streams
  } = webRTC;

  const { userVolumes, roomId } = userVoiceState;

  // ── Screen capture ────────────────────────────────────────────────────────
  // useScreenShare: getDisplayMedia ONLY — no peer connection logic here.
  // The onStreamReady callback hands the stream to screenShareWebRTC which
  // creates dedicated PCs and sends offers to every participant.
  const {
    screenStream,
    isSharing,
    startScreenShare: startCapture,
    stopScreenShare: stopCapture,
    error: shareError,
  } = useScreenShare((stream) => {
    if (!socket) return;

    const participantIds = Object.values(participants)
      .filter((p) => !p.isLocal)
      .map((p) => p.socketId);

    if (stream) {
      // stream arrived → create screen-share PCs and send offers to all peers
      screenShareWebRTC.startSharing(stream, socket, participantIds);
    } else {
      // stream ended (user clicked browser "Stop sharing" or stopCapture())
      screenShareWebRTC.stopSharing(socket, participantIds);
    }

    emit('user-screen-share', { roomId, socketId: socket.id, isSharing: Boolean(stream) });
  });

  const handleToggleScreenShare = async () => {
    if (isSharing) {
      stopCapture();
    } else {
      await startCapture();
    }
  };

  // ── Remote screen streams ─────────────────────────────────────────────────
  // Populated by useScreenShareWebRTC when a remote peer starts sharing
  const { remoteScreenStreams } = screenShareWebRTC;
  const activeRemoteShare = Object.entries(remoteScreenStreams)[0] ?? null;
  const remoteShareSocketId = activeRemoteShare?.[0] ?? null;
  const remoteShareStream = activeRemoteShare?.[1] ?? null;
  const remoteSharerName = remoteShareSocketId
    ? (participants[remoteShareSocketId]?.name ?? 'Someone')
    : null;

  // ── Participants ──────────────────────────────────────────────────────────

  const isHost = room?.host?.id === user?.id;
  const [selectedSocketId, setSelectedSocketId] = useState<string | null>(null);

  const selectedParticipant = useMemo(
    () => (selectedSocketId ? participants[selectedSocketId] : null),
    [selectedSocketId, participants]
  );
  const otherParticipants = useMemo(
    () => Object.values(participants).filter((p) => p.socketId !== selectedSocketId),
    [participants, selectedSocketId]
  );
  const allParticipants = useMemo(() => Object.values(participants), [participants]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleMicMute = () => {
    onClickMicrophone(!isMicMuted);
    updateUserVoiceState({ isMicMuted: !isMicMuted });
    if (roomId)
      emit('user-audio-toggle', {
        socketId: socket?.id,
        roomId,
        isMuted: !isMicMuted,
        name: user.name,
      });
  };

  const handleVolumeChange = (socketId: string, volume: number) => {
    updateUserVolumesState({ socketId, volume });
    setRemoteVolume(socketId, volume);
  };

  const [reaction, setReaction] = useState<string | null>(null);
  const handleReaction = (type: string) => {
    if (!socket) return;
    setReaction(type);
    setTimeout(() => setReaction(null), 1800);
    emit('send-user-actions-in-voice', {
      roomId: room.id,
      type: 'reaction',
      senderInfo: { socketId: socket.id, userId: user.id, emoji: type },
    });
  };

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

  const handleHostAction = (action: 'mute' | 'kick' | 'block-mic', targetSocketId: string) => {
    if (action === 'kick' && targetSocketId === selectedSocketId) setSelectedSocketId(null);
  };

  const participantCount = allParticipants.length;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <RootContainer>
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <TopBar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
            <Typography
              variant="subtitle1"
              fontWeight={800}
              noWrap
              sx={{
                color: 'text.primary',
                letterSpacing: -0.4,
                fontSize: { xs: '0.85rem', sm: '1rem' },
              }}
            >
              {room.name}
            </Typography>
            {isHost && (
              <Chip
                label="HOST"
                size="small"
                sx={{
                  height: 17,
                  fontSize: '0.58rem',
                  fontWeight: 900,
                  letterSpacing: 0.8,
                  bgcolor: alpha(primary, 0.12),
                  color: primary,
                  border: `1px solid ${alpha(primary, 0.3)}`,
                  '& .MuiChip-label': { px: 0.6 },
                }}
              />
            )}
            {isSharing && (
              <Chip
                icon={<ScreenShareIcon sx={{ fontSize: '11px !important' }} />}
                label="Sharing"
                size="small"
                sx={{
                  height: 17,
                  fontSize: '0.58rem',
                  fontWeight: 900,
                  letterSpacing: 0.5,
                  bgcolor: alpha(theme.palette.success.main, 0.12),
                  color: theme.palette.success.main,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                  '& .MuiChip-label': { px: 0.6 },
                }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.2, flexWrap: 'wrap' }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: theme.palette.success.main,
                boxShadow: `0 0 6px ${theme.palette.success.main}`,
                animation: `${liveDot} 2s ease-in-out infinite`,
                flexShrink: 0,
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <PeopleAltIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                {participantCount}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              ·
            </Typography>
            <NoiseBadge mode={ncMode} onClick={toggleNC} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
          <VoiceRoomMessageGroupDrawer>
            <ChatMessageGroup />
          </VoiceRoomMessageGroupDrawer>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ height: 18, alignSelf: 'center', mx: 0.25 }}
          />
          <CtrlBtn tooltip="Room settings">
            <SettingsIcon sx={{ fontSize: 17 }} />
          </CtrlBtn>
        </Box>
      </TopBar>

      {/* ── Scroll area ──────────────────────────────────────────────────── */}
      <ScrollArea>
        <ContentPad>
          {/* Local screen share preview (sharer sees their own stream) */}
          {isSharing && screenStream && (
            <ScreenSharePreviewPanel stream={screenStream} isLocal onStop={stopCapture} />
          )}

          {/* Remote screen share preview (viewers see this when someone else is sharing) */}
          {!isSharing && remoteShareStream && remoteSharerName && (
            <ScreenSharePreviewPanel
              stream={remoteShareStream}
              isLocal={false}
              sharerName={remoteSharerName}
            />
          )}

          {/* Share error */}
          {shareError && (
            <Box
              sx={{
                px: 1.5,
                py: 0.75,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                border: `1px solid ${alpha(theme.palette.error.main, 0.25)}`,
                borderRadius: 2,
              }}
            >
              <Typography variant="caption" sx={{ color: theme.palette.error.main }}>
                {shareError}
              </Typography>
            </Box>
          )}

          {/* Featured speaker */}
          <FeaturedPanel open={Boolean(selectedParticipant)}>
            {selectedParticipant && (
              <Fade in={Boolean(selectedParticipant)} timeout={350}>
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                    p: { xs: 1.5, sm: 2.5 },
                    position: 'relative',
                  }}
                >
                  {isMobile && (
                    <IconButton
                      size="small"
                      onClick={() => setSelectedSocketId(null)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
                        '&:hover': { bgcolor: isDark ? alpha('#fff', 0.16) : alpha('#000', 0.13) },
                      }}
                    >
                      <KeyboardBackspaceIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}

                  {reaction && (
                    <Zoom in timeout={300}>
                      <Avatar
                        sx={{
                          position: 'absolute',
                          top: '35%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          zIndex: 20,
                          bgcolor: reaction === '❤️' ? '#dbdbdb' : primary,
                          animation: 'floatUp 1.2s ease-out forwards',
                          '@keyframes floatUp': {
                            '0%': { transform: 'translateX(-50%) translateY(0)', opacity: 1 },
                            '100%': {
                              transform: 'translateX(-50%) translateY(-64px)',
                              opacity: 0,
                            },
                          },
                        }}
                      >
                        {reaction}
                      </Avatar>
                    </Zoom>
                  )}

                  <Box
                    sx={{ transform: { xs: 'scale(1)', sm: 'scale(1.1)' }, mt: { xs: 0, sm: 1 } }}
                  >
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
                        accountType: selectedParticipant.accountType,
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

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      sx={{ fontSize: { xs: '0.9rem', sm: '1.05rem' } }}
                    >
                      {selectedParticipant.name}
                      {selectedParticipant.isLocal && (
                        <Box
                          component="span"
                          sx={{
                            color: 'text.secondary',
                            fontWeight: 400,
                            ml: 0.5,
                            fontSize: '0.85em',
                          }}
                        >
                          (You)
                        </Box>
                      )}
                    </Typography>
                    {!selectedParticipant.isLocal && (
                      <HostActionsMenu
                        targetSocketId={selectedParticipant.socketId}
                        targetUserId={selectedParticipant.userId}
                        targetName={selectedParticipant.name}
                        targetProfilePhoto={selectedParticipant.profilePhoto}
                        targetAccountType={selectedParticipant.accountType}
                        targetVerified={selectedParticipant.verified}
                        onAction={handleHostAction}
                      />
                    )}
                  </Box>

                  {!selectedParticipant.isLocal && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        px: { xs: 1.25, sm: 2 },
                        py: 0.65,
                        borderRadius: '40px',
                        bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                        border: '1px solid',
                        borderColor: 'divider',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                      }}
                    >
                      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                        <VolumeOffIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                        <Slider
                          size="small"
                          value={userVolumes[selectedParticipant.socketId] ?? 50}
                          onChange={(_, v) =>
                            handleVolumeChange(selectedParticipant.socketId, v as number)
                          }
                          sx={{
                            width: { xs: 60, sm: 90 },
                            color: primary,
                            '& .MuiSlider-thumb': { width: 10, height: 10 },
                            '& .MuiSlider-track': { height: 3 },
                            '& .MuiSlider-rail': {
                              height: 3,
                              bgcolor: isDark ? alpha('#fff', 0.14) : alpha('#000', 0.1),
                            },
                          }}
                        />
                        <VolumeUpIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                      </Stack>
                      <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ height: 16, alignSelf: 'center' }}
                      />
                      <CtrlBtn tooltip="React ❤️" onClick={() => handleReaction('❤️')}>
                        <FavoriteIcon sx={{ fontSize: 15 }} />
                      </CtrlBtn>
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
                    </Box>
                  )}
                </Box>
              </Fade>
            )}
          </FeaturedPanel>

          {/* Participants grid */}
          <GridPanel>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.25,
              }}
            >
              <Typography
                variant="caption"
                fontWeight={800}
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.65rem',
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                }}
              >
                {selectedParticipant ? 'Other Participants' : 'All Participants'}
                <Box component="span" sx={{ ml: 0.6, color: 'text.disabled' }}>
                  · {selectedParticipant ? otherParticipants.length : allParticipants.length}
                </Box>
              </Typography>
            </Box>

            <ParticipantsGrid>
              {(selectedParticipant ? otherParticipants : allParticipants).map(
                (participant, index) => (
                  <Zoom key={participant.socketId} in timeout={200 + index * 40}>
                    <Box
                      sx={{
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'transform 0.18s ease',
                        '&:hover': { transform: 'scale(1.04)' },
                        '&:hover .host-btn': { opacity: 1 },
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
                          accountType: participant.accountType,
                          connectionStatus: connectionStatus[participant.socketId],
                          isLocal: participant.isLocal,
                          hasJoin: participant.hasJoin,
                        }}
                        size={isMobile ? 'small' : 'medium'}
                        stream={
                          participant.isLocal ? localStream : remoteStreams[participant.socketId]
                        }
                        onClick={() => setSelectedSocketId(participant.socketId)}
                      />
                      {isHost && !participant.isLocal && (
                        <Box
                          className="host-btn"
                          sx={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            opacity: 0,
                            transition: 'opacity 0.15s',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <HostActionsMenu
                            targetSocketId={participant.socketId}
                            targetUserId={participant.userId}
                            targetName={participant.name}
                            targetProfilePhoto={participant.profilePhoto}
                            targetAccountType={participant.accountType}
                            targetVerified={participant.verified}
                            onAction={handleHostAction}
                          />
                        </Box>
                      )}
                    </Box>
                  </Zoom>
                )
              )}
            </ParticipantsGrid>
          </GridPanel>
        </ContentPad>
      </ScrollArea>

      {/* ── Floating control bar ─────────────────────────────────────────── */}
      <Slide direction="up" in timeout={380}>
        <ControlBar>
          <CtrlBtn
            tooltip={isMicMuted ? 'Unmute' : 'Mute'}
            danger={isMicMuted}
            active={!isMicMuted}
            onClick={handleMicMute}
          >
            {isMicMuted ? <MicOffIcon sx={{ fontSize: 18 }} /> : <MicIcon sx={{ fontSize: 18 }} />}
          </CtrlBtn>

          <Tooltip title="Set status">
            <Box sx={{ display: 'inline-flex' }}>
              <ChatStatusButton onStatusChange={handleToggleUserStatus} />
            </Box>
          </Tooltip>

          <CtrlBtn
            tooltip={isSharing ? 'Stop sharing' : 'Share screen'}
            active={isSharing}
            warn={isSharing}
            onClick={handleToggleScreenShare}
          >
            {isSharing ? (
              <StopIcon sx={{ fontSize: 18 }} />
            ) : (
              <ScreenShareIcon sx={{ fontSize: 18 }} />
            )}
          </CtrlBtn>

          <RaiseHandButton />

          <Divider
            orientation="vertical"
            flexItem
            sx={{
              height: 22,
              alignSelf: 'center',
              mx: 0.25,
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            }}
          />

          {!isMobile && (
            <CtrlBtn tooltip="Room settings">
              <SettingsIcon sx={{ fontSize: 17 }} />
            </CtrlBtn>
          )}

          <CtrlBtn tooltip="Leave room" danger onClick={onLeaveRoom}>
            <ExitToAppIcon sx={{ fontSize: 18 }} />
          </CtrlBtn>
        </ControlBar>
      </Slide>
    </RootContainer>
  );
}

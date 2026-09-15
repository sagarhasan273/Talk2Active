// src/sections/section-voice-room/voice-room-workspace/room-audio-participant-tile.tsx

import { useTracks, useTrackVolume } from '@livekit/components-react';
import {
  alpha,
  Avatar,
  Box,
  keyframes,
  styled,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { Track } from 'livekit-client';
import {
  BadgeCheck,
  CheckCircle,
  CircleOff,
  Clock,
  Crown,
  Hand,
  Moon,
  Pause,
  UserX,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { ChatUserStatus } from 'src/types/type-chat';
import { VoiceSpeakingIndicator } from '../voice-speaking-indicator';
import type { StageParticipant } from './types';

// --- ANIMATIONS ---
const speakingGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 2px rgba(88, 101, 242, 0.6), 0 0 16px rgba(88, 101, 242, 0.25); }
  50% { box-shadow: 0 0 0 3px rgba(88, 101, 242, 1), 0 0 24px rgba(88, 101, 242, 0.5); }
`;

const handWiggle = keyframes`
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(12deg); }
  75% { transform: scale(1.1) rotate(-12deg); }
`;

const popReaction = keyframes`
  0% { transform: scale(0.4) translateY(4px); opacity: 0; }
  20% { transform: scale(1.2) translateY(-2px); opacity: 1; }
  80% { transform: scale(1) translateY(-4px); opacity: 1; }
  100% { transform: scale(0.8) translateY(-10px); opacity: 0; }
`;

// --- STATUS DOT CONFIGURATION ---
const STATUS_OPTIONS: ChatUserStatus[] = [
  {
    name: 'online',
    label: 'Online',
    icon: CheckCircle,
    color: 'success.main',
    bgColor: 'success',
    bgColorChannel: 'mainChannel',
  },
  {
    name: 'busy',
    label: 'Busy',
    icon: Clock,
    color: 'error.light',
    bgColor: 'error',
    bgColorChannel: 'lightChannel',
  },
  {
    name: 'brb',
    label: 'BRB',
    icon: Pause,
    color: 'yellow.main',
    bgColor: 'yellow',
    bgColorChannel: 'mainChannel',
  },
  {
    name: 'afk',
    label: 'AFK',
    icon: UserX,
    color: 'orange.main',
    bgColor: 'orange',
    bgColorChannel: 'mainChannel',
  },
  {
    name: 'zzz',
    label: 'Zzz',
    icon: Moon,
    color: 'stone.main',
    bgColor: 'stone',
    bgColorChannel: 'mainChannel',
  },
  {
    name: 'offline',
    label: 'Offline',
    icon: CircleOff,
    color: 'stone.dark',
    bgColor: 'stone',
    bgColorChannel: 'darkChannel',
  },
];

const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.name, s]));

const StatusDot = styled(Box)<{ status?: string }>(({ theme, status }) => {
  const statusOption = STATUS_MAP[status || 'online'];
  const paletteColor = theme.palette[statusOption?.bgColor as keyof typeof theme.palette];

  return {
    position: 'absolute',
    top: -4,
    left: -4,
    height: 20,
    borderRadius: 10,
    padding: '0px 6px',
    color: '#fff',
    backgroundColor:
      paletteColor && typeof paletteColor === 'object' && 'main' in paletteColor
        ? paletteColor.main
        : theme.palette.success.main,
    border: `2px solid ${theme.palette.background.paper}`,
    zIndex: 15,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease',
    '&:hover': { transform: 'scale(1.1)' },
    '& svg': { width: 12, height: 12, color: '#fff' },
  };
});

// --- CONNECTION OVERLAY ---
const ConnectionOverlay = styled(Box)<{ status: string }>(({ theme, status }) => {
  const colors = {
    connecting: theme.palette.warning.main,
    disconnected: theme.palette.error.main,
    failed: theme.palette.error.dark,
    closed: theme.palette.grey[600],
  };

  return {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: alpha(colors[status as keyof typeof colors] || colors.closed, 0.9),
    backdropFilter: 'blur(4px)',
    color: 'white',
    padding: theme.spacing(0.5, 1.25),
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(0.75),
    border: `1.5px solid ${alpha(theme.palette.common.white, 0.2)}`,
    zIndex: 10,
    animation: 'fadeIn 0.3s ease',
    '@keyframes fadeIn': {
      '0%': { opacity: 0, transform: 'translate(-50%, -40%)' },
      '100%': { opacity: 1, transform: 'translate(-50%, -50%)' },
    },
  };
});

type ParticipantTileProps = {
  participant: StageParticipant & {
    status?: string;
    connectionStatus?: 'connecting' | 'connected' | 'disconnected' | 'failed' | null;
    hasJoin?: boolean;
    isSpeaking?: boolean;
  };
  onClick?: () => void;
};

export const ParticipantTile = ({ participant, onClick }: ParticipantTileProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const {
    name,
    avatarUrl,
    audioState,
    isHost,
    isSelf,
    handRaised,
    verified,
    activeReactionEmoji,
    status,
    connectionStatus = 'connected',
    hasJoin = true,
    isSpeaking: participantIsSpeaking = false,
  } = participant;

  const isMuted = audioState === 'muted';

  // --- LIVEKIT NATIVE VOLUME TRACKING ---
  const audioTracks = useTracks([Track.Source.Microphone]);
  const userTrackRef = useMemo(
    () => audioTracks.find((t) => t.participant.identity === participant.id),
    [audioTracks, participant.id]
  );

  const livekitVolume = useTrackVolume(userTrackRef);

  // Safe null-check for livekitVolume using fallback (?? 0)
  const isSpeaking = (livekitVolume ?? 0) > 0.05 || audioState === 'speaking' || participantIsSpeaking;

  const [showReaction, setShowReaction] = useState(false);

  useEffect(() => {
    if (activeReactionEmoji) {
      setShowReaction(true);
      const timer = setTimeout(() => setShowReaction(false), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [activeReactionEmoji]);

  const initials = name
    ?.split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // --- CONNECTION STATUS RENDERER ---
  const renderConnectionStatus = () => {
    if (!hasJoin) {
      return (
        <ConnectionOverlay status="closed">
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            Voice Closed
          </Typography>
        </ConnectionOverlay>
      );
    }
    if (connectionStatus === 'connecting') {
      return (
        <ConnectionOverlay status="connecting">
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white',
              animation: 'spin 0.8s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            Connecting...
          </Typography>
        </ConnectionOverlay>
      );
    }
    if (connectionStatus === 'disconnected' || connectionStatus === 'failed') {
      return (
        <ConnectionOverlay status="disconnected">
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            Disconnected
          </Typography>
        </ConnectionOverlay>
      );
    }
    return null;
  };

  const connectionOverlayElement = renderConnectionStatus();

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 140,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1.25,
        borderRadius: 1,
        cursor: 'pointer',
        userSelect: 'none',
        outline: 'none',
        overflow: 'hidden',
        boxSizing: 'border-box',
        bgcolor: isDark
          ? alpha(theme.palette.background.paper, 0.85)
          : alpha(theme.palette.common.white, 0.95),
        border: '1.5px solid',
        borderColor: handRaised
          ? theme.palette.warning.main
          : isDark
            ? alpha(theme.palette.common.white, 0.08)
            : alpha(theme.palette.common.black, 0.08),
        transition: 'border-color 0.2s ease, transform 0.15s ease, background-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-0.5px)',
          bgcolor: isDark
            ? alpha(theme.palette.background.paper, 0.98)
            : theme.palette.common.white,
          borderColor: isSpeaking
            ? theme.palette.primary.main
            : alpha(theme.palette.primary.main, 0.4),
        },
        '&:focus-visible': {
          boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
        },
      }}
    >
      {/* 1. AFK / Busy Status Dot */}
      {status && status !== 'online' && (
        <Tooltip title={STATUS_MAP[status]?.label} arrow placement="top">
          <StatusDot status={status}>
            {(() => {
              const IconComponent = STATUS_MAP[status]?.icon;
              return IconComponent ? <IconComponent /> : null;
            })()}
          </StatusDot>
        </Tooltip>
      )}

      {/* 2. Dynamic Reaction Pop */}
      {showReaction && activeReactionEmoji && (
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            right: 8,
            fontSize: 22,
            lineHeight: 1,
            zIndex: 5,
            pointerEvents: 'none',
            animation: `${popReaction} 1.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
        >
          {activeReactionEmoji}
        </Box>
      )}

      {/* 3. Full-Fill Avatar Block */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Avatar
          src={avatarUrl}
          alt={name}
          sx={{
            width: '100%',
            maxWidth: 88,
            aspectRatio: '1/1',
            height: 'auto',
            fontSize: 22,
            fontWeight: 700,
            bgcolor: alpha(theme.palette.primary.main, 0.18),
            color: theme.palette.primary.main,
            borderRadius: '50%',
            border: '2px solid',
            opacity: connectionOverlayElement ? 0.4 : 1, // Dim avatar if disconnected
            filter: connectionOverlayElement ? 'blur(2px) grayscale(50%)' : 'none',
            borderColor: isDark
              ? alpha(theme.palette.common.white, 0.15)
              : alpha(theme.palette.common.black, 0.08),
            transition: 'all 0.3s ease',
          }}
        >
          {initials}
        </Avatar>

        {/* 4. Connection Status Overlay (Connecting/Dropped) */}
        {connectionOverlayElement}

        {/* 5. Floating Host Ribbon/Icon */}
        {isHost && !connectionOverlayElement && (
          <Tooltip title="Host" arrow placement="top">
            <Box
              sx={{
                position: 'absolute',
                top: 4,
                left: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 22,
                height: 22,
                borderRadius: '50%',
                bgcolor: '#F59E0B',
                color: '#FFF',
                boxShadow: '0 2px 6px rgba(245, 158, 11, 0.45)',
                zIndex: 2,
              }}
            >
              <Crown size={12} strokeWidth={2.5} />
            </Box>
          </Tooltip>
        )}

        {/* 6. Hand Raised Floating Badge */}
        {handRaised && !connectionOverlayElement && (
          <Tooltip title="Hand Raised" arrow placement="top">
            <Box
              sx={{
                position: 'absolute',
                top: 4,
                right: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 22,
                height: 22,
                borderRadius: '50%',
                bgcolor: theme.palette.warning.main,
                color: '#FFF',
                boxShadow: `0 2px 6px ${alpha(theme.palette.warning.main, 0.45)}`,
                zIndex: 2,
                animation: `${handWiggle} 1.2s infinite ease-in-out`,
              }}
            >
              <Hand size={12} strokeWidth={2.5} />
            </Box>
          </Tooltip>
        )}

        {/* 7. Minimal Audio / Mute Overlap */}
        {!connectionOverlayElement && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 10,
              left: '70%',
              transform: 'translateX(-50%)',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <VoiceSpeakingIndicator volume={livekitVolume} size="small" isMuted={isMuted} />
          </Box>
        )}
      </Box>

      {/* 8. Dense Bottom Meta Row */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          pt: 0.75,
          px: 0.5,
        }}
      >
        <Typography
          variant="body2"
          fontWeight={700}
          noWrap
          sx={{
            fontSize: '0.8125rem',
            lineHeight: 1.2,
            color: 'text.primary',
            maxWidth: '100%',
            textAlign: 'center',
            opacity: connectionOverlayElement ? 0.6 : 1,
          }}
        >
          {name}
        </Typography>

        {isSelf && (
          <Box
            component="span"
            sx={{
              fontSize: '0.65rem',
              fontWeight: 800,
              lineHeight: 1,
              px: 0.5,
              py: 0.25,
              borderRadius: 0.5,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
              textTransform: 'uppercase',
              flexShrink: 0,
              opacity: connectionOverlayElement ? 0.6 : 1,
            }}
          >
            You
          </Box>
        )}

        {verified && (
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              color: 'info.main',
              flexShrink: 0,
              opacity: connectionOverlayElement ? 0.6 : 1,
            }}
          >
            <BadgeCheck size={14} fill={theme.palette.info.main} color="#fff" />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ParticipantTile;
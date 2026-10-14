// src/sections/section-voice/voice-room-stage/room-stage-participant-tile.tsx

import { useIsSpeaking } from '@livekit/components-react';
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
import { Participant, Track } from 'livekit-client';
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
import React, { useEffect, useMemo, useState } from 'react';

import { useBoolean } from '@/hooks/use-boolean';
import type { ChatUserStatus, ParticipantStageType } from '@/types/type-room';

import { RoomUserControllerMain } from '../voice-room-user-controller';
import DialogRateSpeakingLevel from '../voice-room-user-controller/dialog-rate-speaking-level';
import { VoiceSpeakingIndicator } from '../voice-speaking-indicator';

// --- ANIMATIONS ---
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
  { name: 'online', label: 'Online', icon: CheckCircle, color: 'success.main', bgColor: 'success', bgColorChannel: 'mainChannel' },
  { name: 'busy', label: 'Busy', icon: Clock, color: 'error.light', bgColor: 'error', bgColorChannel: 'lightChannel' },
  { name: 'brb', label: 'BRB', icon: Pause, color: 'yellow.main', bgColor: 'yellow', bgColorChannel: 'mainChannel' },
  { name: 'afk', label: 'AFK', icon: UserX, color: 'orange.main', bgColor: 'orange', bgColorChannel: 'mainChannel' },
  { name: 'zzz', label: 'Zzz', icon: Moon, color: 'stone.main', bgColor: 'stone', bgColorChannel: 'mainChannel' },
  { name: 'offline', label: 'Offline', icon: CircleOff, color: 'stone.dark', bgColor: 'stone', bgColorChannel: 'darkChannel' },
];

const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.name, s]));

const StatusDot = styled(Box)<{ status?: string }>(({ theme, status }) => {
  const statusOption = STATUS_MAP[status || 'online'];
  const paletteColor = theme.palette[statusOption?.bgColor as keyof typeof theme.palette];

  return {
    position: 'absolute',
    bottom: '30%',
    left: 4,
    height: 20,
    borderRadius: 6,
    padding: '0px 6px',
    color: '#fff',
    backgroundColor:
      paletteColor && typeof paletteColor === 'object' && 'main' in paletteColor
        ? paletteColor.main
        : theme.palette.success.main,
    border: `2px solid ${theme.palette.mode === 'dark' ? '#181c26' : '#ffffff'}`,
    zIndex: 15,
    boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease',
    '&:hover': { transform: 'scale(1.08)' },
    '& svg': { width: 11, height: 11, color: '#fff' },
  };
});

const ConnectionOverlay = styled(Box)<{ status: string }>(({ theme, status }) => {
  const colors = {
    connecting: theme.palette.warning.main,
    disconnected: theme.palette.error.main,
    reconnecting: theme.palette.error.light,
    closed: theme.palette.grey[600],
  };

  return {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: alpha(colors[status as keyof typeof colors] || colors.closed, 0.9),
    backdropFilter: 'blur(6px)',
    color: 'white',
    padding: theme.spacing(0.5, 1.25),
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(0.75),
    border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
    zIndex: 10,
    animation: 'fadeIn 0.3s ease',
    '@keyframes fadeIn': {
      '0%': { opacity: 0, transform: 'translate(-50%, -40%)' },
      '100%': { opacity: 1, transform: 'translate(-50%, -50%)' },
    },
  };
});

type ParticipantTileProps = {
  participant: ParticipantStageType;
};

// --------------------------------------------------------------------------
// Subcomponent: LiveKit Audio Monitor (Only mounts when rawParticipant is valid)
// --------------------------------------------------------------------------
interface LiveParticipantAudioProps {
  rawParticipant: Participant;
  participantId: string;
  onSpeakingChange: (speaking: boolean) => void;
}

const LiveParticipantAudio: React.FC<LiveParticipantAudioProps> = ({
  rawParticipant,
  participantId,
  onSpeakingChange,
}) => {
  const isSpeaking = useIsSpeaking(rawParticipant);

  useEffect(() => {
    onSpeakingChange(isSpeaking);
  }, [isSpeaking, onSpeakingChange]);

  const micPub = rawParticipant.getTrackPublication(Track.Source.Microphone);
  const isMuted = !rawParticipant.isMicrophoneEnabled || !micPub || micPub.isMuted;

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 8,
        left: '70%',
        transform: 'translateX(-50%)',
        zIndex: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <VoiceSpeakingIndicator participantId={participantId} isMuted={isMuted} />
    </Box>
  );
};

export const ParticipantTile = React.memo(({ participant }: ParticipantTileProps) => {
  const theme = useTheme();
  const openDrawer = useBoolean();
  const isDark = theme.palette.mode === 'dark';

  const onRateOpen = useBoolean();

  const {
    isSelf,
    handRaised,
    activeReactionEmoji,
    status,
    rawParticipant,
    connectionStatus,
  } = participant;

  // 2. Safe speaking state (never calls useIsSpeaking at top level)
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 3. Transient reaction animation
  const [showReaction, setShowReaction] = useState(false);

  useEffect(() => {
    if (activeReactionEmoji) {
      setShowReaction(true);
      const timer = setTimeout(() => setShowReaction(false), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [activeReactionEmoji]);

  // 4. Initials fallback
  const initials = useMemo(
    () =>
      participant?.name
        ?.split(' ')
        .filter(Boolean)
        .map((p: string) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || '?',
    [participant?.name]
  );

  // 5. Connection Overlay
  const connectionOverlayElement = useMemo(() => {
    switch (connectionStatus) {
      case 'connecting':
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

      case 'reconnecting':
        return (
          <ConnectionOverlay status="reconnecting">
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              Re-connecting
            </Typography>
          </ConnectionOverlay>
        );

      case 'disconnected':
        return (
          <ConnectionOverlay status="disconnected">
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              Disconnected
            </Typography>
          </ConnectionOverlay>
        );

      default:
        return null;
    }
  }, [connectionStatus]);

  return (
    <>
      <Box
        role="button"
        tabIndex={0}
        onClick={openDrawer.onTrue}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openDrawer.onTrue()}
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: 148,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          borderRadius: 1,
          cursor: 'pointer',
          userSelect: 'none',
          outline: 'none',
          overflow: 'hidden',
          boxSizing: 'border-box',
          bgcolor: isDark ? '#181c26' : '#ffffff',
          border: '1.5px solid',
          borderColor: handRaised
            ? theme.palette.warning.main
            : isSpeaking
              ? theme.palette.success.main
              : isDark
                ? alpha('#fff', 0.08)
                : '#e2e8f0',
          boxShadow: isSpeaking
            ? `0 0 16px -2px ${alpha(theme.palette.success.main, 0.35)}`
            : isDark
              ? '0 4px 16px -2px rgba(0, 0, 0, 0.35)'
              : '0 4px 14px -2px rgba(15, 23, 42, 0.05)',
          transition:
            'border-color 0.2s ease, transform 0.18s ease, background-color 0.2s ease, box-shadow 0.2s ease',

          '&:hover': {
            borderColor: handRaised
              ? theme.palette.warning.main
              : isSpeaking
                ? theme.palette.success.main
                : alpha(theme.palette.primary.main, 0.45),
            boxShadow: isDark
              ? '0 10px 24px -4px rgba(0, 0, 0, 0.5)'
              : '0 10px 24px -4px rgba(15, 23, 42, 0.09)',
          },

          '&:focus-visible': {
            boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
          },
        }}
      >
        {/* 1. AFK / Busy Status Dot */}
        {status && !['online', 'offline'].includes(status) && (
          <Tooltip title={STATUS_MAP[status]?.label} arrow placement="top">
            <StatusDot status={status}>
              {(() => {
                const IconComponent = STATUS_MAP[status]?.icon;
                return IconComponent ? <IconComponent /> : null;
              })()}
              <Typography variant="caption" sx={{ ml: 0.5, fontSize: 10, fontWeight: 700 }}>
                {STATUS_MAP[status]?.label}
              </Typography>
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
            src={participant?.profilePhoto}
            alt={participant?.name}
            sx={{
              width: '100%',
              maxWidth: { xs: 72, sm: 88, md: 96 },
              aspectRatio: '1/1',
              height: 'auto',
              fontSize: 22,
              fontWeight: 800,
              bgcolor: isDark
                ? alpha(theme.palette.primary.main, 0.14)
                : alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.main,
              borderRadius: '50%',
              border: '2.5px solid',
              opacity: connectionOverlayElement ? 0.4 : 1,
              filter: connectionOverlayElement ? 'blur(2px) grayscale(50%)' : 'none',
              borderColor: isSpeaking
                ? theme.palette.success.main
                : participant?.isHost
                  ? alpha(theme.palette.primary.main, 0.55)
                  : isDark
                    ? alpha(theme.palette.common.white, 0.12)
                    : '#e2e8f0',
              transition: 'all 0.25s ease',
            }}
          >
            {initials}
          </Avatar>

          {connectionOverlayElement}

          {/* 4. Floating Host Crown */}
          {participant?.isHost && !connectionOverlayElement && (
            <Box
              sx={{
                position: 'absolute',
                top: 2,
                left: 4,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.4,
                height: 20,
                pl: 0.65,
                pr: 0.85,
                borderRadius: 1,
                bgcolor: 'warning.main',
                color: '#000',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                zIndex: 4,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              <Crown size={11} strokeWidth={2.8} style={{ flexShrink: 0 }} />
              <Typography
                component="span"
                sx={{
                  fontSize: '0.6rem',
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Host
              </Typography>
            </Box>
          )}

          {/* 5. Hand Raised Badge */}
          {handRaised && !connectionOverlayElement && (
            <Tooltip title="Hand Raised" arrow placement="top">
              <Box
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: 1,
                  bgcolor: theme.palette.warning.main,
                  color: '#000',
                  boxShadow: `0 2px 8px ${alpha(theme.palette.warning.main, 0.45)}`,
                  zIndex: 2,
                  animation: `${handWiggle} 1.2s infinite ease-in-out`,
                }}
              >
                <Hand size={13} strokeWidth={2.5} />
              </Box>
            </Tooltip>
          )}

          {/* 6. Isolated Audio Indicator - strictly guarded */}
          {!connectionOverlayElement && rawParticipant && (
            <LiveParticipantAudio
              rawParticipant={rawParticipant}
              participantId={String(participant.id)}
              onSpeakingChange={setIsSpeaking}
            />
          )}
        </Box>

        {/* 7. Bottom Meta Row */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            pt: 1,
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
              color: isDark ? 'text.primary' : '#0f172a',
              maxWidth: '100%',
              textAlign: 'center',
              opacity: connectionOverlayElement ? 0.6 : 1,
            }}
          >
            {participant?.name}
          </Typography>

          {isSelf && (
            <Box
              component="span"
              sx={{
                fontSize: '0.625rem',
                fontWeight: 800,
                lineHeight: 1,
                px: 0.6,
                py: 0.25,
                borderRadius: 0.75,
                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.14 : 0.1),
                color: theme.palette.primary.main,
                textTransform: 'uppercase',
                flexShrink: 0,
                opacity: connectionOverlayElement ? 0.6 : 1,
              }}
            >
              You
            </Box>
          )}

          {participant?.verified && (
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

      {/* Profile Modal Drawer */}
      <RoomUserControllerMain
        open={openDrawer.value}
        onClose={openDrawer.onFalse}
        user={participant}
        onRateOpen={onRateOpen}
      />

      {/* Standalone Rating Dialog */}
      <DialogRateSpeakingLevel
        open={onRateOpen.value}
        onClose={() => onRateOpen.onFalse()}
        userId={participant?.userId}
        userName={participant?.name}
      />
    </>
  );
});

export default React.memo(ParticipantTile);

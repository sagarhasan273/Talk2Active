// src/sections/section-voice-room/voice-room-workspace/room-audio-participant-tile.tsx

import { alpha, Avatar, Box, keyframes, Tooltip, Typography, useTheme } from '@mui/material';
import { BadgeCheck, Crown, Hand } from 'lucide-react';

import { VoiceSpeakingIndicator } from '../voice-speaking-indicator';
import type { StageParticipant } from './types';

const speakingGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.8), 0 0 16px rgba(34, 197, 94, 0.35);
  }
  50% {
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 1), 0 0 24px rgba(34, 197, 94, 0.6);
  }
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

type ParticipantTileProps = {
  participant: StageParticipant;
  stream?: MediaStream | null;
  onClick?: () => void;
};

export const ParticipantTile = ({ participant, stream = null, onClick }: ParticipantTileProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { name, avatarUrl, audioState, isHost, isSelf, handRaised, verified, activeReactionEmoji } =
    participant;

  const isSpeaking = audioState === 'speaking';
  const isMuted = audioState === 'muted';

  const initials = name
    ?.split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

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
        borderRadius: 2.5,
        cursor: 'pointer',
        userSelect: 'none',
        outline: 'none',
        overflow: 'hidden',
        boxSizing: 'border-box',
        bgcolor: isDark
          ? alpha(theme.palette.background.paper, 0.85)
          : alpha(theme.palette.common.white, 0.95),
        border: '1.5px solid',
        borderColor: isSpeaking
          ? theme.palette.success.main
          : handRaised
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
            ? theme.palette.success.main
            : alpha(theme.palette.primary.main, 0.4),
        },
        '&:focus-visible': {
          boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
        },
      }}
    >
      {/* Dynamic Reaction Pop */}
      {activeReactionEmoji && (
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            right: 8,
            fontSize: 22,
            lineHeight: 1,
            zIndex: 5,
            pointerEvents: 'none',
            animation: `${popReaction} 1.6s cubic-bezier(0.2, 0.8, 0.2, 1) infinite`,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
        >
          {activeReactionEmoji}
        </Box>
      )}

      {/* Full-Fill Avatar Block */}
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
            borderColor: isSpeaking
              ? theme.palette.success.main
              : isDark
                ? alpha(theme.palette.common.white, 0.15)
                : alpha(theme.palette.common.black, 0.08),
            ...(isSpeaking && {
              animation: `${speakingGlow} 1.4s ease-in-out infinite`,
            }),
          }}
        >
          {initials}
        </Avatar>

        {/* Floating Host Ribbon/Icon */}
        {isHost && (
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

        {/* Hand Raised Floating Badge */}
        {handRaised && (
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

        {/* Minimal Audio / Mute Overlap */}
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
          <VoiceSpeakingIndicator stream={stream} size="small" isMuted={isMuted} />
        </Box>
      </Box>

      {/* Dense Bottom Meta Row */}
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

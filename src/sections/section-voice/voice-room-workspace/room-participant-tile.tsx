import { alpha, Box, keyframes, Typography, useTheme } from '@mui/material';
import { Crown, Mic, MicOff } from 'lucide-react';

import { WaveformIndicator } from './room-audio-waveform-indicator';
import type { StageParticipant } from './types';

// Embedded native keyframe animations
const badgeBounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
`;

const speakingGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(88, 101, 242, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(88, 101, 242, 0); }
`;

const PILL_LABEL: Record<'unmuted' | 'muted' | 'listening', string> = {
  unmuted: 'Mic On',
  muted: 'Muted',
  listening: 'Listening',
};

type ParticipantTileProps = {
  participant: StageParticipant;
};

export const ParticipantTile = ({ participant }: ParticipantTileProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { name, avatarUrl, level, audioState, isHost, isSelf, handRaised } = participant;
  const isSpeaking = audioState === 'speaking';
  const dimmed = (audioState === 'muted' || audioState === 'listening') && !handRaised;

  const subtitle = isSpeaking && isHost ? 'Host • Speaking...' : handRaised ? 'Hand Raised' : level;

  // Dynamic status pill styling derived directly from MUI theme
  const pillStyles = {
    unmuted: {
      color: theme.palette.success.main,
      bgcolor: alpha(theme.palette.success.main, 0.12),
    },
    muted: {
      color: theme.palette.text.secondary,
      bgcolor: alpha(theme.palette.action.disabledBackground, 0.5),
    },
    listening: {
      color: theme.palette.text.secondary,
      bgcolor: alpha(theme.palette.action.disabledBackground, 0.5),
    },
  };

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        borderRadius: 3,
        bgcolor: isDark ? 'background.paper' : 'background.neutral',
        border: '1px solid',
        borderColor: isSpeaking
          ? alpha(theme.palette.primary.main, 0.6)
          : handRaised
            ? alpha(theme.palette.warning.main, 0.4)
            : 'divider',
        boxShadow: isSpeaking ? `0 10px 25px ${alpha(theme.palette.primary.main, 0.15)}` : 'none',
        opacity: dimmed ? 0.85 : 1,
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Box
          component="img"
          src={avatarUrl}
          alt={name}
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            objectFit: 'cover',
            boxSizing: 'content-box',
            border: '4px solid',
            borderColor: isSpeaking
              ? theme.palette.primary.main
              : handRaised
                ? theme.palette.warning.main
                : theme.palette.divider,
            ...(isSpeaking && {
              animation: `${speakingGlow} 1.6s infinite`,
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }),
          }}
        />

        {isHost && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              display: 'flex',
              p: 0.5,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.9),
              color: '#fff',
              boxShadow: 1,
            }}
            title="Host"
          >
            <Crown size={14} />
          </Box>
        )}

        {handRaised ? (
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: theme.palette.warning.main,
              color: theme.palette.common.black,
              fontSize: 13,
              fontWeight: 700,
              boxShadow: 1,
              animation: `${badgeBounce} 1s infinite`,
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
            title="Wants to speak"
          >
            ✋
          </Box>
        ) : (
          audioState === 'muted' && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                display: 'flex',
                p: 0.5,
                borderRadius: '50%',
                bgcolor: 'background.paper',
                color: theme.palette.error.main,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <MicOff size={14} />
            </Box>
          )
        )}
      </Box>

      <Typography
        variant="body2"
        fontWeight={600}
        noWrap
        sx={{ color: 'text.primary', mt: 1.5, maxWidth: '100%' }}
      >
        {name}
        {isSelf && ' (You)'}
      </Typography>

      <Typography
        variant="caption"
        noWrap
        sx={{
          fontSize: 10,
          fontWeight: handRaised ? 600 : 400,
          color: handRaised ? 'warning.main' : 'text.secondary',
        }}
      >
        {subtitle}
      </Typography>

      {audioState === 'speaking' ? (
        <WaveformIndicator />
      ) : (
        <Box
          sx={{
            mt: 1,
            px: 1,
            py: 0.25,
            borderRadius: 5,
            fontSize: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            ...pillStyles[audioState],
          }}
        >
          {audioState === 'unmuted' && <Mic size={11} />}
          {PILL_LABEL[audioState]}
        </Box>
      )}
    </Box>
  );
};

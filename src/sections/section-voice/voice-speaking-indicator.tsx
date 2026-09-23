import { useTracks, useTrackVolume } from '@livekit/components-react';
import MicOffIcon from '@mui/icons-material/MicOff';
import { Box, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { Track } from 'livekit-client';
import React, { useMemo } from 'react';

type VoiceSpeakingIndicatorProps = {
  participantId?: string;
  volume?: number; // Optional external fallback
  size?: 'small' | 'medium' | 'large';
  isMuted: boolean;
};

export const VoiceSpeakingIndicator = React.memo(function VoiceSpeakingIndicator({
  participantId,
  volume: externalVolume,
  size = 'small',
  isMuted = false,
}: VoiceSpeakingIndicatorProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 1. Subscribe to LiveKit audio tracks inside this isolated leaf component
  const audioTracks = useTracks([Track.Source.Microphone]);

  const userTrackRef = useMemo(
    () => (participantId ? audioTracks.find((t) => t.participant.identity === participantId) : undefined),
    [audioTracks, participantId]
  );

  // 2. High-frequency volume hook runs ONLY inside this component
  const trackedVolume = useTrackVolume(userTrackRef);

  // Prioritize internal tracked volume; fallback to external volume or 0
  const activeVolume = !isMuted ? (trackedVolume ?? externalVolume ?? 0) : 0;

  // 3. Normalize scale (0.0 - 1.0) to 0-5 bars
  const normalizedVolume = Math.min(Math.max(activeVolume, 0), 1);
  const bars = Math.ceil(normalizedVolume * 5);
  const isTalking = normalizedVolume > 0.05;

  const selectedSize = {
    small: {
      top: 'calc(100% - 8px)',
      left: '100%',
    },
    medium: {
      top: 'calc(100% - 5px)',
      left: 'calc(100% - 5px)',
    },
    large: {
      top: 'calc(100% - 12px)',
      left: 'calc(100% - 5px)',
    },
  }[size];

  return (
    <Box
      sx={{
        position: 'absolute',
        ...selectedSize,
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      {isMuted ? (
        <Tooltip title="Muted" arrow placement="top">
          <Box
            sx={{
              pointerEvents: 'auto',
              bgcolor: '#f44336',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 0.5,
              borderRadius: '50%',
              width: isMobile ? 24 : 28,
              height: isMobile ? 24 : 28,
              border: `2px solid ${theme.palette.background.paper}`,
              boxShadow: theme.shadows[2],
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.7)' },
                '70%': { boxShadow: '0 0 0 6px rgba(244, 67, 54, 0)' },
                '100%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)' },
              },
            }}
          >
            <MicOffIcon
              sx={{
                fontSize: isMobile ? 14 : 18,
                color: '#fff',
              }}
            />
          </Box>
        </Tooltip>
      ) : (
        <Box
          sx={{
            display: 'flex',
            gap: '2px',
            alignItems: 'flex-end',
            height: 16,
            px: 0.5,
            py: 0.25,
            borderRadius: 0.5,
            bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(252, 248, 248, 0.14)',
            backdropFilter: 'blur(2px)',
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => {
            const barHeight = i * (size === 'small' ? 2.2 : size === 'medium' ? 2.6 : 3);
            const isActive = i <= bars;

            return (
              <Box
                key={i}
                sx={{
                  width: size === 'small' ? 2.5 : 3,
                  height: isActive ? `${barHeight}px` : '3px',
                  borderRadius: '2px',
                  bgcolor: isActive
                    ? isTalking
                      ? '#22c55e' // Green when actively talking
                      : '#5865f2' // Blue idle/ambient
                    : alphaBoxColor(theme.palette.mode === 'dark'),
                  transition: 'height 80ms ease, background-color 120ms ease',
                }}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
});

// Helper for inactive bar color
function alphaBoxColor(isDark: boolean) {
  return isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)';
}
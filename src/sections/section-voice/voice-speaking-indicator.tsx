import { useTracks, useTrackVolume } from '@livekit/components-react';
import MicOffIcon from '@mui/icons-material/MicOff';
import { alpha, Box, Tooltip, useTheme } from '@mui/material';
import { Track } from 'livekit-client';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type VoiceSpeakingIndicatorProps = {
  participantId?: string;
  volume?: number;
  isMuted: boolean;
};

export const VoiceSpeakingIndicator = React.memo(function VoiceSpeakingIndicator({
  participantId,
  volume: externalVolume,
  isMuted = false,
}: VoiceSpeakingIndicatorProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // 1. Audio Track reference
  const audioTracks = useTracks([Track.Source.Microphone]);
  const userTrackRef = useMemo(
    () => (participantId ? audioTracks.find((t) => t.participant.identity === participantId) : undefined),
    [audioTracks, participantId]
  );

  // 2. Raw volume reading
  const trackedVolume = useTrackVolume(userTrackRef);
  const rawVolume = !isMuted ? (trackedVolume ?? externalVolume ?? 0) : 0;

  // 3. Audio smoothing state (Exponential Moving Average / Attack & Decay)
  const smoothedVolumeRef = useRef(0);
  const [smoothedVolume, setSmoothedVolume] = useState(0);

  useEffect(() => {
    const target = isMuted ? 0 : rawVolume;

    // Fast Attack (0.75) for instant rise from zero, Smooth Decay (0.22) to avoid jitter
    const smoothingFactor = target > smoothedVolumeRef.current ? 0.75 : 0.22;

    smoothedVolumeRef.current =
      smoothedVolumeRef.current + (target - smoothedVolumeRef.current) * smoothingFactor;

    // Zero out noise floor
    if (smoothedVolumeRef.current < 0.008) {
      smoothedVolumeRef.current = 0;
    }

    setSmoothedVolume(smoothedVolumeRef.current);
  }, [rawVolume, isMuted]);

  // Speaking state
  const isTalking = smoothedVolume > 0.01;

  // Proportional scale factor
  const clampedScale = Math.min(Math.pow(smoothedVolume * 2.2, 0.8), 1);

  // 4. Heights: 0px at idle, jumping up into staggered heights (up to 14px) when speaking
  const h1 = isTalking ? Math.max(3, Math.round(clampedScale * 9)) : 0;   // Left
  const h2 = isTalking ? Math.max(5, Math.round(clampedScale * 14)) : 0;  // Center
  const h3 = isTalking ? Math.max(3, Math.round(clampedScale * 8)) : 0;   // Right

  // --- Dynamic Glow Calculations ---
  // Spread expands between 8px and 16px as you speak louder
  const glowSpread = Math.round(8 + clampedScale * 8);
  const glowAlpha = isDark ? 0.45 + clampedScale * 0.35 : 0.3 + clampedScale * 0.25;

  const talkingBorderGlow = isDark
    ? `0 0 ${glowSpread}px ${alpha('#10B981', glowAlpha)}, inset 0 0 6px ${alpha('#34D399', 0.35)}`
    : `0 0 ${glowSpread}px ${alpha('#10B981', glowAlpha)}, 0 2px 8px rgba(16, 185, 129, 0.25)`;

  // --- Theme Mode Color Palette ---
  const colors = {
    containerBg: isMuted
      ? isDark
        ? alpha('#EF4444', 0.2)
        : '#FEE2E2'
      : isTalking
        ? isDark
          ? alpha('#10B981', 0.25)
          : '#ECFDF5'
        : isDark
          ? alpha('#1E293B', 0.9)
          : '#FFFFFF',

    border: isMuted
      ? isDark
        ? '#EF4444'
        : '#F87171'
      : isTalking
        ? isDark
          ? '#34D399' // Bright emerald border
          : '#10B981'
        : isDark
          ? alpha('#FFFFFF', 0.15)
          : alpha('#0F172A', 0.12),

    activeForeground: isDark ? '#34D399' : '#059669',
    mutedIcon: isDark ? '#F87171' : '#DC2626',
    idleBars: isDark ? alpha('#94A3B8', 0.45) : alpha('#64748B', 0.45),

    shadow: isDark
      ? '0 2px 8px rgba(0, 0, 0, 0.6)'
      : '0 2px 6px rgba(15, 23, 42, 0.08)',
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 24,
        height: 22,
        px: isMuted ? '5px' : '6px',
        borderRadius: '12px',
        bgcolor: colors.containerBg,
        border: '1.5px solid',
        borderColor: colors.border,
        boxShadow: isTalking
          ? `${colors.shadow}, ${talkingBorderGlow}`
          : colors.shadow,
        backdropFilter: 'blur(8px)',
        transition: 'border-color 0.12s ease, box-shadow 0.1s ease, background-color 0.18s ease',
        pointerEvents: 'auto',
      }}
    >
      {isMuted ? (
        <Tooltip title="Microphone Muted" arrow placement="top">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MicOffIcon sx={{ fontSize: 13, color: colors.mutedIcon }} />
          </Box>
        </Tooltip>
      ) : (
        <Tooltip title={isTalking ? 'Talking' : 'Mic Connected'} arrow placement="top">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              height: 14,
            }}
          >
            {[h1, h2, h3].map((height, i) => (
              <Box
                key={i}
                sx={{
                  width: 2.5,
                  height: `${height}px`,
                  minHeight: isTalking ? undefined : '0px',
                  borderRadius: '1px',
                  bgcolor: isTalking ? colors.activeForeground : colors.idleBars,
                  transition: 'height 90ms cubic-bezier(0.1, 0.9, 0.3, 1), background-color 150ms ease',
                }}
              />
            ))}
          </Box>
        </Tooltip>
      )}
    </Box>
  );
});

export default VoiceSpeakingIndicator;

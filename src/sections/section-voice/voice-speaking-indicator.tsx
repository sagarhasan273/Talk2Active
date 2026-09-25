import {
  useTracks,
  useTrackVolume,
} from '@livekit/components-react';

import MicOffIcon from '@mui/icons-material/MicOff';

import {
  alpha,
  Box,
  Tooltip,
  useTheme,
} from '@mui/material';

import { Track } from 'livekit-client';

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

type IndicatorSize = 'small' | 'medium' | 'large';

type VoiceSpeakingIndicatorProps = {
  participantId?: string;
  volume?: number;
  isMuted: boolean;
  size?: IndicatorSize;
};

// ----------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------

const GREEN = '#10B981';
const GREEN_BRIGHT = '#34D399';
const GREEN_DARK = '#059669';
const GREEN_PALE = '#6EE7B7';

const NOISE_FLOOR = 0.008;
const TALKING_THRESHOLD = 0.01;

// Bars stay at their minimum height for anything quieter than
// RISE_START (soft/background speech), then ramp up to full
// height by RISE_FULL (a clear mid-to-loud voice). This keeps
// the waveform calm for quiet talkers and only makes it "pop"
// for a proper mid-to-high volume voice.
const RISE_START = 0.15;
const RISE_FULL = 0.55;

const ATTACK_FACTOR = 0.75;
const DECAY_FACTOR = 0.22;

// Relative heights for a 5-bar waveform, tallest in the center.
// [outer, inner, center, inner, outer]
const BAR_WEIGHTS = [0.45, 0.75, 1, 0.75, 0.45];

// Small per-bar phase offsets so bars don't all move in lockstep,
// which reads as more organic / voice-like.
const BAR_PHASE = [0, 0.12, 0, 0.12, 0.05];

// Every size-dependent dimension in one place, keyed by size prop.
const SIZE_CONFIG: Record<
  IndicatorSize,
  {
    minWidth: number;
    height: number;
    paddingX: string;
    paddingXMuted: string;
    borderRadius: string;
    barWidth: number;
    barGap: string;
    barAreaHeight: number;
    barMinPx: number[];
    barMaxPx: number[];
    iconFontSize: number;
    borderWidth: string;
  }
> = {
  small: {
    minWidth: 18,
    height: 16,
    paddingX: '5px',
    paddingXMuted: '4px',
    borderRadius: '9px',
    barWidth: 2,
    barGap: '2px',
    barAreaHeight: 11,
    barMinPx: [1, 2, 2, 2, 1],
    barMaxPx: [4, 7, 10, 7, 4],
    iconFontSize: 10,
    borderWidth: '1.25px',
  },
  medium: {
    minWidth: 20,
    height: 18,
    paddingX: '7px',
    paddingXMuted: '5px',
    borderRadius: '12px',
    barWidth: 2.5,
    barGap: '2.5px',
    barAreaHeight: 15,
    barMinPx: [1, 2, 2.5, 2, 1],
    barMaxPx: [5, 9, 13, 9, 5],
    iconFontSize: 13,
    borderWidth: '1.5px',
  },
  large: {
    minWidth: 32,
    height: 28,
    paddingX: '9px',
    paddingXMuted: '7px',
    borderRadius: '15px',
    barWidth: 3,
    barGap: '3px',
    barAreaHeight: 19,
    barMinPx: [3, 4, 4, 4, 3],
    barMaxPx: [9, 14, 19, 14, 9],
    iconFontSize: 16,
    borderWidth: '1.75px',
  },
};

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------

export const VoiceSpeakingIndicator = React.memo(
  function VoiceSpeakingIndicator({
    participantId,
    volume: externalVolume = 0,
    isMuted = false,
    size = 'medium',
  }: VoiceSpeakingIndicatorProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const cfg = SIZE_CONFIG[size];

    // ---------------------------------------------------------------
    // 1. Find microphone track
    // ---------------------------------------------------------------

    const audioTracks = useTracks([
      Track.Source.Microphone,
    ]);

    const userTrackRef = useMemo(
      () =>
        participantId
          ? audioTracks.find(
            (track) =>
              track.participant.identity === participantId
          )
          : undefined,
      [audioTracks, participantId]
    );

    // ---------------------------------------------------------------
    // 2. Read audio volume
    // ---------------------------------------------------------------

    const trackedVolume = useTrackVolume(userTrackRef);

    const rawVolume = isMuted
      ? 0
      : Math.max(
        trackedVolume ?? 0,
        externalVolume ?? 0
      );

    // ---------------------------------------------------------------
    // 3. Continuous smoothing
    //
    // Fast attack:
    //   voice starts -> bars react immediately
    //
    // Slow decay:
    //   voice stops -> bars fall smoothly
    // ---------------------------------------------------------------

    const [smoothedVolume, setSmoothedVolume] =
      useState(0);

    const smoothedVolumeRef = useRef(0);
    const targetVolumeRef = useRef(0);
    const timeRef = useRef(0);
    const [wavePhase, setWavePhase] = useState(0);

    targetVolumeRef.current = isMuted
      ? 0
      : rawVolume;

    useEffect(() => {
      let animationFrame = 0;
      let lastTime = performance.now();

      const animate = (time: number) => {
        const delta = time - lastTime;

        // Around 30 FPS is enough for a tiny voice indicator.
        if (delta >= 30) {
          lastTime = time;
          timeRef.current += delta;

          const current =
            smoothedVolumeRef.current;

          const target =
            targetVolumeRef.current;

          const factor =
            target > current
              ? ATTACK_FACTOR
              : DECAY_FACTOR;

          let next =
            current +
            (target - current) * factor;

          // Remove tiny microphone noise.
          if (next < NOISE_FLOOR) {
            next = 0;
          }

          smoothedVolumeRef.current = next;

          setSmoothedVolume(next);
          setWavePhase(timeRef.current / 1000);
        }

        animationFrame =
          requestAnimationFrame(animate);
      };

      animationFrame =
        requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }, []);

    // ---------------------------------------------------------------
    // 4. Speaking state
    // ---------------------------------------------------------------

    const isTalking =
      !isMuted &&
      smoothedVolume > TALKING_THRESHOLD;

    // ---------------------------------------------------------------
    // 5. Volume -> visual scale
    //
    // Quiet speech (below RISE_START) barely moves the bars; the
    // waveform only grows once volume climbs into the mid-to-high
    // range, reaching full height by RISE_FULL.
    // ---------------------------------------------------------------

    const normalizedVolume = Math.min(
      Math.max(
        (smoothedVolume - RISE_START) /
        (RISE_FULL - RISE_START),
        0
      ),
      1
    );

    const clampedScale = Math.pow(normalizedVolume, 0.9);

    // ---------------------------------------------------------------
    // 6. Five-bar waveform, each with a light idle wobble layered
    //    on top of the shared volume envelope so the whole shape
    //    breathes rather than snapping in unison.
    //
    //     │ │
    //   │ │ │ │ │
    //     │ │
    //
    // ---------------------------------------------------------------

    const bars = useMemo(() => {
      if (!isTalking) {
        return cfg.barMinPx.map(() => 0);
      }

      return BAR_WEIGHTS.map((weight, index) => {
        const wobble =
          0.9 +
          0.1 *
          Math.sin(
            wavePhase * 6 + BAR_PHASE[index] * Math.PI * 2
          );

        const target =
          cfg.barMinPx[index] +
          (cfg.barMaxPx[index] - cfg.barMinPx[index]) *
          clampedScale *
          weight *
          wobble;

        return Math.max(
          cfg.barMinPx[index],
          Math.round(target)
        );
      });
    }, [isTalking, clampedScale, wavePhase, cfg]);

    // ---------------------------------------------------------------
    // 7. Glow — gentle breathing intensity while talking
    // ---------------------------------------------------------------

    const breathe =
      0.85 + 0.15 * Math.sin(wavePhase * 3);

    const glowSpread = Math.round(
      7 + clampedScale * 9 * breathe
    );

    const glowAlpha =
      (isDark
        ? 0.4 + clampedScale * 0.35
        : 0.28 + clampedScale * 0.25) * breathe;

    const talkingBorderGlow = isDark
      ? [
        `0 0 ${glowSpread}px ${alpha(
          GREEN,
          glowAlpha
        )}`,
        `0 0 ${Math.round(glowSpread * 2)}px ${alpha(
          GREEN,
          glowAlpha * 0.35
        )}`,
        `inset 0 0 6px ${alpha(
          GREEN_BRIGHT,
          0.35
        )}`,
      ].join(', ')
      : [
        `0 0 ${glowSpread}px ${alpha(
          GREEN,
          glowAlpha
        )}`,
        `0 2px 8px ${alpha(
          GREEN,
          0.25
        )}`,
      ].join(', ');

    // ---------------------------------------------------------------
    // 8. Colors
    // ---------------------------------------------------------------

    const colors = {
      containerBg: isMuted
        ? isDark
          ? alpha('#EF4444', 0.2)
          : '#FEE2E2'
        : isTalking
          ? isDark
            ? `linear-gradient(180deg, ${alpha(GREEN, 0.28)}, ${alpha(GREEN_DARK, 0.18)})`
            : `linear-gradient(180deg, #ECFDF5, #E0FBF0)`
          : isDark
            ? alpha('#1E293B', 0.9)
            : '#FFFFFF',

      border: isMuted
        ? isDark
          ? '#EF4444'
          : '#F87171'
        : isTalking
          ? isDark
            ? GREEN_BRIGHT
            : GREEN
          : isDark
            ? alpha('#FFFFFF', 0.15)
            : alpha('#0F172A', 0.12),

      barGradient: isDark
        ? `linear-gradient(180deg, ${GREEN_PALE}, ${GREEN_BRIGHT} 55%, ${GREEN_DARK})`
        : `linear-gradient(180deg, ${GREEN_BRIGHT}, ${GREEN} 60%, ${GREEN_DARK})`,

      mutedIcon: isDark
        ? '#F87171'
        : '#DC2626',

      idleBars: isDark
        ? alpha('#94A3B8', 0.45)
        : alpha('#64748B', 0.4),

      shadow: isDark
        ? '0 2px 8px rgba(0, 0, 0, 0.6)'
        : '0 2px 6px rgba(15, 23, 42, 0.08)',
    };

    // ---------------------------------------------------------------
    // 9. Tooltip
    // ---------------------------------------------------------------

    const tooltipText = isMuted
      ? 'Microphone Muted'
      : isTalking
        ? 'Talking'
        : 'Mic Connected';

    // ---------------------------------------------------------------
    // 10. Render
    // ---------------------------------------------------------------

    return (
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',

          minWidth: cfg.minWidth,
          height: cfg.height,

          px: isMuted ? cfg.paddingXMuted : cfg.paddingX,

          borderRadius: cfg.borderRadius,

          background: colors.containerBg,

          border: `${cfg.borderWidth} solid`,
          borderColor: colors.border,

          boxShadow: isTalking
            ? `${colors.shadow}, ${talkingBorderGlow}`
            : colors.shadow,

          backdropFilter: 'blur(8px)',

          transform: isTalking ? 'scale(1)' : 'scale(0.97)',

          transition:
            'border-color 150ms ease, ' +
            'box-shadow 120ms ease, ' +
            'background 220ms ease, ' +
            'transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1)',

          pointerEvents: 'auto',

          flexShrink: 0,

          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
            transform: 'none',
          },
        }}
      >
        {/* Soft pulsing ring behind the muted icon, echoing the
            talking glow so the muted state doesn't feel inert. */}
        {isMuted && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: cfg.borderRadius,
              boxShadow: `0 0 0 0 ${alpha('#EF4444', 0.4)}`,
              animation: 'voiceMutedPulse 2.2s ease-out infinite',
              pointerEvents: 'none',
              '@keyframes voiceMutedPulse': {
                '0%': {
                  boxShadow: `0 0 0 0 ${alpha('#EF4444', 0.35)}`,
                },
                '70%': {
                  boxShadow: `0 0 0 6px ${alpha('#EF4444', 0)}`,
                },
                '100%': {
                  boxShadow: `0 0 0 0 ${alpha('#EF4444', 0)}`,
                },
              },
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
              },
            }}
          />
        )}

        {isMuted ? (
          <Tooltip
            title="Microphone Muted"
            arrow
            placement="top"
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 0,
              }}
            >
              <MicOffIcon
                sx={{
                  fontSize: cfg.iconFontSize,
                  color: colors.mutedIcon,
                }}
              />
            </Box>
          </Tooltip>
        ) : (
          <Tooltip
            title={tooltipText}
            arrow
            placement="top"
            disableInteractive
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',

                gap: cfg.barGap,

                height: cfg.barAreaHeight,

                // Keeps the bars centered.
                justifyContent: 'center',
              }}
            >
              {bars.map((height, index) => (
                <Box
                  key={index}
                  sx={{
                    width: cfg.barWidth,

                    height: `${height}px`,

                    minHeight: '1.5px',

                    borderRadius: '1.5px',

                    background: isTalking
                      ? colors.barGradient
                      : colors.idleBars,

                    boxShadow: isTalking
                      ? `0 0 4px ${alpha(GREEN_BRIGHT, 0.5)}`
                      : 'none',

                    transition:
                      'height 110ms cubic-bezier(0.16, 1, 0.3, 1), ' +
                      'background 150ms ease, ' +
                      'box-shadow 150ms ease',

                    transformOrigin: 'center',
                  }}
                />
              ))}
            </Box>
          </Tooltip>
        )}
      </Box>
    );
  }
);

VoiceSpeakingIndicator.displayName =
  'VoiceSpeakingIndicator';

export default VoiceSpeakingIndicator;

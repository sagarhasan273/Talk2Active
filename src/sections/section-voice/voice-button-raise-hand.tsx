// src/sections/section-voice/voice-button-raise-hand.tsx

import React, { useEffect, useRef, useState } from 'react';

import Hand from '@mui/icons-material/WavingHandRounded';
import { alpha, Box, IconButton, keyframes, Popover, Tooltip, useTheme } from '@mui/material';

// ── Keyframe Animations ───────────────────────────────────────────────────────

const waveAnimation = keyframes`
  0% { transform: rotate(-15deg); }
  100% { transform: rotate(15deg); }
`;

const emojiPopAnimation = keyframes`
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

// ── Emoji Preset Map ──────────────────────────────────────────────────────────

export const HAND_EMOJIS = {
  raised: { emoji: '✋', label: 'Raised Hand' },
  wave: { emoji: '👋', label: 'Wave' },
  open: { emoji: '🤚', label: 'Open Hand' },
  victory: { emoji: '✌️', label: 'Victory' },
  fingersCrossed: { emoji: '🤞', label: 'Fingers Crossed' },
  ok: { emoji: '👌', label: 'OK' },
  peace: { emoji: '☮️', label: 'Peace' },
  celebration: { emoji: '🙌', label: 'Celebration' },
} as const;

export type HandEmojiKey = keyof typeof HAND_EMOJIS;

type VoiceButtonRaiseHandProps = {
  isRaised?: boolean;
  raiseHand?: boolean; // backwards compatibility alias
  selectedEmoji?: string;
  onToggle?: () => void;
  onClick?: () => void; // backwards compatibility alias
  onEmojiChange?: (emoji: string) => void;
  handBtnRef?: React.RefObject<HTMLButtonElement>;
};

export const VoiceButtonRaiseHand = ({
  isRaised,
  raiseHand = false,
  selectedEmoji = HAND_EMOJIS.raised.emoji,
  onToggle,
  onClick,
  onEmojiChange,
  handBtnRef,
}: VoiceButtonRaiseHandProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const internalRef = useRef<HTMLButtonElement>(null);
  const buttonRef = handBtnRef ?? internalRef;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [displayEmoji, setDisplayEmoji] = useState<string | null>(null);

  const emojiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Normalize raised state and toggle handler
  const handIsActive = isRaised !== undefined ? isRaised : raiseHand;
  const triggerToggle = onToggle || onClick;

  const popupOpen = Boolean(anchorEl);

  useEffect(
    () => () => {
      if (emojiTimeoutRef.current) {
        clearTimeout(emojiTimeoutRef.current);
      }
    },
    []
  );

  const handleButtonClick = () => {
    if (handIsActive) {
      triggerToggle?.();
      setDisplayEmoji(null);

      if (emojiTimeoutRef.current) {
        clearTimeout(emojiTimeoutRef.current);
        emojiTimeoutRef.current = null;
      }
      return;
    }

    setAnchorEl(buttonRef.current);
  };

  const handleEmojiSelect = (emoji: string) => {
    onEmojiChange?.(emoji);
    setDisplayEmoji(emoji);
    setAnchorEl(null);

    if (emojiTimeoutRef.current) {
      clearTimeout(emojiTimeoutRef.current);
    }

    emojiTimeoutRef.current = setTimeout(() => {
      setDisplayEmoji(null);
      emojiTimeoutRef.current = null;
    }, 10_000);

    if (!handIsActive) {
      triggerToggle?.();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title={handIsActive ? `Lower hand (${selectedEmoji})` : 'Raise hand'} arrow>
        <IconButton
          ref={buttonRef}
          size="small"
          onClick={handleButtonClick}
          sx={{
            p: 1,
            width: 34,
            height: 34,
            borderRadius: 0.5,
            bgcolor: handIsActive
              ? alpha(theme.palette.warning.main, 0.16)
              : isDark
                ? alpha('#fff', 0.04)
                : '#f8fafc',
            border: '1px solid',
            borderColor: handIsActive
              ? alpha(theme.palette.warning.main, 0.45)
              : isDark
                ? alpha('#fff', 0.08)
                : '#e2e8f0',
            color: handIsActive ? 'warning.main' : isDark ? 'text.primary' : '#334155',
            transition: 'all 0.18s ease',
            '&:hover': {
              color: handIsActive ? 'warning.main' : 'primary.main',
              borderColor: handIsActive
                ? 'warning.main'
                : alpha(theme.palette.primary.main, 0.4),
              bgcolor: handIsActive
                ? alpha(theme.palette.warning.main, 0.24)
                : alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          {displayEmoji ? (
            <Box
              component="span"
              sx={{
                fontSize: '1.2rem',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: `${emojiPopAnimation} 0.2s ease-out`,
              }}
            >
              {displayEmoji}
            </Box>
          ) : (
            <Hand
              sx={{
                fontSize: '1rem',
                animation: handIsActive ? `${waveAnimation} 0.5s ease infinite alternate` : 'none',
              }}
            />
          )}
        </IconButton>
      </Tooltip>

      <Popover
        open={popupOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: -1,
              p: 1,
              borderRadius: 0.5,
              minWidth: 190,
              maxWidth: 230,
              bgcolor: isDark ? '#181c26' : '#ffffff',
              border: '1px solid',
              borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
              boxShadow: isDark
                ? '0 12px 28px rgba(0, 0, 0, 0.55)'
                : '0 12px 28px rgba(15, 23, 42, 0.14)',
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 0.5,
          }}
        >
          {Object.entries(HAND_EMOJIS).map(([key, hand]) => {
            const isSelected = selectedEmoji === hand.emoji;

            return (
              <Tooltip key={key} title={hand.label} arrow placement="top">
                <Box
                  component="button"
                  type="button"
                  onClick={() => handleEmojiSelect(hand.emoji)}
                  sx={{
                    border: '1px solid',
                    borderColor: isSelected
                      ? alpha(theme.palette.warning.main, 0.45)
                      : 'transparent',
                    outline: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 0.5,
                    fontSize: '1.3rem',
                    bgcolor: isSelected
                      ? alpha(theme.palette.warning.main, 0.16)
                      : 'transparent',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: isDark ? alpha('#fff', 0.06) : '#f8fafc',
                      transform: 'scale(1.08)',
                    },
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                  }}
                >
                  {hand.emoji}
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </Popover>
    </>
  );
};

export default VoiceButtonRaiseHand;

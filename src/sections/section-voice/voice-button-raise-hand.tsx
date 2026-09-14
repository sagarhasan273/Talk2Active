import { varAlpha } from '@/theme/styles';
import React, { useEffect, useRef, useState } from 'react';

import Hand from '@mui/icons-material/WavingHandRounded';
import { Box, IconButton, keyframes, Popover, Tooltip, useTheme } from '@mui/material';

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

  const isLight = theme.palette.mode === 'light';
  const primaryMainChannel =
    theme.vars?.palette?.primary?.mainChannel || theme.palette.primary.main;

  return (
    <>
      <Tooltip title={handIsActive ? `Lower hand (${selectedEmoji})` : 'Raise hand'} arrow>
        <IconButton
          ref={buttonRef}
          size="small"
          onClick={handleButtonClick}
          sx={{
            p: 1,
            width: 32,
            height: 32,
            borderRadius: 1,
            bgcolor: handIsActive ? 'warning.lighter' : 'background.paper',
            border: '1px solid',
            borderColor: handIsActive ? 'warning.main' : 'transparent',
            color: handIsActive ? 'warning.dark' : 'text.primary',
            '&:hover': {
              color: isLight ? 'common.black' : 'common.white',
              bgcolor: handIsActive ? 'warning.light' : varAlpha(primaryMainChannel, 0.15),
            },
          }}
        >
          {displayEmoji ? (
            <Box
              component="span"
              sx={{
                fontSize: '1.25rem',
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
              p: 1.25,
              borderRadius: 2,
              minWidth: 190,
              maxWidth: 230,
              bgcolor: 'background.paper',
              boxShadow: theme.shadows[8],
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
                    border: 'none',
                    outline: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    fontSize: '1.35rem',
                    bgcolor: isSelected ? 'rgba(249, 202, 36, 0.18)' : 'transparent',
                    boxShadow: isSelected ? 'inset 0 0 0 1px rgba(249, 202, 36, 0.35)' : 'none',
                    transition: 'background-color 0.15s ease, transform 0.15s ease',
                    '&:hover': {
                      bgcolor: 'rgba(249, 202, 36, 0.14)',
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

import React, { useRef, useState, useEffect } from 'react';

import Hand from '@mui/icons-material/WavingHandRounded';
import { Box, Popover, Tooltip, IconButton } from '@mui/material';

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

type VoiceRaiseHandButtonProps = {
  raiseHand?: boolean;
  selectedEmoji?: string;
  onToggle?: () => void;
  onEmojiChange?: (emoji: string) => void;
  handBtnRef?: React.RefObject<HTMLButtonElement>;
};

export const VoiceRaiseHandButton = ({
  raiseHand = false,
  selectedEmoji = HAND_EMOJIS.raised.emoji,
  onToggle,
  onEmojiChange,
  handBtnRef,
}: VoiceRaiseHandButtonProps) => {
  const internalRef = useRef<HTMLButtonElement>(null);
  const buttonRef = handBtnRef ?? internalRef;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Emoji temporarily displayed inside the button
  const [displayEmoji, setDisplayEmoji] = useState<string | null>(null);

  // Keep track of the timeout so selecting another emoji
  // can restart the 10-second timer.
  const emojiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const popupOpen = Boolean(anchorEl);

  /**
   * Cleanup timeout when component unmounts.
   */
  useEffect(
    () => () => {
      if (emojiTimeoutRef.current) {
        clearTimeout(emojiTimeoutRef.current);
      }
    },
    []
  );

  /**
   * Handle main button click.
   */
  const handleButtonClick = () => {
    if (raiseHand) {
      // Already raised -> lower hand
      onToggle?.();

      // Return to normal icon
      setDisplayEmoji(null);

      if (emojiTimeoutRef.current) {
        clearTimeout(emojiTimeoutRef.current);
        emojiTimeoutRef.current = null;
      }

      return;
    }

    // Not raised -> open emoji selector
    setAnchorEl(buttonRef.current);
  };

  /**
   * Handle emoji selection.
   */
  const handleEmojiSelect = (emoji: string) => {
    // Update parent state
    onEmojiChange?.(emoji);

    // Show selected emoji inside button
    setDisplayEmoji(emoji);

    // Close popup
    setAnchorEl(null);

    // Clear previous timer if user selects another emoji
    if (emojiTimeoutRef.current) {
      clearTimeout(emojiTimeoutRef.current);
    }

    // Hide emoji after 10 seconds
    emojiTimeoutRef.current = setTimeout(() => {
      setDisplayEmoji(null);
      emojiTimeoutRef.current = null;
    }, 10_000);

    // Raise hand
    if (!raiseHand) {
      onToggle?.();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const iconBtnSx = {
    p: 1,
    width: 32,
    height: 32,
    borderRadius: 1,

    bgcolor: raiseHand ? 'rgba(249, 202, 36, 0.16)' : 'background.paper',

    border: '1px solid',

    borderColor: raiseHand ? 'rgba(249, 202, 36, 0.3)' : 'transparent',

    '&:hover': {
      bgcolor: 'rgba(249, 202, 36, 0.22)',
    },
  };

  return (
    <>
      <Tooltip title={raiseHand ? `Lower hand (${selectedEmoji})` : 'Raise hand'} arrow>
        <IconButton ref={buttonRef} size="small" onClick={handleButtonClick} sx={iconBtnSx}>
          {displayEmoji ? (
            /*
             * Selected emoji is shown for 10 seconds.
             */
            <Box
              component="span"
              sx={{
                fontSize: '1.25rem',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                animation: 'emojiPop 0.2s ease-out',

                '@keyframes emojiPop': {
                  from: {
                    transform: 'scale(0.5)',
                    opacity: 0,
                  },
                  to: {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                },
              }}
            >
              {displayEmoji}
            </Box>
          ) : (
            /*
             * Normal waving-hand icon.
             */
            <Hand
              sx={{
                fontSize: '1rem',
                color: raiseHand ? '#f9ca24' : 'grey.500',

                animation: raiseHand ? 'wave 0.5s ease infinite alternate' : 'none',

                '@keyframes wave': {
                  from: {
                    transform: 'rotate(-15deg)',
                  },
                  to: {
                    transform: 'rotate(15deg)',
                  },
                },
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
              boxShadow: (theme) => theme.shadows[8],
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

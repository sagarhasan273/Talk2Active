import { useSelector } from 'react-redux';
import { useRef, useState, useEffect, useCallback } from 'react';

import PanToolIcon from '@mui/icons-material/PanTool';
import { Box, Menu, Paper, MenuItem, IconButton, Typography } from '@mui/material';

import { useRoomTools, selectAccount } from 'src/core/slices';
import { useSocketContext } from 'src/core/contexts/socket-context';

const handEmojis = {
  raised: { emoji: '✋', label: 'Raised Hand' },
  wave: { emoji: '👋', label: 'Wave' },
  open: { emoji: '🤚', label: 'Open Hand' },
  victory: { emoji: '✌️', label: 'Victory' },
  fingersCrossed: { emoji: '🤞', label: 'Fingers Crossed' },
  ok: { emoji: '👌', label: 'OK' },
  peace: { emoji: '☮️', label: 'Peace' },
  celebration: { emoji: '🙌', label: 'Celebration' },
};

export const RaiseHandButton = () => {
  const { emit, socket } = useSocketContext();
  const { room } = useRoomTools();

  const user = useSelector(selectAccount);

  const [raiseHand, setRaiseHand] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('🙌');
  const [selectedLabel, setSelectedLabel] = useState('Celebration');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const toastTimeoutRef = useRef<NodeJS.Timeout>();
  const inactivityTimeoutRef = useRef<NodeJS.Timeout>();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!raiseHand) {
      // Show emoji picker
      setAnchorEl(event.currentTarget);
    } else {
      // Lower hand
      setRaiseHand(false);
      setShowToast(false);
      setAnchorEl(null);
      // Clear inactivity timer when manually lowering hand
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }

      if (socket) {
        emit('send-user-actions-in-voice', {
          roomId: room.id,
          type: 'raise-hand-off',
          senderInfo: {
            socketId: socket.id,
            userId: user.id,
          },
        });
      }
    }
  };

  const handleEmojiSelect = (emoji: string, label: string) => {
    setSelectedEmoji(emoji);
    setSelectedLabel(label);
    setRaiseHand(true);
    setAnchorEl(null);
    showToastMessage(`${label} ${emoji}`);

    if (socket) {
      emit('send-user-actions-in-voice', {
        roomId: room.id,
        type: 'raise-hand',
        senderInfo: {
          socketId: socket.id,
          userId: user.id,
          emoji: emoji || '🙌',
          label,
        },
      });
    }

    // Start inactivity timer for auto-lower after 10 seconds
    startInactivityTimer();
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 10000);
  };

  const startInactivityTimer = useCallback(() => {
    // Clear any existing inactivity timer
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    // Set new timer to auto-lower hand after 10 seconds
    inactivityTimeoutRef.current = setTimeout(() => {
      if (raiseHand) {
        setShowToast(false);
        showToastMessage('Hand auto-lowered ⏱️');
      }
    }, 10000); // 10 seconds
  }, [raiseHand]);

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Cleanup timeouts on unmount
  useEffect(
    () => () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    },
    []
  );

  // Show hand indicator when raised and restart inactivity timer
  useEffect(() => {
    if (raiseHand) {
      showToastMessage(`${selectedLabel} ${selectedEmoji}`);
      startInactivityTimer();
    }
  }, [raiseHand, selectedLabel, selectedEmoji, startInactivityTimer]);

  return (
    <Box sx={{ position: 'relative' }}>
      <IconButton
        sx={{
          color: 'common.white',
          '&:hover': { bgcolor: '#3b3d44' },
          position: 'relative',
        }}
        size="small"
        onClick={handleClick}
      >
        <PanToolIcon sx={{ color: raiseHand ? '#ff9800' : 'inherit', fontSize: '18px' }} />
      </IconButton>

      {/* Emoji Picker Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            bgcolor: '#2b2d31',
            mt: -1,
            '& .MuiMenuItem-root': {
              justifyContent: 'center',
              fontSize: '1.5rem',
              minWidth: 'auto',
              py: 1,
              px: 2,
              '&:hover': {
                bgcolor: '#3b3d44',
              },
            },
          },
        }}
      >
        <Box sx={{ p: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.5 }}>
          {Object.entries(handEmojis).map(([key, { emoji, label }]) => (
            <MenuItem
              key={key}
              onClick={() => handleEmojiSelect(emoji, label)}
              sx={{
                borderRadius: 1,
                flexDirection: 'column',
                fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' },
                p: { xs: 0.5, sm: 0.75, md: 1 },
                minWidth: { xs: 50, sm: 60, md: 70 },
                '&:hover': {
                  bgcolor: '#3b3d44',
                },
              }}
            >
              <Box sx={{ lineHeight: 1 }}>{emoji}</Box>
              <Typography
                variant="caption"
                sx={{
                  fontSize: { xs: '0.5rem', sm: '0.55rem', md: '0.6rem' },
                  color: '#b5bac1',
                  mt: 0.25,
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </Typography>
            </MenuItem>
          ))}
        </Box>
      </Menu>

      {/* Toast Notification - Positioned higher */}
      {showToast && (
        <Paper
          sx={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            mb: 2, // Increased from 1.5 to 5 to move it much higher
            bgcolor: '#1e1f22',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: 2,
            fontSize: '0.875rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            border: '1px solid #3b3d44',
            whiteSpace: 'nowrap',
            zIndex: 1500,
            animation: 'slideUp 0.2s ease-out',
            '@keyframes slideUp': {
              '0%': {
                opacity: 0,
                transform: 'translateX(-50%) translateY(10px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateX(-50%) translateY(0)',
              },
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #1e1f22',
            },
          }}
        >
          {toastMessage}
        </Paper>
      )}
    </Box>
  );
};

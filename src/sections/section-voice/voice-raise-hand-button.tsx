import { useSelector } from 'react-redux';
import { useRef, useState, useEffect, useCallback } from 'react';

import { useTheme } from '@mui/material/styles';
import PanToolIcon from '@mui/icons-material/PanTool';
import { Box, Menu, Paper, alpha, MenuItem, IconButton, Typography } from '@mui/material';

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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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

  // ── FIX: use ref to avoid stale closure in setTimeout ─────────────────
  const raiseHandRef = useRef(raiseHand);
  useEffect(() => {
    raiseHandRef.current = raiseHand;
  }, [raiseHand]);

  const showToastMessage = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setShowToast(false), 10000);
  }, []);

  // ── FIX: reads raiseHandRef.current instead of captured raiseHand ─────
  const startInactivityTimer = useCallback(() => {
    if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);

    inactivityTimeoutRef.current = setTimeout(() => {
      if (raiseHandRef.current) {
        setRaiseHand(false);
        setShowToast(false);
        showToastMessage('Hand auto-lowered ⏱️');
      }
    }, 10_000);
  }, [showToastMessage]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!raiseHand) {
      setAnchorEl(event.currentTarget);
    } else {
      setRaiseHand(false);
      setShowToast(false);
      setAnchorEl(null);
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

      if (socket) {
        emit('send-user-actions-in-voice', {
          roomId: room.id,
          type: 'raise-hand-off',
          senderInfo: { socketId: socket.id, userId: user.id },
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
    startInactivityTimer();

    if (socket) {
      emit('send-user-actions-in-voice', {
        roomId: room.id,
        type: 'raise-hand',
        senderInfo: { socketId: socket.id, userId: user.id, emoji, label },
      });
    }
  };

  // Restart timer whenever hand stays raised
  useEffect(() => {
    if (raiseHand) {
      showToastMessage(`${selectedLabel} ${selectedEmoji}`);
      startInactivityTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raiseHand]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
    },
    []
  );

  const menuBg = isDark ? theme.palette.background.paper : theme.palette.background.paper;
  const hoverBg = isDark ? alpha('#fff', 0.07) : alpha('#000', 0.05);
  const toastBg = isDark ? theme.palette.background.paper : '#fff';
  const toastBdr = isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1);

  return (
    <Box sx={{ position: 'relative' }}>
      {/* ── Main button ─────────────────────────────────────────────── */}
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          borderRadius: '10px',
          color: raiseHand ? '#ff9800' : theme.palette.text.secondary,
          bgcolor: raiseHand ? alpha('#ff9800', 0.12) : 'transparent',
          border: '1px solid',
          borderColor: raiseHand ? alpha('#ff9800', 0.35) : 'transparent',
          transition: 'all 0.18s ease',
          '&:hover': {
            bgcolor: raiseHand ? alpha('#ff9800', 0.2) : hoverBg,
            color: raiseHand ? '#ff9800' : theme.palette.text.primary,
          },
        }}
      >
        <PanToolIcon sx={{ fontSize: 18 }} />
      </IconButton>

      {/* ── Emoji picker menu ────────────────────────────────────────── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        PaperProps={{
          sx: {
            bgcolor: menuBg,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            boxShadow: `0 8px 28px ${alpha('#000', isDark ? 0.5 : 0.14)}`,
            mt: -1,
          },
        }}
      >
        <Box
          sx={{
            p: 0.75,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 0.5,
          }}
        >
          {Object.entries(handEmojis).map(([key, { emoji, label }]) => (
            <MenuItem
              key={key}
              onClick={() => handleEmojiSelect(emoji, label)}
              sx={{
                borderRadius: 1.5,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.5rem' },
                p: { xs: 0.5, sm: 0.75, md: 1 },
                minWidth: { xs: 50, sm: 58, md: 64 },
                transition: 'background 0.15s',
                '&:hover': { bgcolor: hoverBg },
              }}
            >
              <Box sx={{ lineHeight: 1 }}>{emoji}</Box>
              <Typography
                variant="caption"
                sx={{
                  fontSize: { xs: '0.5rem', sm: '0.55rem', md: '0.6rem' },
                  color: 'text.secondary',
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

      {/* ── Toast notification ───────────────────────────────────────── */}
      {showToast && (
        <Paper
          sx={{
            position: 'absolute',
            bottom: 'calc(100% + 12px)',
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: toastBg,
            color: 'text.primary',
            px: 2,
            py: 0.6,
            borderRadius: 2,
            fontSize: '0.82rem',
            fontWeight: 600,
            boxShadow: `0 4px 16px ${alpha('#000', 0.2)}`,
            border: `1px solid ${toastBdr}`,
            whiteSpace: 'nowrap',
            zIndex: 1500,
            animation: 'slideUp 0.2s ease-out',
            '@keyframes slideUp': {
              '0%': { opacity: 0, transform: 'translateX(-50%) translateY(8px)' },
              '100%': { opacity: 1, transform: 'translateX(-50%) translateY(0)' },
            },
            // Speech bubble arrow
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: `6px solid ${toastBdr}`,
            },
          }}
        >
          {toastMessage}
        </Paper>
      )}
    </Box>
  );
};

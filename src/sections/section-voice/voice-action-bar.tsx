// voice-action-bar.tsx
import type { UserType } from 'src/types/type-user';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import HeadsetIcon from '@mui/icons-material/Headset';
import Hand from '@mui/icons-material/WavingHandRounded';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HeadsetOffIcon from '@mui/icons-material/HeadsetOff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Menu,
  Stack,
  Paper,
  alpha,
  Popover,
  Tooltip,
  Divider,
  MenuItem,
  useTheme,
  Typography,
  IconButton,
} from '@mui/material';

import { useRoomTools, useCredentials } from 'src/core/slices';
import { useWebRTCContext } from 'src/core/contexts/webRTC-context';
import { useSocketContext } from 'src/core/contexts/socket-context';

import { VoiceRoomMessageGroupDrawer } from 'src/components/drawers';

import { VoiceAudioControls } from 'src/sections/section-voice/voice-audio-controls';

import { VoiceMessageGroup } from './voice-message-group';
import { ChatStatusButton } from './voice-user-status-button';

// ── Mic popover ───────────────────────────────────────────────────────────────

const MicPopover = ({
  anchorEl,
  onClose,
  isMicMuted,
  onToggle,
}: {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  isMicMuted: boolean;
  onToggle: () => void;
}) => (
  <Popover
    open={Boolean(anchorEl)}
    anchorEl={anchorEl}
    onClose={onClose}
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    PaperProps={{
      sx: {
        borderRadius: 2,
        p: 2,
        width: 200,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
      },
    }}
  >
    <Typography
      sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', mb: 1.5, letterSpacing: 0.6 }}
    >
      MICROPHONE
    </Typography>

    <Box
      onClick={onToggle}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        borderRadius: 1.5,
        cursor: 'pointer',
        bgcolor: isMicMuted ? 'rgba(237,66,69,0.08)' : 'rgba(67,181,129,0.08)',
        border: '1px solid',
        borderColor: isMicMuted ? 'rgba(237,66,69,0.2)' : 'rgba(67,181,129,0.2)',
        mb: 2,
        transition: 'all 0.2s',
        '&:hover': { opacity: 0.85 },
      }}
    >
      {isMicMuted ? (
        <MicOffIcon sx={{ fontSize: 16, color: '#ed4245' }} />
      ) : (
        <MicIcon sx={{ fontSize: 16, color: '#43b581' }} />
      )}
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: isMicMuted ? '#ed4245' : '#43b581' }}>
        {isMicMuted ? 'Unmute' : 'Mute'}
      </Typography>
    </Box>
    <VoiceAudioControls />
  </Popover>
);

// ── Settings popover ──────────────────────────────────────────────────────────

const SettingsPopover = ({
  anchorEl,
  onClose,
}: {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}) => (
  <Popover
    open={Boolean(anchorEl)}
    anchorEl={anchorEl}
    onClose={onClose}
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    PaperProps={{
      sx: {
        borderRadius: 2,
        p: 2,
        width: 240,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
      },
    }}
  >
    <Typography
      sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', mb: 1.5, letterSpacing: 0.6 }}
    >
      AUDIO SETTINGS
    </Typography>
    <VoiceAudioControls />
  </Popover>
);

// ── Hand emojis ───────────────────────────────────────────────────────────────

const HAND_EMOJIS = {
  raised: { emoji: '✋', label: 'Raised Hand' },
  wave: { emoji: '👋', label: 'Wave' },
  open: { emoji: '🤚', label: 'Open Hand' },
  victory: { emoji: '✌️', label: 'Victory' },
  fingersCrossed: { emoji: '🤞', label: 'Fingers Crossed' },
  ok: { emoji: '👌', label: 'OK' },
  peace: { emoji: '☮️', label: 'Peace' },
  celebration: { emoji: '🙌', label: 'Celebration' },
} as const;

// ── Main component ────────────────────────────────────────────────────────────

export const VoiceActionBar = ({ screenShareButton }: { screenShareButton?: React.ReactNode }) => {
  const { user } = useCredentials();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { room, userVoiceState, updateUserVoiceState, updateParticipantStatus } = useRoomTools();
  const { emit, socket } = useSocketContext();
  const { isMicMuted, isDeafened, hasJoined, roomId } = userVoiceState;
  const { toggleDeafen, onClickMicrophone, onLeaveRoom } = useWebRTCContext();

  const [micAnchorEl, setMicAnchorEl] = useState<HTMLElement | null>(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLElement | null>(null);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState<HTMLElement | null>(null);

  const [raiseHand, setRaiseHand] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('🙌');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // FIX 1: correctly typed ref for hand button anchor
  const handBtnRef = useRef<HTMLButtonElement>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout>();
  const inactivityTimeoutRef = useRef<NodeJS.Timeout>();
  const raiseHandRef = useRef(raiseHand);

  useEffect(() => {
    raiseHandRef.current = raiseHand;
  }, [raiseHand]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const showToastMessage = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setShowToast(false), 3_000);
  }, []);

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

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
    },
    []
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleMicMute = () => {
    onClickMicrophone(!isMicMuted);
    updateUserVoiceState({ isMicMuted: !isMicMuted });
    if (room.id) {
      emit('user-audio-toggle', {
        socketId: socket?.id,
        roomId: room.id,
        isMuted: !isMicMuted,
        name: user.name,
        userId: user.id,
      });
    }
  };

  const handleDeafen = () => {
    const newDeafened = !isDeafened;
    toggleDeafen();
    if (newDeafened && !isMicMuted) onClickMicrophone(true);
    updateUserVoiceState({
      isDeafened: newDeafened,
      isMicMuted: newDeafened ? true : isMicMuted,
    });
  };

  const handleToggleUserStatus = useCallback(
    (selectedStatus: UserType['status']) => {
      if (!socket) return;
      socket.emit('user-status-select', {
        roomId,
        socketId: socket.id,
        status: selectedStatus,
        name: user.name,
        userId: user.id,
      });
      if (socket.id) updateParticipantStatus({ userId: user.id, status: selectedStatus });
    },
    [socket, roomId, user?.name, user?.id, updateParticipantStatus]
  );

  // FIX 2: use anchorRef.current (not anchorRef itself)
  const handleHandToggle = useCallback(() => {
    if (raiseHand) {
      setRaiseHand(false);
      setShowToast(false);
      setEmojiAnchorEl(null);
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (socket) {
        emit('send-user-actions-in-voice', {
          roomId: room.id,
          type: 'raise-hand-off',
          senderInfo: { socketId: socket.id, userId: user.id },
        });
      }
    } else {
      // FIX 2: .current here
      setEmojiAnchorEl(handBtnRef.current);
    }
  }, [raiseHand, room.id, socket, emit, user.id]);

  const handleEmojiSelect = (emoji: string, label: string) => {
    setSelectedEmoji(emoji);
    setRaiseHand(true);
    setEmojiAnchorEl(null);
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

  // ── Styles ────────────────────────────────────────────────────────────────

  const hoverBg = isDark ? alpha('#fff', 0.07) : alpha('#000', 0.05);
  const toastBg = theme.palette.background.paper;
  const toastBdr = isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1);

  const iconBtnSx = (active?: boolean, danger?: boolean) => ({
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    color: danger ? '#ed4245' : active ? '#667eea' : '#72767d',
    bgcolor: danger ? 'rgba(237,66,69,0.1)' : active ? 'rgba(102,126,234,0.1)' : 'transparent',
    border: danger ? '1px solid rgba(237,66,69,0.2)' : '1px solid transparent',
    '&:hover': {
      bgcolor: danger ? 'rgba(237,66,69,0.22)' : hoverBg,
      transform: 'scale(1.1)',
    },
  });

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* FIX 3: position:relative wrapper so toast positions correctly */}
      <Box sx={{ position: 'relative', width: 1 }}>
        <Box
          sx={{
            width: 1,
            px: 1,
            py: 0.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
          }}
        >
          {/* ── Left: Mic + arrow + Deafen ── */}
          <Stack
            direction="row"
            spacing={0.6}
            alignItems="center"
            sx={{ bgcolor: 'background.neutral', borderRadius: 1, p: 0.5, height: 40 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: 'transparent',
                overflow: 'hidden',
              }}
            >
              <Tooltip title={isMicMuted ? 'Unmute' : 'Mute'}>
                <IconButton size="small" onClick={handleMicMute} sx={iconBtnSx(false, isMicMuted)}>
                  {isMicMuted ? (
                    <MicOffIcon sx={{ fontSize: '1rem' }} />
                  ) : (
                    <MicIcon sx={{ fontSize: '1rem' }} />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title="Mic settings">
                <IconButton
                  size="small"
                  onClick={(e) => setMicAnchorEl(e.currentTarget)}
                  sx={{
                    borderRadius: 0,
                    px: 0.25,
                    color: '#72767d',
                    '&:hover': { bgcolor: hoverBg, color: '#667eea' },
                  }}
                >
                  <ExpandMoreIcon sx={{ fontSize: '0.8rem' }} />
                </IconButton>
              </Tooltip>
            </Box>

            <Tooltip title={isDeafened ? 'Undeafen' : 'Deafen'}>
              <IconButton size="small" onClick={handleDeafen} sx={iconBtnSx(false, isDeafened)}>
                {isDeafened ? (
                  <HeadsetOffIcon sx={{ fontSize: '1rem' }} />
                ) : (
                  <HeadsetIcon sx={{ fontSize: '1rem' }} />
                )}
              </IconButton>
            </Tooltip>
          </Stack>

          <Divider orientation="vertical" flexItem sx={{ opacity: 0.3 }} />

          {/* ── Middle: Status + Hand ── */}
          <Box sx={{ position: 'sticky', bottom: 20, zIndex: 10 }}>
            <Stack
              direction="row"
              spacing={0.6}
              alignItems="center"
              sx={{ bgcolor: 'background.neutral', borderRadius: 1, p: 0.5, height: 40 }}
            >
              {hasJoined && (
                <Tooltip title="Set status">
                  <Box sx={{ display: 'inline-flex' }}>
                    <ChatStatusButton onStatusChange={handleToggleUserStatus} />
                  </Box>
                </Tooltip>
              )}

              {/* FIX 1: ref on button, no anchorEl prop */}
              <Tooltip title={raiseHand ? `Lower hand (${selectedEmoji})` : 'Raise hand'}>
                <IconButton
                  ref={handBtnRef}
                  size="small"
                  onClick={handleHandToggle}
                  sx={iconBtnSx(raiseHand)}
                >
                  <Hand
                    sx={{
                      fontSize: '1rem',
                      color: raiseHand ? '#f9ca24' : '#72767d',
                      animation: raiseHand ? 'wave 0.5s ease infinite alternate' : 'none',
                      '@keyframes wave': {
                        from: { transform: 'rotate(-15deg)' },
                        to: { transform: 'rotate(15deg)' },
                      },
                    }}
                  />
                </IconButton>
              </Tooltip>

              {screenShareButton}
            </Stack>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ opacity: 0.3 }} />

          {/* ── Right: Settings + Leave ── */}
          <Stack
            direction="row"
            spacing={0.6}
            alignItems="center"
            sx={{ bgcolor: 'background.neutral', borderRadius: 1, p: 0.5, height: 40 }}
          >
            <VoiceRoomMessageGroupDrawer>
              <VoiceMessageGroup />
            </VoiceRoomMessageGroupDrawer>

            {hasJoined && (
              <Tooltip title="Leave voice">
                <IconButton size="small" onClick={() => onLeaveRoom()} sx={iconBtnSx(false, true)}>
                  <ExitToAppIcon sx={{ fontSize: '1rem' }} />
                  <Typography variant="body2">Leave</Typography>
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>

        {/* FIX 3: toast inside relative wrapper */}
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

      {/* ── Popovers + Menu (outside relative wrapper) ── */}
      <MicPopover
        anchorEl={micAnchorEl}
        onClose={() => setMicAnchorEl(null)}
        isMicMuted={isMicMuted}
        onToggle={() => {
          handleMicMute();
          setMicAnchorEl(null);
        }}
      />

      <SettingsPopover anchorEl={settingsAnchorEl} onClose={() => setSettingsAnchorEl(null)} />

      <Menu
        anchorEl={emojiAnchorEl}
        open={Boolean(emojiAnchorEl)}
        onClose={() => setEmojiAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.paper,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            boxShadow: `0 8px 28px ${alpha('#000', isDark ? 0.5 : 0.14)}`,
            mt: -1,
          },
        }}
      >
        <Box sx={{ p: 0.75, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.5 }}>
          {Object.entries(HAND_EMOJIS).map(([key, { emoji, label }]) => (
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
    </>
  );
};

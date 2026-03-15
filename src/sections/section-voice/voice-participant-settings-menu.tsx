import type { UserType } from 'src/types/type-user';

import { useSelector } from 'react-redux';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Portal from '@mui/material/Portal';
import { useTheme } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, Menu, Paper, alpha, Tooltip, MenuItem, IconButton, Typography } from '@mui/material';

import { useRoomTools, selectAccount } from 'src/core/slices';
import { useWebRTCContext } from 'src/core/contexts/webRTC-context';
import { useSocketContext } from 'src/core/contexts/socket-context';

import { VoiceParticipantSettings } from './voice-participant-settings';

// ─── Constants ────────────────────────────────────────────────────────────────

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

export type HostActionType = 'mute' | 'kick' | 'block-mic';

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  targetSocketId: string;
  targetUserId: string;
  targetName: string;
  targetProfilePhoto?: string | null;
  targetAccountType?: UserType['accountType'];
  targetVerified?: boolean;
  onAction?: (action: HostActionType, targetSocketId: string) => void;
  isHost?: boolean;
  isSelf?: boolean;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function VoiceParticipantSettingsMenu({
  targetSocketId,
  targetUserId,
  targetName,
  targetAccountType,
  targetVerified,
  targetProfilePhoto,
  isHost,
  isSelf = false,
  onAction,
}: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { remoteAudioSettings, setRemoteVolume } = useWebRTCContext();
  const { emit, socket } = useSocketContext();
  const { room } = useRoomTools();
  const user = useSelector(selectAccount);

  // ── Settings popup ───────────────────────────────────────────────────────
  const [settingsOpen, setSettingsOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  // ── Hand raise ───────────────────────────────────────────────────────────
  const [raiseHand, setRaiseHand] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('🙌');
  const [selectedLabel, setSelectedLabel] = useState('Celebration');
  const [emojiAnchorEl, setEmojiAnchorEl] = useState<null | HTMLElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const toastTimeoutRef = useRef<NodeJS.Timeout>();
  const inactivityTimeoutRef = useRef<NodeJS.Timeout>();

  // Ref to avoid stale closure in setTimeout
  const raiseHandRef = useRef(raiseHand);
  useEffect(() => {
    raiseHandRef.current = raiseHand;
  }, [raiseHand]);

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

  // ── Hand raise handlers ──────────────────────────────────────────────────

  // Called from VoiceParticipantSettings → onRaiseHand prop
  const handleRaiseHandClick = (e?: React.MouseEvent<HTMLElement>) => {
    if (raiseHand) {
      // Already raised — lower it
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
      // Not raised — open emoji picker
      setEmojiAnchorEl(e?.currentTarget ?? anchorRef.current);
    }
  };

  const handleEmojiSelect = (emoji: string, label: string) => {
    setSelectedEmoji(emoji);
    setSelectedLabel(label);
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

  // ── Settings popup positioning ───────────────────────────────────────────

  const getPopupStyle = (): React.CSSProperties => {
    if (!anchorRef.current) return {};
    const rect = anchorRef.current.getBoundingClientRect();
    return {
      position: 'fixed',
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
      zIndex: 1400,
    };
  };

  const handleSettingsOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setSettingsOpen((prev) => !prev);
  };

  // ── Derived styles ───────────────────────────────────────────────────────

  const hoverBg = isDark ? alpha('#fff', 0.07) : alpha('#000', 0.05);
  const toastBg = theme.palette.background.paper;
  const toastBdr = isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1);

  // When hand is raised, show toast + start auto-lower timer
  useEffect(() => {
    if (raiseHand) {
      showToastMessage(`${selectedLabel} ${selectedEmoji}`);
      startInactivityTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raiseHand]);

  // Cleanup timers on unmount
  useEffect(
    () => () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
    },
    []
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Box sx={{ position: 'absolute', top: 5, right: 5, transition: 'opacity 0.15s' }}>
      {/* ── Trigger ───────────────────────────────────────────────────── */}
      <Tooltip title="Participant actions" arrow placement="top">
        <IconButton
          ref={anchorRef}
          size="small"
          onClick={handleSettingsOpen}
          sx={{
            width: 24,
            height: 24,
            borderRadius: '6px',
            color: 'text.secondary',
            bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
            '&:hover': { bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.6) },
            '&:active': { bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.6) },
          }}
        >
          <MoreVertIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Tooltip>

      {/* ── Settings popup (Portal) ────────────────────────────────────── */}
      {settingsOpen && (
        <Portal>
          <Box onClick={(e) => e.stopPropagation()} style={getPopupStyle()}>
            <VoiceParticipantSettings
              socketId={targetSocketId}
              userId={targetUserId}
              displayName={targetName}
              isSelf={isSelf}
              initials={targetName.slice(0, 2).toUpperCase()}
              avatarUrl={targetProfilePhoto ?? undefined}
              anchorEl={anchorRef.current}
              initialVolume={remoteAudioSettings[targetSocketId]?.volume ?? 100}
              onVolumeChange={(id, vol) => setRemoteVolume(id, vol)}
              isMicMuted={false}
              onMuteMic={(id) => {
                socket?.emit('host-force-mute', { targetSocketId: id });
                onAction?.('mute', id);
              }}
              onUnmuteMic={() => {}}
              // Hand raise wired to the real handlers above
              isHandRaised={raiseHand}
              onRaiseHand={() => handleRaiseHandClick()}
              onLowerHand={() => handleRaiseHandClick()}
              onKick={(id) => {
                socket?.emit('host-kick-user', { targetSocketId: id });
                onAction?.('kick', id);
              }}
              onBlock={(id) => {
                socket?.emit('host-block-mic', { targetSocketId: id });
                onAction?.('block-mic', id);
              }}
              isBlocked={false}
              onClose={() => setSettingsOpen(false)}
            />
          </Box>
        </Portal>
      )}

      {/* ── Emoji picker ──────────────────────────────────────────────── */}
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

      {/* ── Toast ─────────────────────────────────────────────────────── */}
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
  );
}

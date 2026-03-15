import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Ban,
  Mic,
  Hand,
  MicOff,
  Volume2,
  VolumeX,
  UserPlus,
  UserMinus,
  UserCheck,
} from 'lucide-react';

import { styled } from '@mui/material/styles';
import {
  Box,
  Slide,
  Stack,
  alpha,
  Slider,
  Avatar,
  Portal,
  Button,
  Tooltip,
  useTheme,
  Typography,
} from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';

import { useCredentials } from 'src/core/slices';
import { RelationshipTypeEnum } from 'src/enums/enum-social';
import { useFollowMutation, useUnfollowMutation } from 'src/core/apis';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VoiceParticipantSettingsProps {
  socketId: string;
  userId: string;
  displayName: string;
  isSelf: boolean;
  initials: string;
  avatarUrl?: string;

  initialVolume?: number; // 0–150
  onVolumeChange: (socketId: string, volume: number) => void;

  isMicMuted: boolean;
  onMuteMic: (socketId: string) => void;
  onUnmuteMic: (socketId: string) => void;

  isHandRaised: boolean;
  onRaiseHand: (socketId: string) => void;
  onLowerHand: (socketId: string) => void;

  onKick: (socketId: string) => void;
  onBlock: (socketId: string) => void;
  isBlocked?: boolean;

  anchorEl?: HTMLElement | null;
  onClose: () => void;
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const Popup = styled(Box)(({ theme }) => ({
  width: 'min(252px, 92vw)',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
  borderRadius: theme.spacing(1.5),
  overflow: 'hidden',
  boxShadow:
    theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.55)' : '0 4px 24px rgba(0,0,0,0.10)',
  transition: 'opacity 0.14s ease, transform 0.14s ease',
}));

const Sheet = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1300,
  backgroundColor: theme.palette.background.paper,
  borderRadius: '14px 14px 0 0',
  border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  maxHeight: '88vh',
  overflowY: 'auto',
}));

const Backdrop = styled(Box)({
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.38)',
  zIndex: 1299,
  transition: 'opacity 0.2s ease',
});

// Small icon button used for action row
const ActionBtn = styled(Button, {
  shouldForwardProp: (p) => !['danger', 'warn', 'active'].includes(p as string),
})<{ danger?: boolean; warn?: boolean; active?: boolean }>(({ theme, danger, warn, active }) => {
  const p = theme.palette;
  const color = danger
    ? p.error.main
    : warn
      ? p.warning.main
      : active
        ? p.primary.main
        : p.text.secondary;
  return {
    width: 30,
    height: 30,
    borderRadius: 8,
    color,
    border: `1px solid ${alpha(color, danger || warn || active ? 0.28 : 0.12)}`,
    backgroundColor: alpha(color, danger || warn || active ? 0.08 : 0),
    transition: 'all 0.14s ease',
    '&:hover': {
      backgroundColor: alpha(color, 0.16),
      transform: 'scale(1.08)',
    },
    '&:active': { transform: 'scale(0.93)', color, backgroundColor: alpha(color, 0.16) },
  };
});

// ─── Component ────────────────────────────────────────────────────────────────

export function VoiceParticipantSettings({
  socketId,
  userId,
  displayName,
  isSelf,
  initials,
  avatarUrl,
  initialVolume = 100,
  onVolumeChange,
  isMicMuted,
  onMuteMic,
  onUnmuteMic,
  isHandRaised,
  onRaiseHand,
  onLowerHand,
  onKick,
  onBlock,
  isBlocked = false,
  anchorEl,
  onClose,
}: VoiceParticipantSettingsProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useResponsive('down', 'sm');

  const { user, checkIfFollowing } = useCredentials();

  const [volume, setVolume] = useState(initialVolume);
  const [visible, setVisible] = useState(false);

  const popupRef = useRef<HTMLDivElement>(null);

  const isFollowing = checkIfFollowing(userId);

  const [followMutate, { isLoading: isLoadingFollow }] = useFollowMutation();
  const [unfollowMutate, { isLoading: isLoadingUnfollow }] = useUnfollowMutation();

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleVolumeChange = useCallback(
    (_: Event, val: number | number[]) => {
      const v = val as number;
      setVolume(v);
      onVolumeChange(socketId, v);
    },
    [socketId, onVolumeChange]
  );

  const handleMuteToggle = useCallback(
    () => (isMicMuted ? onUnmuteMic(userId) : onMuteMic(userId)),
    [isMicMuted, userId, onMuteMic, onUnmuteMic]
  );

  const handleHandToggle = useCallback(
    () => (isHandRaised ? onLowerHand(socketId) : onRaiseHand(socketId)),
    [isHandRaised, socketId, onRaiseHand, onLowerHand]
  );

  const handleKick = useCallback(() => {
    if (window.confirm(`Kick ${displayName}?`)) {
      onKick(socketId);
      onClose();
    }
  }, [socketId, displayName, onKick, onClose]);

  const handleBlock = useCallback(() => onBlock(socketId), [socketId, onBlock]);

  const handleFollow = useCallback(async () => {
    if (!isFollowing) {
      await followMutate({
        requester: user.id,
        recipient: userId,
        type: RelationshipTypeEnum.FOLLOW,
      });
    } else {
      await unfollowMutate({
        requester: user.id,
        recipient: userId,
        type: RelationshipTypeEnum.FOLLOW,
      });
    }
  }, [user.id, userId, isFollowing, followMutate, unfollowMutate]);

  // Enter animation
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Outside click
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      e.preventDefault();
      if (popupRef.current && !popupRef.current.contains(e.target as Node) && anchorEl !== e.target)
        onClose();
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [anchorEl, onClose]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // ── Inner content ────────────────────────────────────────────────────────

  const content = (
    <Box>
      {/* Drag handle — mobile */}
      {isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.25, pb: 0.5 }}>
          <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: 'divider' }} />
        </Box>
      )}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Box
        sx={{
          px: 1.5,
          pt: isMobile ? 1 : 1.25,
          pb: 1.25,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar
            src={avatarUrl}
            sx={{
              width: isMobile ? 36 : 30,
              height: isMobile ? 36 : 30,
              fontSize: isMobile ? 14 : 12,
              fontWeight: 600,
              bgcolor: alpha(theme.palette.primary.main, 0.14),
              color: theme.palette.primary.main,
              flexShrink: 0,
            }}
          >
            {initials}
          </Avatar>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              noWrap
              sx={{
                fontSize: isMobile ? '0.9rem' : '0.78rem',
                fontWeight: 600,
                color: 'text.primary',
                lineHeight: 1.2,
              }}
            >
              {displayName}
            </Typography>
            <Typography sx={{ fontSize: isMobile ? '0.75rem' : '0.67rem', color: 'text.disabled' }}>
              In voice room
            </Typography>
          </Box>

          {!isSelf && (
            <Button
              onClick={handleFollow}
              startIcon={!isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
              disabled={isLoadingFollow || isLoadingUnfollow}
              sx={{
                color: isFollowing ? 'error.main' : 'praimary.main',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'opacity 0.12s, transform 0.12s',
                '&:active': { opacity: 0.7, transform: 'scale(0.98)', bgColor: 'transparent' },
                '&:hover': { bgColor: 'transparent' },
              }}
            >
              {!isFollowing ? 'Follow' : 'Unfollow'}
            </Button>
          )}
        </Stack>
      </Box>

      {/* ── Volume ──────────────────────────────────────────────────────── */}
      <Box
        sx={{ px: 1.5, py: 1.25, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
          <Typography sx={{ fontSize: isMobile ? '0.78rem' : '0.68rem', color: 'text.secondary' }}>
            Volume
          </Typography>
          <Typography
            sx={{
              fontSize: isMobile ? '0.78rem' : '0.68rem',
              fontWeight: 600,
              color: 'text.primary',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {Math.round(volume)}%
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <VolumeX size={12} color={theme.palette.text.disabled} />
          <Slider
            size="small"
            min={0}
            max={150}
            step={1}
            value={volume}
            onChange={handleVolumeChange}
            aria-label="Participant volume"
            sx={{
              flex: 1,
              color: theme.palette.primary.main,
              '& .MuiSlider-thumb': { width: 10, height: 10 },
              '& .MuiSlider-track': { height: 3 },
              '& .MuiSlider-rail': {
                height: 3,
                bgcolor: isDark ? alpha('#fff', 0.12) : alpha('#000', 0.1),
              },
            }}
          />
          <Volume2 size={12} color={theme.palette.text.disabled} />
        </Stack>
      </Box>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      {isMobile ? (
        // Mobile: full-width rows with icon + text label, 44px tap targets
        <Box sx={{ px: 1.5, pb: 1.5, pt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {(
            [
              {
                icon: isMicMuted ? <MicOff size={15} /> : <Mic size={15} />,
                label: isMicMuted ? 'Unmute mic' : 'Mute mic (for everyone)',
                onClick: handleMuteToggle,
                active: !isMicMuted,
                danger: isMicMuted,
              },
              {
                icon: <Hand size={15} />,
                label: isHandRaised ? 'Lower hand' : 'Raise hand',
                onClick: handleHandToggle,
                warn: isHandRaised,
              },
              {
                icon: <UserMinus size={15} />,
                label: 'Kick from room',
                onClick: handleKick,
                danger: true,
                disabled: isSelf,
              },
              {
                icon: <Ban size={15} />,
                label: isBlocked ? 'Unblock user' : 'Block user',
                onClick: handleBlock,
                danger: isBlocked,
                disabled: isSelf,
              },
            ] as Array<{
              icon: React.ReactNode;
              label: string;
              onClick: () => void;
              danger?: boolean;
              warn?: boolean;
              active?: boolean;
              disabled?: boolean;
            }>
          ).map(({ icon, label, onClick, danger, warn, active, disabled }) => {
            const p = theme.palette;
            const color = danger
              ? p.error.main
              : warn
                ? p.warning.main
                : active
                  ? p.primary.main
                  : p.text.secondary;
            return (
              <Button
                key={label}
                onClick={onClick}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  px: 1.25,
                  py: 0.875,
                  minHeight: 44,
                  borderRadius: '10px',
                  border: `1px solid ${alpha(color, danger || warn || active ? 0.22 : 0.1)}`,
                  bgcolor: alpha(color, danger || warn || active ? 0.07 : 0),
                  color,
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'opacity 0.12s, transform 0.12s',
                  '&:active': { opacity: 0.7, transform: 'scale(0.98)' },
                }}
                disabled={disabled}
              >
                {icon}
                <Typography
                  sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'inherit', lineHeight: 1 }}
                >
                  {label}
                </Typography>
              </Button>
            );
          })}
        </Box>
      ) : (
        // Desktop: icon-only with tooltips
        <Box
          sx={{
            px: 1.5,
            py: 1,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.75,
          }}
        >
          <Tooltip title={isMicMuted ? 'Unmute mic' : 'Mute mic (for everyone)'} arrow>
            <ActionBtn
              size="small"
              active={!isMicMuted}
              danger
              onClick={handleMuteToggle}
              aria-label="Toggle mic mute"
              startIcon={isMicMuted ? <MicOff size={14} /> : <Mic size={14} />}
              sx={{ flex: '1 1 calc(50% - 6px)', minWidth: 0 }}
            >
              {isMicMuted ? 'Unmute' : 'Mute'}
            </ActionBtn>
          </Tooltip>

          <Tooltip title={isHandRaised ? 'Lower hand' : 'Raise hand'} arrow>
            <ActionBtn
              size="small"
              warn={isHandRaised}
              onClick={handleHandToggle}
              aria-label="Toggle raise hand"
              startIcon={<Hand size={14} />}
              sx={{ flex: '1 1 calc(50% - 6px)', minWidth: 0 }}
            >
              {isHandRaised ? 'Lower hand' : 'Raise hand'}
            </ActionBtn>
          </Tooltip>

          <Tooltip title="Kick" arrow>
            <ActionBtn
              size="small"
              danger
              onClick={handleKick}
              aria-label="Kick participant"
              startIcon={<UserMinus size={14} />}
              sx={{ flex: '1 1 calc(50% - 6px)', minWidth: 0 }}
              disabled={isSelf}
            >
              Kick
            </ActionBtn>
          </Tooltip>

          <Tooltip title={isBlocked ? 'Unblock user' : 'Block user'} arrow>
            <ActionBtn
              size="small"
              danger={isBlocked}
              onClick={handleBlock}
              aria-label={isBlocked ? 'Unblock user' : 'Block user'}
              startIcon={<Ban size={14} />}
              sx={{ flex: '1 1 calc(50% - 6px)', minWidth: 0 }}
              disabled={isSelf}
            >
              {isBlocked ? 'Unblock' : 'Block'}
            </ActionBtn>
          </Tooltip>
        </Box>
      )}
    </Box>
  );

  // ── Mobile: bottom sheet ─────────────────────────────────────────────────
  // Wrapped in Portal so it escapes any parent `position:fixed` wrapper
  // (e.g. the desktop-positioning Box in HostActionsMenu) and owns the
  // full viewport correctly.

  if (isMobile) {
    return (
      <Portal>
        <Backdrop onClick={onClose} sx={{ opacity: visible ? 1 : 0 }} />
        <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
          <Sheet ref={popupRef} role="dialog" aria-label={`Controls for ${displayName}`}>
            {content}
          </Sheet>
        </Slide>
      </Portal>
    );
  }

  // ── Desktop: floating popup ──────────────────────────────────────────────

  return (
    <Popup
      ref={popupRef}
      role="dialog"
      aria-label={`Controls for ${displayName}`}
      sx={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(-5px) scale(0.97)',
      }}
    >
      {content}
    </Popup>
  );
}

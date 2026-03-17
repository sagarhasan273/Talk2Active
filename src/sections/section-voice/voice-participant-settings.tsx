import type { UserType } from 'src/types/type-user';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Mic,
  Hand,
  Crown,
  Heart,
  MicOff,
  Volume2,
  VolumeX,
  UserPlus,
  UserMinus,
  UserCheck,
  MessageCircleIcon,
} from 'lucide-react';

import { styled } from '@mui/material/styles';
import {
  Box,
  Badge,
  Slide,
  Stack,
  alpha,
  Slider,
  Portal,
  Button,
  Dialog,
  useTheme,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';

import { RelationshipTypeEnum } from 'src/enums/enum-social';
import { useRoomTools, useCredentials } from 'src/core/slices';
import { useSocketContext } from 'src/core/contexts/socket-context';
import { useFollowMutation, useUnfollowMutation, useUpdateRoomMutation } from 'src/core/apis';

import { AvatarUser } from 'src/components/avatar-user';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VoiceParticipantSettingsProps {
  socketId: string;
  userId: string;
  displayName: string;
  avatarUrl: UserType['profilePhoto'];
  accountType: UserType['accountType'];
  verified: UserType['verified'];
  isSelf: boolean;
  isHost?: boolean;

  initialVolume?: number;
  onVolumeChange: (socketId: string, volume: number) => void;

  isMicMuted: boolean;

  isHandRaised: boolean;
  onRaiseHand: (socketId: string) => void;
  onLowerHand: (socketId: string) => void;

  anchorEl?: HTMLElement | null;
  onClose: () => void;
  isUnreadPM: boolean;
  onClickPM: () => void;
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

const ActionBtn = styled(Button, {
  shouldForwardProp: (p) => !['danger', 'warn', 'active', 'golden'].includes(p as string),
})<{ danger?: boolean; warn?: boolean; active?: boolean; golden?: boolean }>(({
  theme,
  danger,
  warn,
  active,
  golden,
}) => {
  const p = theme.palette;
  const color = danger
    ? p.error.main
    : warn
      ? p.warning.main
      : golden
        ? '#f59e0b'
        : active
          ? p.primary.main
          : p.text.secondary;
  return {
    borderRadius: 8,
    color,
    border: `1px solid ${alpha(color, danger || warn || active || golden ? 0.28 : 0.12)}`,
    backgroundColor: alpha(color, danger || warn || active || golden ? 0.08 : 0),
    transition: 'all 0.14s ease',
    '&:hover': {
      backgroundColor: alpha(color, 0.16),
      transform: 'scale(1.02)',
    },
    '&:active': { transform: 'scale(0.97)', color, backgroundColor: alpha(color, 0.16) },
  };
});

// ─── Component ────────────────────────────────────────────────────────────────

export function VoiceParticipantSettings({
  socketId,
  userId,
  displayName,
  avatarUrl,
  accountType,
  verified,
  isSelf,
  isHost = false,
  initialVolume = 100,
  onVolumeChange,
  isMicMuted,
  isHandRaised,
  onRaiseHand,
  onLowerHand,
  anchorEl,
  onClose,
  isUnreadPM,
  onClickPM,
}: VoiceParticipantSettingsProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useResponsive('down', 'sm');

  const { user, checkIfFollowing } = useCredentials();

  const { emit } = useSocketContext();

  const { userVoiceState, updateParticipantAudio } = useRoomTools();

  const [volume, setVolume] = useState(initialVolume);
  const [visible, setVisible] = useState(false);
  const [confirmTransfer, setConfirmTransfer] = useState(false);
  const [confirmKick, setConfirmKick] = useState(false);

  const popupRef = useRef<HTMLDivElement>(null);

  const { roomId } = userVoiceState;
  const isFollowing = checkIfFollowing(userId);

  const [followMutate, { isLoading: isLoadingFollow }] = useFollowMutation();
  const [unfollowMutate, { isLoading: isLoadingUnfollow }] = useUnfollowMutation();
  const [updateRoomHost, { isLoading: isLoadingTransferHost }] = useUpdateRoomMutation();

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleVolumeChange = useCallback(
    (_: Event, val: number | number[]) => {
      const v = val as number;
      setVolume(v);
      onVolumeChange(socketId, v);
    },
    [socketId, onVolumeChange]
  );

  const handleMuteToggle = useCallback(() => {
    emit('host-force-mute', {
      roomId,
      targetSocketId: socketId,
      targetUserId: userId,
      senderInfo: {
        name: user.name,
        userId: user.id,
      },
      receiverInfo: {
        name: displayName,
        userId,
      },
    });
    updateParticipantAudio({ userId, isMuted: true });
  }, [roomId, socketId, userId, user.name, displayName, user.id, emit, updateParticipantAudio]);

  const handleHandToggle = useCallback(
    () => (isHandRaised ? onLowerHand(socketId) : onRaiseHand(socketId)),
    [isHandRaised, socketId, onRaiseHand, onLowerHand]
  );

  const handlePrivateMessage = useCallback(() => {
    onClickPM();
  }, [onClickPM]);

  const handleKick = useCallback(() => {
    setConfirmKick(true);
  }, []);

  const handleConfirmKick = useCallback(
    (event: any) => {
      console.log('hello');
      event.stopPropagation();
      emit('host-kick-user', {
        roomId,
        targetSocketId: socketId,
        userId,
        name: displayName,
      });
    },
    [socketId, userId, roomId, displayName, emit]
  );

  const handleLike = useCallback(() => {
    emit('send-user-actions-in-voice', {
      type: 'reaction',
      roomId,
      senderInfo: {
        userId: user.id,
        name: user.name,
        emoji: '❤️',
      },
    });
  }, [user.id, user.name, roomId, emit]);

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

  const handleTransferHost = useCallback(() => {
    setConfirmTransfer(true);
  }, []);

  const handleConfirmTransfer = useCallback(async () => {
    await updateRoomHost({ roomId, host: userId });
    setConfirmTransfer(false);
    onClose();
  }, [roomId, userId, onClose, updateRoomHost]);

  // Enter animation
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Outside click
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (confirmTransfer) return; // don't close while confirm dialog is open
      if (confirmKick) return;
      if (popupRef.current && !popupRef.current.contains(e.target as Node) && anchorEl !== e.target)
        onClose();
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [anchorEl, onClose, confirmTransfer, confirmKick]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // ── Action definitions (shared between mobile + desktop) ─────────────────

  type ActionDef = {
    key: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    danger?: boolean;
    warn?: boolean;
    active?: boolean;
    golden?: boolean;
    disabled?: boolean;
    show: boolean;
    showBadge?: boolean;
  };

  const actions: ActionDef[] = [
    {
      key: 'mute',
      icon: isMicMuted ? <MicOff size={14} /> : <Mic size={14} />,
      label: 'Mute',
      onClick: handleMuteToggle,
      active: !isMicMuted,
      danger: isMicMuted,
      show: isHost && !isSelf,
      disabled: isMicMuted,
    },
    {
      key: 'private-message',
      icon: <MessageCircleIcon size={14} />,
      label: 'PM',
      onClick: handlePrivateMessage,
      warn: isHandRaised,
      show: !isSelf,
      showBadge: isUnreadPM,
    },
    {
      key: 'hand',
      icon: <Hand size={14} />,
      label: isHandRaised ? 'Lower hand' : 'Raise hand',
      onClick: handleHandToggle,
      warn: isHandRaised,
      show: isSelf,
    },
    {
      key: 'block',
      icon: <Heart size={14} color="red" />,
      label: 'Like',
      onClick: handleLike,
      show: !isSelf,
    },
    {
      key: 'transfer',
      icon: <Crown size={14} />,
      label: 'Make host',
      onClick: handleTransferHost,
      golden: true,
      show: isHost && !isSelf,
      disabled: isLoadingTransferHost,
    },
    {
      key: 'kick',
      icon: <UserMinus size={14} />,
      label: 'Kick',
      onClick: handleKick,
      danger: true,
      disabled: isSelf,
      show: isHost && !isSelf,
    },
  ].filter((a) => a.show);

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
          <AvatarUser
            name={displayName}
            avatarUrl={avatarUrl || null}
            accountType={accountType}
            verified={verified}
            sx={{
              width: isMobile ? 36 : 30,
              height: isMobile ? 36 : 30,
              fontSize: isMobile ? 14 : 12,
              fontWeight: 600,
              bgcolor: alpha(theme.palette.primary.main, 0.14),
              color: theme.palette.primary.main,
              flexShrink: 0,
            }}
          />
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
              size="small"
              startIcon={isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
              disabled={isLoadingFollow || isLoadingUnfollow}
              sx={{
                height: 28,
                fontSize: '0.7rem',
                fontWeight: 700,
                borderRadius: '20px',
                px: 1.25,
                color: isFollowing ? 'error.main' : 'primary.main',
                border: '1px solid',
                borderColor: isFollowing
                  ? alpha(theme.palette.error.main, 0.3)
                  : alpha(theme.palette.primary.main, 0.3),
                bgcolor: isFollowing
                  ? alpha(theme.palette.error.main, 0.07)
                  : alpha(theme.palette.primary.main, 0.07),
                '&:hover': {
                  bgcolor: isFollowing
                    ? alpha(theme.palette.error.main, 0.14)
                    : alpha(theme.palette.primary.main, 0.14),
                },
                whiteSpace: 'nowrap',
              }}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
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
      {actions.length > 0 &&
        (isMobile ? (
          <Box
            sx={{ px: 1.5, pb: 1.5, pt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}
          >
            {actions.map(
              ({
                key,
                icon,
                label,
                onClick,
                danger,
                warn,
                active,
                golden,
                disabled,
                showBadge,
              }) => {
                const p = theme.palette;
                const color = danger
                  ? p.error.main
                  : warn
                    ? p.warning.main
                    : golden
                      ? '#f59e0b'
                      : active
                        ? p.primary.main
                        : p.text.secondary;
                const button = (
                  <Button
                    key={key}
                    onClick={onClick}
                    disabled={disabled}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.25,
                      px: 1.25,
                      py: 0.875,
                      minHeight: 44,
                      borderRadius: '10px',
                      border: `1px solid ${alpha(color, danger || warn || active || golden ? 0.22 : 0.1)}`,
                      bgcolor: alpha(color, danger || warn || active || golden ? 0.07 : 0),
                      color,
                      cursor: 'pointer',
                      userSelect: 'none',
                      transition: 'opacity 0.12s, transform 0.12s',
                      '&:active': { opacity: 0.7, transform: 'scale(0.98)' },
                      '&.Mui-disabled': { opacity: 0.38 },
                    }}
                  >
                    <Badge
                      badgeContent="!"
                      color="error"
                      invisible={!showBadge}
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: 10,
                          minWidth: 12,
                          height: 14,
                          borderRadius: '50%',
                          top: -4,
                          right: -4,
                        },
                      }}
                    >
                      {icon}
                      <Typography
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'inherit',
                          lineHeight: 1,
                        }}
                      >
                        {label}
                      </Typography>
                    </Badge>
                  </Button>
                );
                return button;
              }
            )}
          </Box>
        ) : (
          <Box sx={{ px: 1.5, py: 1, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {actions.map(
              ({
                key,
                icon,
                label,
                onClick,
                danger,
                warn,
                active,
                golden,
                disabled,
                showBadge,
              }) => (
                <ActionBtn
                  key={key}
                  size="small"
                  danger={danger}
                  warn={warn}
                  active={active}
                  golden={golden}
                  onClick={onClick}
                  disabled={disabled}
                  startIcon={icon}
                  sx={{ flex: '1 1 calc(50% - 6px)', minWidth: 0 }}
                >
                  <Badge
                    badgeContent="!"
                    color="error"
                    invisible={!showBadge}
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: 10,
                        minWidth: 12,
                        height: 14,
                        borderRadius: '50%',
                        top: -4,
                        right: -4,
                      },
                    }}
                  >
                    {label}
                  </Badge>
                </ActionBtn>
              )
            )}
          </Box>
        ))}
    </Box>
  );

  // ── Transfer host confirm dialog ─────────────────────────────────────────

  const confirmDialog = (
    <Dialog
      open={confirmTransfer}
      onClose={() => setConfirmTransfer(false)}
      sx={{ zIndex: 1500 }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          maxWidth: 340,
          width: '100%',
          mx: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Box sx={{ color: '#f59e0b', display: 'flex' }}>
            <Crown size={20} />
          </Box>
          <Typography fontWeight={700} fontSize="1rem">
            Transfer Host
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <Typography variant="body2" color="text.secondary">
          Are you sure you want to make{' '}
          <Box component="span" fontWeight={700} color="text.primary">
            {displayName}
          </Box>{' '}
          the new host? You will lose your host privileges.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setConfirmTransfer(false)}
          sx={{ borderRadius: 2, flex: 1 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={handleConfirmTransfer}
          sx={{
            borderRadius: 2,
            flex: 1,
            bgcolor: '#f59e0b',
            '&:hover': { bgcolor: '#d97706' },
          }}
        >
          Make Host
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Kick confirm modal ___________________

  const confirmKickialog = (
    <Dialog
      open={confirmKick}
      onClose={() => setConfirmKick(false)}
      sx={{ zIndex: 1500 }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          maxWidth: 340,
          width: '100%',
          mx: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Box sx={{ color: '#f59e0b', display: 'flex' }}>
            <UserMinus size={20} />
          </Box>
          <Typography fontWeight={700} fontSize="1rem">
            Kick Confirm.
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <Typography variant="body2" color="text.secondary">
          Are you sure you want to kick{' '}
          <Box component="span" fontWeight={700} color="text.primary">
            {displayName}
          </Box>{' '}
          from the voice room?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setConfirmKick(false)}
          sx={{ borderRadius: 2, flex: 1 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={handleConfirmKick}
          sx={{
            borderRadius: 2,
            flex: 1,
            bgcolor: '#f59e0b',
            '&:hover': { bgcolor: '#d97706' },
          }}
        >
          Kick
        </Button>
      </DialogActions>
    </Dialog>
  );

  // ── Mobile: bottom sheet ─────────────────────────────────────────────────

  if (isMobile) {
    return (
      <Portal>
        <Backdrop onClick={onClose} sx={{ opacity: visible ? 1 : 0 }} />
        <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
          <Sheet ref={popupRef} role="dialog" aria-label={`Controls for ${displayName}`}>
            {content}
          </Sheet>
        </Slide>
        {confirmDialog}
        {confirmKickialog}
      </Portal>
    );
  }

  // ── Desktop: floating popup ──────────────────────────────────────────────

  return (
    <>
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
      {confirmDialog}
      {confirmKickialog}
    </>
  );
}

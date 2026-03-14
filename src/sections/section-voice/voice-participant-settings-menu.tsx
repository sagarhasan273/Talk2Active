import type { UserType } from 'src/types/type-user';

import React, { useRef, useState } from 'react';

import Portal from '@mui/material/Portal';
import { useTheme } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, alpha, Tooltip, IconButton } from '@mui/material';

import { useWebRTCContext } from 'src/core/contexts/webRTC-context';
import { useSocketContext } from 'src/core/contexts/socket-context';

import { VoiceParticipantSettings } from './voice-participant-settings';

export type HostActionType = 'mute' | 'kick' | 'block-mic';

type Props = {
  targetSocketId: string;
  targetUserId: string;
  targetName: string;
  targetProfilePhoto?: string | null;
  targetAccountType?: UserType['accountType'];
  targetVerified?: boolean;
  onAction?: (action: HostActionType, targetSocketId: string) => void;
  isHost?: boolean;
};

export function VoiceParticipantSettingsMenu({
  targetSocketId,
  targetUserId,
  targetName,
  targetAccountType,
  targetProfilePhoto,
  targetVerified,
  isHost,
  onAction,
}: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { socket } = useSocketContext();
  const { remoteAudioSettings, setRemoteVolume } = useWebRTCContext();

  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  // ── Position popup relative to the trigger button (desktop only) ────────
  // On mobile the Sheet is position:fixed full-width — no positioning needed.
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

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen((prev) => !prev);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 2,
        right: 2,
        transition: 'opacity 0.15s',
      }}
    >
      <Tooltip title="Participant actions" arrow placement="top">
        <IconButton
          ref={anchorRef}
          size="small"
          onClick={handleOpen}
          sx={{
            width: 24,
            height: 24,
            borderRadius: '6px',
            color: 'text.secondary',
            '&:hover': {
              bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
            },
          }}
        >
          <MoreVertIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Tooltip>

      {/* FIX: render popup in a Portal — bypasses any parent stacking context.
          On mobile: ParticipantPopup renders a fixed Sheet + Backdrop covering
          the full viewport. On desktop: absolutely positioned below the trigger. */}
      {open && (
        <Portal>
          <Box onClick={(e) => e.stopPropagation()} style={getPopupStyle()}>
            <VoiceParticipantSettings
              socketId={targetSocketId}
              displayName={targetName}
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
              isHandRaised={false}
              onRaiseHand={() => {}}
              onLowerHand={() => {}}
              onKick={(id) => {
                socket?.emit('host-kick-user', { targetSocketId: id });
                onAction?.('kick', id);
              }}
              onBlock={(id) => {
                socket?.emit('host-block-mic', { targetSocketId: id });
                onAction?.('block-mic', id);
              }}
              isBlocked={false}
              isFollowing={false}
              onFollow={() => {}}
              onUnfollow={() => {}}
              onClose={handleClose}
            />
          </Box>
        </Portal>
      )}
    </Box>
  );
}

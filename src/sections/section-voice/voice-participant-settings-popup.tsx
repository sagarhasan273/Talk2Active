import type { UserType } from 'src/types/type-user';

import React, { useRef, useState } from 'react';

import Portal from '@mui/material/Portal';
import { useTheme } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, alpha, Badge, Tooltip, IconButton } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useRoomTools } from 'src/core/slices';
import { useWebRTCContext } from 'src/core/contexts/webRTC-context';

import { VoiceRoomMessageGroupDrawer } from 'src/components/drawers';

import { VoiceMessageGroup } from './voice-message-group';
import { VoiceParticipantSettings } from './voice-participant-settings';

// ─── Constants ────────────────────────────────────────────────────────────────

export type HostActionType = 'mute' | 'kick' | 'block-mic';

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  targetSocketId: string;
  targetUserId: string;
  targetName: string;
  targetProfilePhoto: UserType['profilePhoto'];
  targetAccountType: UserType['accountType'];
  targetVerified: UserType['verified'];
  targetIsMuted: boolean;
  isHost?: boolean;
  isSelf?: boolean;
  hasJoin: boolean;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function VoiceParticipantSettingsPopup({
  targetSocketId,
  targetUserId,
  targetName,
  targetAccountType,
  targetVerified,
  targetProfilePhoto,
  targetIsMuted,
  isHost,
  isSelf = false,
  hasJoin,
}: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { remoteAudioSettings, setRemoteVolume } = useWebRTCContext();

  const { privateMessageFor } = useRoomTools();

  const privateMessageOpen = useBoolean();

  // ── Settings popup ───────────────────────────────────────────────────────
  const [settingsOpen, setSettingsOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

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

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Box sx={{ position: 'absolute', top: 2, right: 2, transition: 'opacity 0.15s' }}>
      {/* ── Trigger ───────────────────────────────────────────────────── */}
      <Tooltip title="Participant actions" arrow placement="top">
        <Badge
          badgeContent="!"
          color="error"
          invisible={privateMessageFor !== targetUserId}
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
          <IconButton
            ref={anchorRef}
            size="small"
            onClick={handleSettingsOpen}
            sx={{
              width: 24,
              height: 24,
              borderRadius: '6px',
              color: 'text.secondary',
              '&:hover': { bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.16) },
              '&:active': { bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.16) },
            }}
          >
            <SettingsIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Badge>
      </Tooltip>

      {/* ── Settings popup (Portal) ────────────────────────────────────── */}
      {settingsOpen && (
        <Portal>
          <Box onClick={(e) => e.stopPropagation()} style={getPopupStyle()}>
            <VoiceParticipantSettings
              socketId={targetSocketId}
              userId={targetUserId}
              displayName={targetName}
              accountType={targetAccountType}
              verified={targetVerified}
              isSelf={isSelf}
              isHost={isHost}
              allowKick={hasJoin}
              avatarUrl={targetProfilePhoto}
              anchorEl={anchorRef.current}
              initialVolume={remoteAudioSettings[targetSocketId]?.volume ?? 100}
              onVolumeChange={(id, vol) => {
                setRemoteVolume(id, vol);
              }}
              isMicMuted={targetIsMuted}
              onClose={() => setSettingsOpen(false)}
              isUnreadPM={privateMessageFor === targetUserId}
              onClickPM={() => {
                privateMessageOpen.onTrue();
                setSettingsOpen(false);
              }}
            />
          </Box>
        </Portal>
      )}

      <VoiceRoomMessageGroupDrawer openDrawer={privateMessageOpen}>
        <VoiceMessageGroup
          privateMessage={{
            userId: targetUserId,
            socketId: targetSocketId,
            name: targetName,
            profilePhoto: targetProfilePhoto,
          }}
        />
      </VoiceRoomMessageGroupDrawer>
    </Box>
  );
}

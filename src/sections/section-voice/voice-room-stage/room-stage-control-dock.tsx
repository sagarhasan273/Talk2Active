// src/sections/section-voice/voice-room-stage/room-stage-control-dock.tsx

import {
  Headphones,
  MessageSquare,
  Mic,
  MicOff,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  Smile,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';

import useRoomSounds from '@/hooks/use-room-sounds';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { Box, Button, IconButton, Popover, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Track } from 'livekit-client';

type RoomControlDockProps = {
  handRaised: boolean;
  isScreenSharing?: boolean;
  onToggleRaiseHand: () => void;
  onToggleScreenShare?: () => void;
  onSendReaction?: (emoji: string) => void;
  onToggleChat?: () => void;
  onLeave?: () => void;
};

const REACTION_EMOJIS = ['👍', '❤️', '👏', '🔥', '🎉', '😂'];

export const RoomControlDock: React.FC<RoomControlDockProps> = ({
  handRaised,
  isScreenSharing = false,
  onToggleRaiseHand,
  onToggleScreenShare,
  onSendReaction,
  onToggleChat,
  onLeave,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === 'dark';

  const { playToggleMute, playToggleDeafen } = useRoomSounds();

  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null);

  // LiveKit hooks for local mic and deafen controls
  const room = useRoomContext();
  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();
  const [deafened, setDeafened] = useState(false);

  const micMuted = !isMicrophoneEnabled;

  const surfaceBg = isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04);
  const surfaceBorder = isDark ? alpha('#fff', 0.09) : alpha('#000', 0.09);

  const handleToggleMic = useCallback(async () => {
    if (!localParticipant) return;
    try {
      await localParticipant.setMicrophoneEnabled(micMuted);
      playToggleMute(micMuted);
    } catch (err) {
      console.error('Failed to toggle microphone:', err);
    }
  }, [localParticipant, micMuted, playToggleMute]);

  const handleToggleDeafen = useCallback(() => {
    if (!room) return;

    setDeafened((prevDeafened) => {
      const nextDeafened = !prevDeafened;

      // 🔊 Trigger sound based on the new deafen state
      playToggleDeafen(nextDeafened);

      room.remoteParticipants.forEach((participant) => {
        participant.trackPublications.forEach((publication) => {
          if (publication.source === Track.Source.Microphone && publication.track) {
            const mediaStreamTrack = publication.track.mediaStreamTrack;
            if (mediaStreamTrack) {
              mediaStreamTrack.enabled = !nextDeafened;
            }
          }
        });
      });

      if (nextDeafened && isMicrophoneEnabled) {
        localParticipant?.setMicrophoneEnabled(false);
      }

      return nextDeafened;
    });
  }, [room, isMicrophoneEnabled, localParticipant, playToggleDeafen]);

  const buttonSx = {
    width: { xs: 40, sm: 42 },
    height: { xs: 40, sm: 42 },
    p: 0,
    borderRadius: 1.5,
    bgcolor: surfaceBg,
    border: '1px solid',
    borderColor: surfaceBorder,
    color: 'text.primary',
    flexShrink: 0,
    transition: 'all 0.18s ease',
    '&:hover': {
      bgcolor: alpha(theme.palette.primary.main, 0.12),
      borderColor: alpha(theme.palette.primary.main, 0.4),
      color: 'primary.main',
      transform: 'translateY(-1px)',
    },
  };

  return (
    <>
      <Box
        sx={{
          mx: { xs: 1, sm: 2 },
          mb: { xs: 1, sm: 1.5 },
          mt: 0.5,
          px: { xs: 1.25, sm: 2 },
          py: { xs: 1, sm: 1.25 },
          borderRadius: 2,
          backdropFilter: 'blur(16px)',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
          boxShadow: isDark
            ? '0 8px 24px -4px rgba(0, 0, 0, 0.45)'
            : '0 8px 24px -4px rgba(145, 158, 171, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 0.75, sm: 1.25 },
        }}
      >
        {/* Left: Audio Inputs */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1 } }}>
          <Tooltip title={micMuted ? 'Unmute microphone' : 'Mute microphone'} arrow>
            <IconButton
              onClick={handleToggleMic}
              sx={{
                ...buttonSx,
                bgcolor: micMuted ? alpha(theme.palette.error.main, 0.16) : surfaceBg,
                borderColor: micMuted ? alpha(theme.palette.error.main, 0.35) : surfaceBorder,
                color: micMuted ? 'error.main' : 'text.primary',
                '&:hover': {
                  bgcolor: micMuted
                    ? alpha(theme.palette.error.main, 0.25)
                    : alpha(theme.palette.primary.main, 0.12),
                  borderColor: micMuted ? 'error.main' : alpha(theme.palette.primary.main, 0.4),
                  color: micMuted ? 'error.main' : 'primary.main',
                },
              }}
            >
              {micMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </IconButton>
          </Tooltip>

          <Tooltip title={deafened ? 'Undeafen' : 'Deafen (Mute sound)'} arrow>
            <IconButton
              onClick={handleToggleDeafen}
              sx={{
                ...buttonSx,
                color: deafened ? 'error.main' : 'text.primary',
                bgcolor: deafened ? alpha(theme.palette.error.main, 0.16) : surfaceBg,
                borderColor: deafened ? alpha(theme.palette.error.main, 0.35) : surfaceBorder,
                '&:hover, &:focus, &:active, &.Mui-focusVisible': {
                  bgcolor: deafened
                    ? alpha(theme.palette.error.main, 0.25)
                    : alpha(theme.palette.primary.main, 0.12),
                  color: deafened ? 'error.main' : 'primary.main',
                  borderColor: deafened ? 'error.main' : alpha(theme.palette.primary.main, 0.4),
                },
              }}
            >
              <Headphones size={18} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Center: Stage Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1 } }}>
          <Button
            size="small"
            disableElevation
            onClick={onToggleRaiseHand}
            startIcon={<span style={{ fontSize: 14, lineHeight: 1 }}>✋</span>}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 1.5,
              px: { xs: 0, sm: 1.75 },
              minWidth: { xs: 40, sm: 'auto' },
              width: { xs: 40, sm: 'auto' },
              height: { xs: 40, sm: 42 },
              bgcolor: handRaised ? alpha(theme.palette.warning.main, 0.18) : surfaceBg,
              color: handRaised ? 'warning.main' : 'text.primary',
              border: '1px solid',
              borderColor: handRaised ? alpha(theme.palette.warning.main, 0.45) : surfaceBorder,
              transition: 'all 0.18s ease',
              '& .MuiButton-startIcon': {
                mr: { xs: 0, sm: 0.75 },
                ml: 0,
              },
              '&:hover, &:focus, &:active, &.Mui-focusVisible': {
                bgcolor: handRaised
                  ? alpha(theme.palette.warning.main, 0.26)
                  : alpha(theme.palette.primary.main, 0.12),
                borderColor: handRaised ? 'warning.main' : alpha(theme.palette.primary.main, 0.4),
              },
            }}
          >
            {isMobile ? null : handRaised ? 'Lower Hand' : 'Raise Hand'}
          </Button>

          <Tooltip title="Send reaction" arrow>
            <IconButton onClick={(e) => setEmojiAnchor(e.currentTarget)} sx={buttonSx}>
              <Smile size={18} />
            </IconButton>
          </Tooltip>

          {/* Screen Share: Hidden on mobile browsers */}
          {!isMobile && (
            <Tooltip title={isScreenSharing ? 'Stop screen share' : 'Share screen'} arrow>
              <IconButton
                onClick={onToggleScreenShare}
                sx={{
                  ...buttonSx,
                  bgcolor: isScreenSharing
                    ? alpha(theme.palette.primary.main, 0.18)
                    : surfaceBg,
                  borderColor: isScreenSharing
                    ? alpha(theme.palette.primary.main, 0.45)
                    : surfaceBorder,
                  color: isScreenSharing ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    bgcolor: isScreenSharing
                      ? alpha(theme.palette.primary.main, 0.26)
                      : alpha(theme.palette.primary.main, 0.12),
                  },
                }}
              >
                {isScreenSharing ? <ScreenShareOff size={18} /> : <ScreenShare size={18} />}
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Right: Chat Drawer Toggle & Room Exit */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1 } }}>
          <IconButton
            onClick={onToggleChat}
            sx={{ ...buttonSx, display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MessageSquare size={18} />
          </IconButton>

          <Button
            onClick={onLeave}
            disableElevation
            startIcon={<PhoneOff size={16} />}
            sx={{
              px: { xs: 0, sm: 2 },
              minWidth: { xs: 40, sm: 'auto' },
              width: { xs: 40, sm: 'auto' },
              height: { xs: 40, sm: 42 },
              borderRadius: 1.5,
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: alpha(theme.palette.error.main, 0.14),
              color: 'error.main',
              border: '1px solid',
              borderColor: alpha(theme.palette.error.main, 0.3),
              transition: 'all 0.18s ease',
              '& .MuiButton-startIcon': {
                mr: { xs: 0, sm: 0.75 },
                ml: 0,
              },
              '&:hover': {
                bgcolor: 'error.main',
                color: '#fff',
                borderColor: 'error.main',
              },
            }}
          >
            {isMobile ? null : 'Leave'}
          </Button>
        </Box>
      </Box >

      {/* Floating Reaction Popover */}
      < Popover
        open={Boolean(emojiAnchor)}
        anchorEl={emojiAnchor}
        onClose={() => setEmojiAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: {
              mb: 1,
              p: 0.75,
              display: 'flex',
              gap: 0.5,
              borderRadius: 2.5,
              bgcolor: isDark ? alpha('#1a1f2b', 0.95) : '#ffffff',
              backdropFilter: 'blur(16px)',
              border: '1px solid',
              borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
              boxShadow: isDark
                ? '0 12px 28px rgba(0, 0, 0, 0.5)'
                : '0 12px 28px rgba(145, 158, 171, 0.2)',
            },
          },
        }}
      >
        {
          REACTION_EMOJIS.map((emoji) => (
            <IconButton
              key={emoji}
              size="small"
              onClick={() => {
                onSendReaction?.(emoji);
                setEmojiAnchor(null);
              }}
              sx={{
                fontSize: 20,
                p: 0.75,
                borderRadius: 1.5,
                transition: 'transform 0.15s ease',
                '&:hover': {
                  transform: 'scale(1.2)',
                  bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                },
              }}
            >
              {emoji}
            </IconButton>
          ))
        }
      </Popover >
    </>
  );
};

export default RoomControlDock;

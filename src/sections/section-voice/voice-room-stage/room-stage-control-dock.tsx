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

  // Soft grey background specifically for mobile buttons
  const mobileGreyBg = isDark
    ? theme.palette.grey[700]
    : theme.palette.grey[200];

  const handleToggleMic = useCallback(async () => {
    if (!localParticipant) return;
    try {
      await localParticipant.setMicrophoneEnabled(micMuted);
      playToggleMute(micMuted);
    } catch (err) {
      console.error('Failed to toggle microphone:', err);
    }
  }, [localParticipant, micMuted]);

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
    width: { xs: 38, sm: 40 },
    height: { xs: 38, sm: 40 },
    p: 0,
    borderRadius: 1,
    bgcolor: { xs: mobileGreyBg, sm: 'background.paper' },
    border: '1px solid',
    borderColor: theme.palette.divider,
    color: 'text.primary',
    flexShrink: 0,
    transition: 'all 0.15s ease',
    '&:hover': {
      bgcolor: alpha(theme.palette.primary.main, 0.08),
      color: 'primary.main',
    },
  };

  return (
    <>
      <Box
        sx={{
          m: 1,
          p: { xs: 1, sm: 1 },
          borderRadius: 1,
          bgcolor: isMobile ? 'background.paper' : alpha(theme.palette.text.primary, 0.03),
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 0.5, sm: 1 },
        }}
      >
        {/* Left: Audio Inputs */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          <Tooltip title={micMuted ? 'Unmute microphone' : 'Mute microphone'}>
            <IconButton
              onClick={handleToggleMic}
              sx={{
                ...buttonSx,
                bgcolor: micMuted
                  ? 'error.main'
                  : { xs: mobileGreyBg, sm: 'background.paper' },
                color: micMuted ? '#fff' : 'text.primary',
                '&:hover': {
                  bgcolor: micMuted ? 'error.dark' : alpha(theme.palette.primary.main, 0.12),
                },
              }}
            >
              {micMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </IconButton>
          </Tooltip>

          <Tooltip title={deafened ? 'Undeafen' : 'Deafen (Mute sound)'}>
            <IconButton
              onClick={handleToggleDeafen}
              sx={{
                ...buttonSx,
                color: deafened ? '#fff' : 'text.primary',
                bgcolor: deafened
                  ? 'error.main'
                  : { xs: mobileGreyBg, sm: 'background.paper' },
                border: '1px solid',
                borderColor: deafened
                  ? 'error.main'
                  : theme.palette.divider,
                '&:hover, &:focus, &:active, &.Mui-focusVisible': {
                  bgcolor: deafened
                    ? 'error.dark'
                    : alpha(theme.palette.primary.main, 0.08),
                  color: deafened ? '#fff' : 'primary.main',
                  borderColor: deafened ? 'error.dark' : undefined,
                },
              }}
            >
              <Headphones size={18} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Center: Stage Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          <Button
            size="small"
            onClick={onToggleRaiseHand}
            startIcon={<span style={{ fontSize: 14, lineHeight: 1 }}>✋</span>}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: 12,
              borderRadius: 1,
              px: { xs: 0, sm: 1.5 },
              minWidth: { xs: 38, sm: 'auto' },
              width: { xs: 38, sm: 'auto' },
              height: { xs: 38, sm: 40 },
              bgcolor: handRaised
                ? 'warning.main'
                : { xs: mobileGreyBg, sm: 'background.paper' },
              color: handRaised ? 'common.black' : 'text.primary',
              border: '1px solid',
              borderColor: handRaised
                ? 'warning.dark'
                : theme.palette.divider,
              '& .MuiButton-startIcon': {
                mr: { xs: 0, sm: 0.75 },
                ml: 0,
              },
              '&:hover, &:focus, &:active, &.Mui-focusVisible': {
                bgcolor: handRaised ? 'warning.dark' : alpha(theme.palette.primary.main, 0.08),
                borderColor: handRaised ? 'warning.dark' : undefined,
              },
            }}
          >
            {isMobile ? null : handRaised ? 'Lower' : 'Raise'}
          </Button>

          <Tooltip title="Send reaction">
            <IconButton onClick={(e) => setEmojiAnchor(e.currentTarget)} sx={buttonSx}>
              <Smile size={18} />
            </IconButton>
          </Tooltip>

          {/* Screen Share: Hidden on mobile browsers */}
          {!isMobile && (
            <Tooltip title={isScreenSharing ? 'Stop screen share' : 'Share screen'}>
              <IconButton
                onClick={onToggleScreenShare}
                sx={{
                  ...buttonSx,
                  bgcolor: isScreenSharing ? 'primary.main' : 'background.paper',
                  color: isScreenSharing ? '#fff' : 'text.primary',
                  '&:hover': {
                    bgcolor: isScreenSharing
                      ? 'primary.dark'
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          <IconButton
            onClick={onToggleChat}
            sx={{ ...buttonSx, display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MessageSquare size={18} />
          </IconButton>

          <Button
            onClick={onLeave}
            startIcon={<PhoneOff size={16} />}
            sx={{
              px: { xs: 0, sm: 2 },
              minWidth: { xs: 38, sm: 'auto' },
              width: { xs: 38, sm: 'auto' },
              height: { xs: 38, sm: 40 },
              borderRadius: 1,
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: 'error.main',
              color: '#fff',
              '& .MuiButton-startIcon': {
                mr: { xs: 0, sm: 0.75 },
                ml: 0,
              },
              '&:hover': { bgcolor: 'error.dark' },
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
              p: 0.5,
              display: 'flex',
              gap: 0.5,
              borderRadius: 3,
              boxShadow: theme.shadows[6],
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
              sx={{ fontSize: 20, p: 0.75, borderRadius: 2 }}
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

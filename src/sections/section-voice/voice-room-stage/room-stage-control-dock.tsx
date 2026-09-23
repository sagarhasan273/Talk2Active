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
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null);

  // LiveKit hooks for local mic and deafen controls
  const room = useRoomContext();
  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();
  const [deafened, setDeafened] = useState(false);

  // isMicrophoneEnabled is true when speaking/active; micMuted is the inverted state
  const micMuted = !isMicrophoneEnabled;

  const handleToggleMic = useCallback(async () => {
    if (!localParticipant) return;
    try {
      await localParticipant.setMicrophoneEnabled(micMuted);
    } catch (err) {
      console.error('Failed to toggle microphone:', err);
    }
  }, [localParticipant, micMuted]);

  const handleToggleDeafen = useCallback(() => {
    if (!room) return;

    setDeafened((prevDeafened) => {
      const nextDeafened = !prevDeafened;

      // Mute or unmute incoming audio elements from remote participants
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

      // Automatically mute local mic when deafened
      if (nextDeafened && isMicrophoneEnabled) {
        localParticipant?.setMicrophoneEnabled(false);
      }

      return nextDeafened;
    });
  }, [room, isMicrophoneEnabled, localParticipant]);

  const buttonSx = {
    p: { xs: 0.9, sm: 1.1 },
    borderRadius: 1,
    bgcolor: 'background.paper',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    color: 'text.primary',
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
          p: { xs: 0.75, sm: 1 },
          borderRadius: 1,
          bgcolor: alpha(theme.palette.text.primary, 0.03),
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
                bgcolor: micMuted ? 'error.main' : 'background.paper',
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
                color: deafened ? 'error.main' : 'text.primary',
                bgcolor: deafened ? alpha(theme.palette.error.main, 0.15) : 'background.paper',
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
            startIcon={<span style={{ fontSize: 14 }}>✋</span>}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: 12,
              borderRadius: 1,
              px: { xs: 1, sm: 1.5 },
              minWidth: 'auto',
              height: 1,
              bgcolor: handRaised ? 'warning.main' : 'background.paper',
              color: handRaised ? 'common.black' : 'text.primary',
              border: `1px solid ${handRaised ? theme.palette.warning.dark : alpha(theme.palette.divider, 0.1)
                }`,
              '&:hover': {
                bgcolor: handRaised ? 'warning.dark' : alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            {isMobile ? '' : handRaised ? 'Lower' : 'Raise'}
          </Button>

          <Tooltip title="Send reaction">
            <IconButton onClick={(e) => setEmojiAnchor(e.currentTarget)} sx={buttonSx}>
              <Smile size={18} />
            </IconButton>
          </Tooltip>

          {/* Screen Share: Hidden on mobile browsers where display capture is unsupported */}
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
              px: { xs: 1.25, sm: 2 },
              minWidth: 'auto',
              borderRadius: 1,
              fontSize: 12,
              fontWeight: 700,
              height: '32px',
              textTransform: 'none',
              bgcolor: 'error.main',
              color: '#fff',
              '&:hover': { bgcolor: 'error.dark' },
            }}
          >
            {isMobile ? '' : 'Leave'}
          </Button>
        </Box>
      </Box>

      {/* Floating Reaction Popover */}
      <Popover
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
        {REACTION_EMOJIS.map((emoji) => (
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
        ))}
      </Popover>
    </>
  );
};

export default RoomControlDock;
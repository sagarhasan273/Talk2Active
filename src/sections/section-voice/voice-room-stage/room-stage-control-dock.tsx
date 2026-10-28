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
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useVoiceRoomSetting } from '@/core/contexts';
import useRoomSounds from '@/hooks/use-room-sounds';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import {
  Box,
  Button,
  IconButton,
  Popover,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  type RemoteParticipant,
  type RemoteTrack,
  type RemoteTrackPublication,
  RoomEvent,
  Track,
} from 'livekit-client';

type RoomControlDockProps = {
  handRaised: boolean;
  isScreenSharing?: boolean;
  onToggleRaiseHand: () => void;
  onToggleScreenShare?: () => void;
  onSendReaction?: (emoji: string) => void;
  onToggleChat?: () => void;
};

const REACTION_EMOJIS = ['👍', '❤️', '👏', '🔥', '🎉', '😂'];

export const RoomControlDock: React.FC<RoomControlDockProps> = ({
  handRaised,
  isScreenSharing = false,
  onToggleRaiseHand,
  onToggleScreenShare,
  onSendReaction,
  onToggleChat,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === 'dark';

  const { handleLeaveRoom } = useVoiceRoomSetting();

  const { playToggleMute, playToggleDeafen } = useRoomSounds();

  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null);
  const [leaveAnchorEl, setLeaveAnchorEl] = useState<HTMLElement | null>(null);

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

  // ── FIX 1a: When deafening, automatically force the mic to mute ──
  const handleToggleDeafen = useCallback(() => {
    setDeafened((prev) => {
      const next = !prev;
      if (next && localParticipant?.isMicrophoneEnabled) {
        localParticipant.setMicrophoneEnabled(false);
      }
      return next;
    });
  }, [localParticipant]);

  // ── FIX 1b: Synchronize deafen state with remote tracks safely ──
  const prevDeafenedRef = useRef(deafened);

  useEffect(() => {
    if (prevDeafenedRef.current === deafened) return;
    prevDeafenedRef.current = deafened;

    playToggleDeafen(deafened);

    if (!room) return;

    room.remoteParticipants.forEach((participant) => {
      participant.trackPublications.forEach((pub) => {
        if (pub.source === Track.Source.Microphone && pub.track) {
          const mediaTrack = pub.track.mediaStreamTrack;
          if (mediaTrack) mediaTrack.enabled = !deafened;
        }
      });
    });
  }, [deafened, room, playToggleDeafen]);

  // ── FIX 1c: When mic becomes opened (unmuted), automatically undeafen ──
  const prevMicEnabled = useRef(isMicrophoneEnabled);
  useEffect(() => {
    if (isMicrophoneEnabled && !prevMicEnabled.current) {
      if (deafened) {
        setDeafened(false);
      }
    }
    prevMicEnabled.current = isMicrophoneEnabled;
  }, [isMicrophoneEnabled, deafened]);

  // ── FIX 1d: keep new joiners / late-unmutes muted while deafened. ──
  useEffect(() => {
    if (!deafened || !room) return undefined;

    const muteRemoteMic = (participant: RemoteParticipant) => {
      participant.trackPublications.forEach((pub) => {
        if (pub.source === Track.Source.Microphone && pub.track) {
          const mediaTrack = pub.track.mediaStreamTrack;
          if (mediaTrack) mediaTrack.enabled = false;
        }
      });
    };

    const handleParticipantConnected = (participant: RemoteParticipant) => {
      muteRemoteMic(participant);
    };

    const handleTrackSubscribed = (
      track: RemoteTrack,
      pub: RemoteTrackPublication,
      _participant: RemoteParticipant
    ) => {
      if (pub.source === Track.Source.Microphone) {
        const mediaTrack = track.mediaStreamTrack;
        if (mediaTrack) mediaTrack.enabled = false;
      }
    };

    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);

    // Apply immediately to anyone already in the room
    room.remoteParticipants.forEach(muteRemoteMic);

    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    };
  }, [deafened, room]);

  const buttonSx = {
    width: 28,
    height: 28,
    p: 0,
    borderRadius: 0.5,
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
          mx: { xs: 1, sm: 'auto' },
          mb: { xs: 1, sm: 1.5 },
          mt: 0.5,
          px: { xs: 1, sm: 1 },
          py: { xs: 1, sm: 1 },
          borderRadius: 0.5,
          backdropFilter: { xs: 'none', sm: 'blur(16px)' },
          bgcolor: isMobile
            ? isDark
              ? alpha('#181c26', 0.96)
              : alpha('#ffffff', 0.98)
            : 'background.paper',
          border: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
          boxShadow: isDark
            ? '0 8px 24px -4px rgba(0, 0, 0, 0.45)'
            : '0 8px 24px -4px rgba(145, 158, 171, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 'sm',
          gap: { xs: 1, sm: 4 },
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
              {micMuted ? <MicOff size={14} /> : <Mic size={14} />}
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
              <Headphones size={14} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Center: Stage Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1 } }}>
          <Button
            size="small"
            disableElevation
            onClick={onToggleRaiseHand}
            startIcon={<span style={{ fontSize: 12, lineHeight: 1 }}>✋</span>}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 12,
              borderRadius: 0.5,
              px: { xs: 0, sm: 1 },
              minWidth: { xs: 28, sm: 'auto' },
              width: { xs: 28, sm: 'auto' },
              height: 28,
              bgcolor: handRaised ? alpha(theme.palette.warning.main, 0.18) : surfaceBg,
              color: handRaised ? 'warning.main' : 'text.primary',
              border: '1px solid',
              borderColor: handRaised ? alpha(theme.palette.warning.main, 0.45) : surfaceBorder,
              transition: 'all 0.18s ease',
              '& .MuiButton-startIcon': {
                mr: { xs: 0, sm: 0.5 },
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
              <Smile size={14} />
            </IconButton>
          </Tooltip>

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
                {isScreenSharing ? <ScreenShareOff size={14} /> : <ScreenShare size={14} />}
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
            <MessageSquare size={14} />
          </IconButton>

          <Button
            onClick={(e) => setLeaveAnchorEl(e.currentTarget)}
            disableElevation
            startIcon={<PhoneOff size={12} />}
            sx={{
              px: { xs: 0, sm: 1 },
              minWidth: { xs: 28, sm: 'auto' },
              width: { xs: 28, sm: 'auto' },
              height: 28,
              borderRadius: 0.5,
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: alpha(theme.palette.error.main, 0.14),
              color: 'error.main',
              border: '1px solid',
              borderColor: alpha(theme.palette.error.main, 0.3),
              transition: 'all 0.18s ease',
              '& .MuiButton-startIcon': {
                mr: { xs: 0, sm: 0.5 },
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
        {REACTION_EMOJIS.map((emoji) => (
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
              borderRadius: 0.5,
              transition: 'transform 0.15s ease',
              '&:hover': {
                transform: 'scale(1.2)',
                bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
              },
            }}
          >
            {emoji}
          </IconButton>
        ))}
      </Popover>

      {/* Leave Confirmation Popover */}
      <Popover
        open={Boolean(leaveAnchorEl)}
        anchorEl={leaveAnchorEl}
        onClose={() => setLeaveAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mb: 1,
              p: 2,
              borderRadius: 0.75,
              minWidth: 220,
              bgcolor: isDark ? '#181c26' : '#ffffff',
              border: '1px solid',
              borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
              boxShadow: isDark
                ? '0 8px 32px rgba(0,0,0,0.6)'
                : '0 8px 24px rgba(15,23,42,0.1)',
              backgroundImage: 'none',
            },
          },
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 800, mb: 0.5, color: isDark ? 'text.primary' : '#0f172a' }}
        >
          Leave Room?
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{ color: isDark ? 'text.secondary' : '#475569', display: 'block', mb: 2.5 }}
        >
          Are you sure you want to disconnect?
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            size="small"
            color="inherit"
            onClick={() => setLeaveAnchorEl(null)}
            sx={{ height: 26, fontWeight: 600, textTransform: 'none', borderRadius: 0.5 }}
          >
            Cancel
          </Button>
          <Button
            size="small"
            color="error"
            variant="contained"
            disableElevation
            onClick={() => {
              setLeaveAnchorEl(null);
              handleLeaveRoom();
            }}
            sx={{ height: 26, fontWeight: 700, textTransform: 'none', borderRadius: 0.5 }}
          >
            Leave
          </Button>
        </Stack>
      </Popover>
    </>
  );
};

export default RoomControlDock;

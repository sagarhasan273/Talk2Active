// src/sections/section-voice/voice-room-user-controller/user-controller-remote.tsx

import { useRemoteParticipant, useRoomContext } from '@livekit/components-react';
import {
  Chat as ChatIcon,
  Gavel as GavelIcon,
  Headset as HeadsetIcon,
  HeadsetOff as HeadsetOffIcon,
  PersonRemoveTwoTone as KickIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  StarRounded as StarIcon,
  VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import {
  alpha,
  Box,
  Button,
  IconButton,
  Paper,
  Slider,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { ParticipantEvent, Track } from 'livekit-client';
import React, { useEffect, useState } from 'react';

import { ButtonRelationshipToggle } from '@/components/buttons';
import ButtonBlockUser from '@/components/buttons/button-block-user';
import ButtonReportUser from '@/components/buttons/button-report-user';
import { useCredentials, useRoomTools } from '@/core/slices';
import { ParticipantStageType } from '@/types/type-room';
import { fDateTime } from '@/utils/format-time';
import {
  getStoredVolume,
  setStoredVolume,
} from './hook-participant-audio-controller';

interface RoomUserControllerRemoteProps {
  user: ParticipantStageType;
  onBlock?: (userId: string) => void;
  onReport?: (userId: string) => void;
  onVolumeChange?: (userId: string, volume: number) => void;
  onToggleDeafen?: (userId: string) => void;
  onShare?: (userId: string) => void;
  onKickParticipant?: (userId: string) => void;
  onRateUser?: (userId: string, rating: number, levelFeedback: string) => void;
  onClose: () => void;
  onLocalVolumeTracked?: (volume: number) => void;
  onOpenRating?: () => void;
}

export const RoomUserControllerRemote: React.FC<RoomUserControllerRemoteProps> = ({
  user,
  onVolumeChange,
  onToggleDeafen,
  onShare,
  onKickParticipant,
  onClose,
  onLocalVolumeTracked,
  onOpenRating,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const room = useRoomContext();

  const { user: currentUser, checkIfBlocked } = useCredentials();
  const { room: roomJoined } = useRoomTools();

  const userId = String(user.userId);
  const isBlocked = checkIfBlocked(userId);
  const isHost = Boolean(
    currentUser?.userId && currentUser?.userId === String(roomJoined?.host.userId)
  );

  const remoteParticipant = useRemoteParticipant(userId);

  // Shared volume store — always in sync with the enforcement hook and
  // with the main drawer's deafened indicator.
  const [volume, setVolume] = useState<number>(() => getStoredVolume(userId));

  // Reactively track if the user is currently muted
  const [isMicMuted, setIsMicMuted] = useState(() => {
    if (!remoteParticipant) return true;
    const pub = remoteParticipant.getTrackPublication(Track.Source.Microphone);
    return !pub || pub.isMuted;
  });

  useEffect(() => {
    if (!remoteParticipant) return;

    const updateMuteState = () => {
      const pub = remoteParticipant.getTrackPublication(Track.Source.Microphone);
      setIsMicMuted(!pub || pub.isMuted);
    };

    updateMuteState();

    remoteParticipant.on(ParticipantEvent.TrackMuted, updateMuteState);
    remoteParticipant.on(ParticipantEvent.TrackUnmuted, updateMuteState);
    remoteParticipant.on(ParticipantEvent.TrackPublished, updateMuteState);
    remoteParticipant.on(ParticipantEvent.TrackUnpublished, updateMuteState);

    return () => {
      remoteParticipant.off(ParticipantEvent.TrackMuted, updateMuteState);
      remoteParticipant.off(ParticipantEvent.TrackUnmuted, updateMuteState);
      remoteParticipant.off(ParticipantEvent.TrackPublished, updateMuteState);
      remoteParticipant.off(ParticipantEvent.TrackUnpublished, updateMuteState);
    };
  }, [remoteParticipant]);

  const sectionCardSx = {
    p: 2,
    mb: 1.5,
    borderRadius: 0.5,
    bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
    border: '1px solid',
    borderColor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06),
  };

  const handleVolumeChange = (_: Event, val: number | number[]) => {
    const level = Array.isArray(val) ? val[0] : val;
    setVolume(level);
    setStoredVolume(userId, level);
    onLocalVolumeTracked?.(level);

    if (room && userId) {
      const p = room.remoteParticipants.get(userId);
      const audioPub = Array.from(p?.audioTrackPublications.values() ?? [])[0];
      if (audioPub?.track?.attachedElements) {
        audioPub.track.attachedElements.forEach((el: HTMLMediaElement) => {
          el.volume = level / 100;
        });
      }
    }
    onVolumeChange?.(userId, level / 100);
  };

  const handleToggleDeafen = () => {
    const nextVolume = volume === 0 ? 50 : 0;
    handleVolumeChange({} as Event, nextVolume);
    onToggleDeafen?.(userId);
  };

  const handleHostMute = async () => {
    if (!room?.localParticipant) return;
    // We only ever SEND a mute command, never unmute.
    const payload = JSON.stringify({
      type: 'FORCE_MUTE_PARTICIPANT',
      targetIdentity: userId,
      mute: true,
    });
    await room.localParticipant.publishData(new TextEncoder().encode(payload), {
      reliable: true,
      topic: 'room_interactions',
    });
  };

  const handleHostKick = async () => {
    if (!room?.localParticipant) return;
    const payload = JSON.stringify({
      type: 'FORCE_MUTE_PARTICIPANT',
      targetIdentity: userId,
      mute: true,
      kicked: true,
    });
    await room.localParticipant.publishData(new TextEncoder().encode(payload), {
      reliable: true,
      topic: 'room_interactions',
    });
    onKickParticipant?.(userId);
    onClose();
  };

  return (
    <>
      {user.joinedAt && (
        <Paper elevation={0} sx={{ ...sectionCardSx, py: 1.25, px: 1.75 }}>
          <Typography variant="caption" color="text.disabled">
            Joined Stage:
          </Typography>{' '}
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {fDateTime(user.joinedAt)}
          </Typography>
        </Paper>
      )}

      {/* Remote Audio Volume */}
      <Paper elevation={0} sx={sectionCardSx}>
        <Typography
          variant="caption"
          fontWeight={800}
          color="text.secondary"
          sx={{
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            display: 'block',
            mb: 1.25,
          }}
        >
          Participant Volume
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title={volume === 0 ? 'Restore Audio' : 'Mute Track'} arrow>
            <IconButton
              onClick={handleToggleDeafen}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 0.5,
                color: volume === 0 ? 'error.main' : 'text.primary',
                bgcolor:
                  volume === 0
                    ? alpha(theme.palette.error.main, 0.15)
                    : isDark
                      ? alpha('#fff', 0.05)
                      : alpha('#000', 0.04),
                border: '1px solid',
                borderColor:
                  volume === 0
                    ? alpha(theme.palette.error.main, 0.35)
                    : isDark
                      ? alpha('#fff', 0.08)
                      : alpha('#000', 0.08),
              }}
            >
              {volume === 0 ? (
                <HeadsetOffIcon fontSize="small" />
              ) : (
                <HeadsetIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <VolumeUpIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              min={0}
              max={100}
              step={1}
              valueLabelDisplay="auto"
              sx={{ flex: 1 }}
            />
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ minWidth: 34, textAlign: 'right' }}
            >
              {volume}%
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Host Controls */}
      {isHost && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 1.5,
            borderRadius: 0.5,
            bgcolor: alpha(theme.palette.warning.main, 0.06),
            border: `1px dashed ${alpha(theme.palette.warning.main, 0.35)}`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
            <GavelIcon sx={{ fontSize: 16, color: 'warning.main' }} />
            <Typography
              variant="caption"
              fontWeight={800}
              color="warning.main"
              sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              Host Moderation
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.25}>
            <Button
              variant="contained"
              color="warning"
              size="small"
              disableElevation
              fullWidth
              disabled={isMicMuted}
              startIcon={isMicMuted ? <MicOffIcon /> : <MicIcon />}
              onClick={handleHostMute}
              sx={{
                borderRadius: 0.5,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: 'none',
              }}
            >
              {isMicMuted ? 'User Muted' : 'Force Mute'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              fullWidth
              startIcon={<KickIcon />}
              onClick={handleHostKick}
              sx={{ borderRadius: 0.5, fontWeight: 600, textTransform: 'none' }}
            >
              Kick User
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Speaking Rating Button */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 1.5,
          borderRadius: 0.5,
          bgcolor: alpha(theme.palette.primary.main, isDark ? 0.08 : 0.04),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1.5}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={800}>
              Rate Speaking Proficiency
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block' }}
            >
              Share fluency & pronunciation feedback
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            disableElevation
            startIcon={<StarIcon />}
            onClick={onOpenRating}
            sx={{
              borderRadius: 0.5,
              px: 1.75,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: 'none',
              flexShrink: 0,
              '&:hover': { boxShadow: 'none' },
            }}
          >
            Rate
          </Button>
        </Stack>
      </Paper>

      {/* Follow / Block / PM */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1.25,
          mb: 1.25,
        }}
      >
        <ButtonRelationshipToggle
          targetUser={{ id: userId, name: user.name }}
          size="small"
          variant="soft"
          fullWidth
        />
        <ButtonBlockUser
          targetUserId={user.userId}
          userName={user.name}
          isBlocked={isBlocked}
          variant="soft"
          size="small"
        />
        <ButtonReportUser
          variant="soft"
          targetUserId={userId}
          size="small"
          sx={{ flex: 1, minWidth: '100px' }}
        />
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<ChatIcon />}
          onClick={() => onShare?.(userId)}
          sx={{
            borderRadius: 0.5,
            fontWeight: 600,
            textTransform: 'none',
            borderColor: isDark ? alpha('#fff', 0.12) : alpha('#000', 0.12),
          }}
        >
          PM
        </Button>
      </Box>
    </>
  );
};

export default RoomUserControllerRemote;

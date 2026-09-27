import { useRoomContext } from '@livekit/components-react';
import {
  Block as BlockIcon,
  Gavel as GavelIcon,
  Headset as HeadsetIcon,
  HeadsetOff as HeadsetOffIcon,
  PersonRemoveTwoTone as KickIcon,
  MicOff as MicOffIcon,
  Report as ReportIcon,
  Share as ShareIcon,
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
import React, { useState } from 'react';

import { ButtonRelationshipToggle } from '@/components/buttons';
import { useCredentials, useRoomTools } from '@/core/slices';
import { ParticipantStageType } from '@/types/type-room';
import { UserStats } from '@/types/type-social';

const remoteVolumeMap = new Map<string, number>();

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
  onBlock,
  onReport,
  onVolumeChange,
  onToggleDeafen,
  onShare,
  onKickParticipant,
  onClose,
  onLocalVolumeTracked,
  onOpenRating,
}) => {
  const theme = useTheme();
  const room = useRoomContext();

  const { user: currentUser, checkIfFollowing, checkIfBlocked } = useCredentials();
  const { room: roomJoined, updateParticipants } = useRoomTools();

  const userId = String(user.userId);
  const isHost = Boolean(
    currentUser?.userId && currentUser?.userId === String(roomJoined?.host.userId)
  );

  const [isBlocked, setIsBlocked] = useState(() => checkIfBlocked(userId));
  const [volume, setVolume] = useState<number>(() => remoteVolumeMap.get(userId) ?? 50);

  const handleVolumeChange = (_: Event, val: number | number[]) => {
    const level = Array.isArray(val) ? val[0] : val;
    setVolume(level);
    remoteVolumeMap.set(userId, level);
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

  const handleHostMute = async (mute: boolean) => {
    if (!room?.localParticipant) return;
    const payload = JSON.stringify({
      type: 'FORCE_MUTE_PARTICIPANT',
      targetIdentity: userId,
      mute,
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
      {/* Remote Audio Volume */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 1.5,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.text.primary, 0.03),
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        }}
      >
        <Typography
          variant="caption"
          fontWeight={800}
          color="text.secondary"
          sx={{ textTransform: 'uppercase', display: 'block', mb: 1.5 }}
        >
          Participant Volume
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title={volume === 0 ? 'Restore Audio' : 'Mute Track'}>
            <IconButton
              onClick={handleToggleDeafen}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                color: volume === 0 ? '#fff' : 'text.primary',
                bgcolor: volume === 0 ? 'error.main' : alpha(theme.palette.text.primary, 0.06),
              }}
            >
              {volume === 0 ? <HeadsetOffIcon fontSize="small" /> : <HeadsetIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <VolumeUpIcon fontSize="small" sx={{ opacity: 0.6 }} />
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              min={0}
              max={100}
              step={1}
              valueLabelDisplay="auto"
              sx={{ flex: 1 }}
            />
            <Typography variant="caption" fontWeight={700} sx={{ minWidth: 32 }}>
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
            borderRadius: 1,
            bgcolor: alpha(theme.palette.warning.main, 0.06),
            border: `1px dashed ${alpha(theme.palette.warning.main, 0.35)}`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
            <GavelIcon sx={{ fontSize: 16, color: 'warning.dark' }} />
            <Typography variant="caption" fontWeight={800} color="warning.dark" sx={{ textTransform: 'uppercase' }}>
              Host Moderation
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="error"
              size="small"
              fullWidth
              startIcon={<MicOffIcon />}
              onClick={() => handleHostMute(true)}
              sx={{ borderRadius: 1, fontWeight: 700, textTransform: 'none' }}
            >
              Mute for All
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              fullWidth
              startIcon={<KickIcon />}
              onClick={handleHostKick}
              sx={{ borderRadius: 1, fontWeight: 700, textTransform: 'none' }}
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
          borderRadius: 1,
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2" fontWeight={800}>
              Rate Speaking Proficiency
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Fluency & pronunciation feedback
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<StarIcon />}
            onClick={onOpenRating}
            sx={{ borderRadius: 1, fontWeight: 700, textTransform: 'none' }}
          >
            Rate
          </Button>
        </Stack>
      </Paper>

      {/* Follow / Block */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
        <ButtonRelationshipToggle
          targetUser={{ id: userId, name: user.name }}
          isFollow={Boolean(checkIfFollowing(userId))}
          size="small"
          variant="soft"
          onSuccessFollow={(data: UserStats[]) => updateParticipants(data)}
          onSuccessUnfollow={(data: UserStats[]) => updateParticipants(data)}
          fullWidth
        />
        <Button
          fullWidth
          variant="outlined"
          color={isBlocked ? 'error' : 'warning'}
          startIcon={<BlockIcon />}
          onClick={() => {
            setIsBlocked(!isBlocked);
            onBlock?.(userId);
          }}
          sx={{ borderRadius: 1, fontWeight: 700, textTransform: 'none' }}
        >
          {isBlocked ? 'Unblock' : 'Block'}
        </Button>
      </Box>

      {/* Report / Share */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<ReportIcon />}
          onClick={() => onReport?.(userId)}
          sx={{ borderRadius: 1, fontWeight: 600, textTransform: 'none' }}
        >
          Report
        </Button>
        <Button
          variant="outlined"
          color="info"
          startIcon={<ShareIcon />}
          onClick={() => onShare?.(userId)}
          sx={{ borderRadius: 1, fontWeight: 600, textTransform: 'none' }}
        >
          Share
        </Button>
      </Box>
    </>
  );
};

export default React.memo(RoomUserControllerRemote);

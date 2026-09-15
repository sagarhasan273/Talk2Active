// src/sections/section-voice-room/voice-room-workspace/voice-room-user-profile.tsx

import { useMediaDeviceSelect, useRoomContext } from '@livekit/components-react';
import { Track } from 'livekit-client';
import React, { useEffect, useRef, useState } from 'react';

import {
  Block as BlockIcon,
  Close as CloseIcon,
  PersonAdd as FollowIcon,
  Gavel as GavelIcon,
  Headset as HeadsetIcon,
  HeadsetOff as HeadsetOffIcon,
  PersonRemoveTwoTone as KickIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Report as ReportIcon,
  Share as ShareIcon,
  StarRounded as StarIcon,
  PersonRemove as UnfollowIcon,
  CheckCircle as VerifiedIcon,
  VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import {
  alpha,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Rating,
  Select,
  Slider,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { fUsername } from 'src/utils/helper';
import { StageParticipant } from '../voice-room-workspace/types';

interface VoiceRoomUserProfileProps {
  open: boolean;
  onClose: () => void;
  user?: StageParticipant | null;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onBlock?: (userId: string) => void;
  onReport?: (userId: string) => void;
  onVolumeChange?: (userId: string, volume: number) => void;
  onToggleMute?: (userId: string) => void;
  onToggleDeafen?: (userId: string) => void;
  onShare?: (userId: string) => void;
  onKickParticipant?: (userId: string) => void;
  onRateUser?: (userId: string, rating: number, levelFeedback: string) => void;
}

// Helper to directly manipulate the HTML5 Audio element LiveKit creates
const setLiveKitTrackVolume = (room: any, targetUserId: string, volumeLevel: number) => {
  if (!room || !targetUserId) return;
  const participant = room.remoteParticipants.get(targetUserId);
  const audioPub = participant?.getTrackPublication(Track.Source.Microphone);

  if (audioPub?.track?.attachedElements) {
    audioPub.track.attachedElements.forEach((el: HTMLMediaElement) => {
      el.volume = volumeLevel; // 0.0 to 1.0
    });
  }
};

// Helper to get current volume
const getLiveKitTrackVolume = (room: any, targetUserId: string): number => {
  if (!room || !targetUserId) return 1;
  const participant = room.remoteParticipants.get(targetUserId);
  const audioPub = participant?.getTrackPublication(Track.Source.Microphone);

  if (audioPub?.track?.attachedElements && audioPub.track.attachedElements.length > 0) {
    return (audioPub.track.attachedElements[0] as HTMLMediaElement).volume;
  }
  return 1;
};

export const VoiceRoomUserProfile: React.FC<VoiceRoomUserProfileProps> = ({
  open,
  onClose,
  user,
  onFollow,
  onUnfollow,
  onBlock,
  onReport,
  onVolumeChange,
  onToggleMute,
  onToggleDeafen,
  onShare,
  onKickParticipant,
  onRateUser,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const room = useRoomContext();

  const safeUser = user ?? ({} as Partial<StageParticipant>);

  const {
    id: userId = '',
    name = 'Unknown User',
    avatarUrl: profilePhoto = '',
    role = 'listener',
    verified = false,
    audioState = 'muted',
    isSpeaking = audioState === 'speaking',
    isDeafened = false,
    isSelf = false,
    bio = 'Practicing languages together!',
    location = 'Online',
    joinDate = 'Joined recently',
    followers = 0,
    following = 0,
    level,
  } = safeUser;

  const isMuted = audioState === 'muted';

  // Check if current logged-in user is host
  const isViewerHost = Boolean(
    room?.localParticipant && (room.localParticipant.permissions?.canPublish ?? true) && !isSelf
  );

  // LiveKit Device Selectors
  const {
    devices: microphones,
    activeDeviceId: activeMicId,
    setActiveMediaDevice: setActiveMicDevice,
  } = useMediaDeviceSelect({ kind: 'audioinput', requestPermissions: true });

  const {
    devices: speakers,
    activeDeviceId: activeSpeakerId,
    setActiveMediaDevice: setActiveSpeakerDevice,
  } = useMediaDeviceSelect({ kind: 'audiooutput' });

  // Refs for Web Audio API Interception (Local Mic Gain)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const [volume, setVolume] = useState<number>(100);
  const [micGain, setMicGain] = useState<number>(100);
  const [isFollowing, setIsFollowing] = useState<boolean>(Boolean(safeUser.isFollowing));
  const [isBlocked, setIsBlocked] = useState<boolean>(Boolean(safeUser.isBlocked));

  // Rating Modal State
  const [ratingOpen, setRatingOpen] = useState(false);
  const [starRating, setStarRating] = useState<number | null>(4);
  const [ratedLevel, setRatedLevel] = useState('Intermediate (B1-B2)');

  useEffect(() => {
    if (open) {
      if (!isSelf && room && userId) {
        const currentVol = getLiveKitTrackVolume(room, userId);
        setVolume(currentVol * 100);
      } else {
        setVolume(typeof safeUser.volume === 'number' ? safeUser.volume : 100);
      }
      setIsFollowing(Boolean(safeUser.isFollowing));
      setIsBlocked(Boolean(safeUser.isBlocked));
    }
  }, [safeUser.volume, safeUser.isFollowing, safeUser.isBlocked, userId, room, isSelf, open]);

  const handleFollowToggle = () => {
    if (!userId) return;
    if (isFollowing) {
      onUnfollow?.(userId);
    } else {
      onFollow?.(userId);
    }
    setIsFollowing((prev) => !prev);
  };

  const handleBlockToggle = () => {
    if (!userId) return;
    const nextState = !isBlocked;
    setIsBlocked(nextState);
    onBlock?.(userId);
  };

  // 1. HARDWARE VOLUME CONTROL (Remote)
  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    const val = Array.isArray(newValue) ? newValue[0] : newValue;
    setVolume(val);

    if (room && userId && !isSelf) {
      setLiveKitTrackVolume(room, userId, val / 100);
    }
    if (userId) {
      onVolumeChange?.(userId, val / 100);
    }
  };

  // 2. TRUE WEB AUDIO API GAIN CONTROL (Local Microphone)
  const handleMicGainChange = (_event: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    setMicGain(value);

    if (!room?.localParticipant) return;

    // Grab the local audio track publication
    const pub = Array.from(room.localParticipant.audioTrackPublications.values())[0];
    const localTrack = pub?.track as any;

    if (!localTrack || !localTrack.sender) return;

    try {
      // 1. Initialize AudioContext once
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }

      const ctx = audioCtxRef.current;

      // Ensure context is running
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // 2. Wrap track with GainNode if not already wrapped
      if (!localTrack.__isGainWrapped && localTrack.mediaStreamTrack) {
        const originalStream = new MediaStream([localTrack.mediaStreamTrack]);
        const source = ctx.createMediaStreamSource(originalStream);

        const gainNode = ctx.createGain();
        gainNodeRef.current = gainNode;

        const destination = ctx.createMediaStreamDestination();

        source.connect(gainNode);
        gainNode.connect(destination);

        const processedTrack = destination.stream.getAudioTracks()[0];

        // Hijack the LiveKit WebRTC sender and replace it with our processed track
        localTrack.sender.replaceTrack(processedTrack).catch(console.warn);

        // Mark to prevent infinite wrapping loops
        localTrack.__isGainWrapped = true;
      }

      // 3. Apply smooth volume transition (100% = 1.0 multiplier)
      if (gainNodeRef.current) {
        // use setTargetAtTime to prevent audio clipping/popping when sliding
        gainNodeRef.current.gain.setTargetAtTime(value / 100, ctx.currentTime, 0.1);
      }
    } catch (err) {
      console.error('Failed to intercept and apply local mic gain:', err);
    }
  };

  // 3. HARDWARE DEVICE SWITCHER
  const handleMicDeviceChange = async (deviceId: string) => {
    try {
      await setActiveMicDevice(deviceId);
      if (room && typeof room.switchActiveDevice === 'function') {
        await room.switchActiveDevice('audioinput', deviceId);
      }
    } catch (err) {
      console.error('Failed to change microphone device:', err);
    }
  };

  const handleSpeakerDeviceChange = async (deviceId: string) => {
    try {
      await setActiveSpeakerDevice(deviceId);
      if (room && typeof room.switchActiveDevice === 'function') {
        await room.switchActiveDevice('audiooutput', deviceId);
      }
    } catch (err) {
      console.error('Failed to change speaker device:', err);
    }
  };

  // 4. LOCAL OR HOST FORCE MUTE TOGGLE
  const handleToggleMic = async () => {
    if (isSelf && room?.localParticipant) {
      const isEnabled = room.localParticipant.isMicrophoneEnabled;
      await room.localParticipant.setMicrophoneEnabled(!isEnabled);
    } else if (userId && isViewerHost && !isSelf) {
      handleHostMuteParticipant(!isMuted);
    } else if (userId) {
      onToggleMute?.(userId);
    }
  };

  // 5. HARDWARE DEAFEN (Set volume to 0 or restore)
  const handleToggleDeafen = () => {
    if (!userId || isSelf || !room) return;

    const nextDeafened = volume > 0;
    const targetVolume = nextDeafened ? 0 : 100;

    setVolume(targetVolume);
    setLiveKitTrackVolume(room, userId, targetVolume / 100);

    onToggleDeafen?.(userId);
  };

  // 6. HOST FORCE MUTE BROADCAST
  const handleHostMuteParticipant = async (shouldMute: boolean) => {
    if (!userId || !room?.localParticipant) return;

    const payload = JSON.stringify({
      type: 'FORCE_MUTE_PARTICIPANT',
      targetIdentity: userId,
      mute: shouldMute,
    });

    await room.localParticipant.publishData(new TextEncoder().encode(payload), {
      reliable: true,
      topic: 'room_interactions',
    });
  };

  // 7. HOST KICK USER BROADCAST
  const handleKickParticipant = async () => {
    if (!userId || !room?.localParticipant) return;

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

  const handleOpenRating = () => {
    onClose();
    setRatingOpen(true);
  };

  const handleSaveRating = () => {
    if (userId && starRating) {
      onRateUser?.(userId, starRating, ratedLevel);
    }
    setRatingOpen(false);
  };

  const initials = (() => {
    try {
      return fUsername(name || 'User');
    } catch {
      return 'U';
    }
  })();

  const roleColor =
    role === 'host'
      ? theme.palette.primary.main
      : role === 'moderator'
        ? theme.palette.secondary.main
        : role === 'speaker'
          ? theme.palette.success.main
          : theme.palette.grey[500];

  const roleLabel =
    role === 'host'
      ? 'HOST'
      : role === 'moderator'
        ? 'MODERATOR'
        : role === 'speaker'
          ? 'SPEAKER'
          : 'LISTENER';

  const elevatedSelectMenuProps = {
    PaperProps: {
      sx: {
        zIndex: theme.zIndex.modal + 20,
        maxHeight: 260,
      },
    },
    sx: {
      zIndex: theme.zIndex.modal + 20,
    },
  };

  return (
    <>
      <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        PaperProps={{ elevation: 0 }}
        sx={{
          zIndex: theme.zIndex.modal + 1,
          '& .MuiBackdrop-root': {
            backdropFilter: 'blur(16px)',
            backgroundColor: alpha(theme.palette.common.black, 0.4),
          },
          '& .MuiDrawer-paper': {
            width: '100%',
            maxWidth: { xs: '100%', sm: 520 },
            margin: '0 auto',
            position: 'fixed',
            bottom: { xs: 0, sm: 'auto' },
            top: { xs: 'auto', sm: '50%' },
            left: { sm: '50%' },
            transform: { xs: 'none', sm: 'translate(-50%, -50%) !important' },
            borderRadius: { xs: '24px 24px 0 0', sm: 5 },
            maxHeight: { xs: '90vh', sm: '88vh' },
            minHeight: { xs: '65vh', sm: 'auto' },
            overflow: 'hidden',
            backgroundColor: alpha(theme.palette.background.paper, 0.88),
            backdropFilter: 'blur(20px) saturate(180%)',
            border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
            boxShadow: `0 24px 48px -12px ${alpha(theme.palette.common.black, 0.5)}`,
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            position: 'relative',
            px: 3,
            pt: 2,
            pb: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.4),
          }}
        >
          {isMobile && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 36,
                height: 4,
                borderRadius: 999,
                backgroundColor: alpha(theme.palette.text.primary, 0.2),
              }}
            />
          )}
          <Typography
            variant="subtitle2"
            fontWeight={800}
            sx={{
              color: theme.palette.text.secondary,
              fontSize: 12,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              mt: isMobile ? 1 : 0,
            }}
          >
            {isSelf ? 'Your Audio & Profile' : 'User Profile'}
          </Typography>

          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              position: 'absolute',
              right: 14,
              top: isMobile ? 14 : 10,
              width: 32,
              height: 32,
              backgroundColor: alpha(theme.palette.text.primary, 0.05),
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Profile Body */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 2.5, sm: 3.5 }, py: 2 }}>
          {/* Avatar and Badges */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    backgroundColor: isSpeaking
                      ? theme.palette.success.main
                      : theme.palette.grey[500],
                    border: `3px solid ${theme.palette.background.paper}`,
                  }}
                />
              }
            >
              <Avatar
                src={profilePhoto || undefined}
                alt={name}
                sx={{
                  width: { xs: 80, sm: 90 },
                  height: { xs: 80, sm: 90 },
                  fontSize: 32,
                  fontWeight: 800,
                  backgroundColor: alpha(roleColor, 0.15),
                  color: roleColor,
                  border: `3px solid ${alpha(theme.palette.background.paper, 0.8)}`,
                }}
              >
                {initials}
              </Avatar>
            </Badge>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, mb: 0.5 }}>
              <Typography variant="h6" fontWeight={800}>
                {name || 'Unknown User'} {isSelf && '(You)'}
              </Typography>
              {verified && <VerifiedIcon sx={{ color: '#5865F2', fontSize: 20 }} />}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: 13 }}>
              @{userId || 'username'}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Chip
                label={roleLabel}
                size="small"
                sx={{
                  height: 24,
                  fontSize: 10,
                  fontWeight: 800,
                  color: roleColor,
                  backgroundColor: alpha(roleColor, 0.12),
                }}
              />
              {level && (
                <Chip
                  label={level}
                  size="small"
                  variant="outlined"
                  sx={{ height: 24, fontSize: 10 }}
                />
              )}
              {isSpeaking && (
                <Chip
                  label="Speaking"
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: 10,
                    fontWeight: 800,
                    color: theme.palette.success.main,
                    backgroundColor: alpha(theme.palette.success.main, 0.12),
                  }}
                />
              )}
              {(isMuted || volume === 0) && (
                <Chip
                  label={isMuted ? 'Muted' : 'Deafened'}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: 10,
                    fontWeight: 800,
                    color: theme.palette.error.main,
                    backgroundColor: alpha(theme.palette.error.main, 0.12),
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Stats Section */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-around',
              mb: 1,
              p: 1,
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.text.primary, 0.03),
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            }}
          >
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
                {followers}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize={11}>
                Followers
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ opacity: 0.15 }} />

            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
                {following}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize={11}>
                Following
              </Typography>
            </Box>
          </Box>

          {/* Bio Card */}
          {(bio || location || joinDate) && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 1,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.text.primary, 0.03),
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              }}
            >
              {bio && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6, mb: 1.5, fontSize: 13 }}
                >
                  {bio}
                </Typography>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                {location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ fontSize: 13 }}>
                      📍
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      {location}
                    </Typography>
                  </Box>
                )}

                {joinDate && (
                  <>
                    <Typography variant="caption" color="text.disabled">
                      •
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      {joinDate}
                    </Typography>
                  </>
                )}
              </Box>
            </Paper>
          )}

          {/* Self: LiveKit Device Settings Panel */}
          {isSelf && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 1,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.text.primary, 0.03),
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              }}
            >
              <Typography
                variant="caption"
                fontWeight={800}
                color="text.secondary"
                sx={{
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  display: 'block',
                  mb: 1,
                }}
              >
                Audio Hardware Devices (LiveKit)
              </Typography>

              <Stack spacing={1.5}>
                {/* Input Mic Selector */}
                <FormControl fullWidth size="small">
                  <InputLabel id="user-mic-select-label">Input Microphone</InputLabel>
                  <Select
                    labelId="user-mic-select-label"
                    value={activeMicId || ''}
                    label="Input Microphone"
                    onChange={(e) => handleMicDeviceChange(e.target.value)}
                    MenuProps={elevatedSelectMenuProps}
                  >
                    {microphones.map((device) => (
                      <MenuItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone (${device.deviceId.slice(0, 5)})`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Output Speaker Selector */}
                <FormControl fullWidth size="small" disabled={speakers.length === 0}>
                  <InputLabel id="user-speaker-select-label">Output Speaker</InputLabel>
                  <Select
                    labelId="user-speaker-select-label"
                    value={activeSpeakerId || ''}
                    label="Output Speaker"
                    onChange={(e) => handleSpeakerDeviceChange(e.target.value)}
                    MenuProps={elevatedSelectMenuProps}
                  >
                    {speakers.map((device) => (
                      <MenuItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Speaker (${device.deviceId.slice(0, 5)})`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Paper>
          )}

          {/* Volume Control / Mic Toggle */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 1,
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.text.primary, 0.03),
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            }}
          >
            <Typography
              variant="caption"
              fontWeight={800}
              color="text.secondary"
              sx={{
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                display: 'block',
                mb: 1.5,
              }}
            >
              {isSelf ? 'Microphone Gain & Status' : 'Participant LiveKit Volume'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
                <IconButton
                  onClick={handleToggleMic}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    backgroundColor: isMuted
                      ? alpha(theme.palette.error.main, 0.15)
                      : alpha(theme.palette.text.primary, 0.05),
                    color: isMuted ? theme.palette.error.main : theme.palette.text.primary,
                  }}
                >
                  {isMuted ? <MicOffIcon fontSize="small" /> : <MicIcon fontSize="small" />}
                </IconButton>
              </Tooltip>

              {isSelf ? (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5, ml: 0.5 }}>
                  <MicIcon fontSize="small" color="action" sx={{ opacity: 0.6 }} />
                  <Slider
                    value={micGain}
                    onChange={handleMicGainChange}
                    min={0}
                    max={200}
                    step={5}
                    valueLabelDisplay="auto"
                    sx={{ flex: 1 }}
                  />
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ minWidth: 32 }}>
                    {micGain}%
                  </Typography>
                </Box>
              ) : (
                <>
                  <Tooltip title={volume === 0 ? 'Restore Audio' : 'Mute/Deafen Track'}>
                    <IconButton
                      onClick={handleToggleDeafen}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        backgroundColor:
                          volume === 0
                            ? alpha(theme.palette.error.main, 0.15)
                            : alpha(theme.palette.text.primary, 0.05),
                        color: volume === 0 ? theme.palette.error.main : theme.palette.text.primary,
                      }}
                    >
                      {volume === 0 ? (
                        <HeadsetOffIcon fontSize="small" />
                      ) : (
                        <HeadsetIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>

                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1, ml: 0.5 }}>
                    <VolumeUpIcon fontSize="small" color="action" sx={{ opacity: 0.6 }} />
                    <Slider
                      value={volume}
                      onChange={handleVolumeChange}
                      min={0}
                      max={100}
                      step={1}
                      valueLabelDisplay="auto"
                      sx={{ flex: 1 }}
                    />
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ minWidth: 32, ml: 0.5 }}>
                      {Math.round(volume)}%
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Paper>

          {/* Host Moderation Section */}
          {isViewerHost && !isSelf && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 1,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.warning.main, 0.06),
                border: `1px dashed ${alpha(theme.palette.warning.main, 0.35)}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <GavelIcon sx={{ fontSize: 16, color: 'warning.dark' }} />
                <Typography
                  variant="caption"
                  fontWeight={800}
                  color="warning.dark"
                  sx={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}
                >
                  Host Moderation
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color={isMuted ? 'success' : 'error'}
                  size="small"
                  fullWidth
                  startIcon={isMuted ? <MicIcon /> : <MicOffIcon />}
                  onClick={() => handleHostMuteParticipant(!isMuted)}
                  sx={{ borderRadius: 1, fontWeight: 700, textTransform: 'none' }}
                >
                  {isMuted ? 'Request Unmute' : 'Mute for All'}
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  fullWidth
                  startIcon={<KickIcon />}
                  onClick={handleKickParticipant}
                  sx={{ borderRadius: 1, fontWeight: 700, textTransform: 'none' }}
                >
                  Kick User
                </Button>
              </Stack>
            </Paper>
          )}

          {/* Speaking Level Rating & Assessment Button */}
          {!isSelf && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 1,
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
                    Provide feedback on fluency and pronunciation
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<StarIcon />}
                  onClick={handleOpenRating}
                  sx={{
                    borderRadius: 1,
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: 'primary.main',
                  }}
                >
                  Rate Level
                </Button>
              </Stack>
            </Paper>
          )}

          {/* Social Follow & Block Actions */}
          {!isSelf && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
              <Button
                fullWidth
                variant={isFollowing ? 'outlined' : 'contained'}
                color="primary"
                startIcon={isFollowing ? <UnfollowIcon /> : <FollowIcon />}
                onClick={handleFollowToggle}
                sx={{ borderRadius: 1, fontWeight: 700, textTransform: 'none' }}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color={isBlocked ? 'error' : 'warning'}
                startIcon={<BlockIcon />}
                onClick={handleBlockToggle}
                sx={{ borderRadius: 1, fontWeight: 700, textTransform: 'none' }}
              >
                {isBlocked ? 'Unblock' : 'Block'}
              </Button>
            </Box>
          )}

          {/* Report & Share Options */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<ReportIcon />}
              disabled={!userId || isSelf}
              onClick={() => userId && onReport?.(userId)}
              sx={{
                borderRadius: 1,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: 13,
              }}
            >
              Report
            </Button>

            <Button
              variant="outlined"
              color="info"
              startIcon={<ShareIcon />}
              disabled={!userId}
              onClick={() => userId && onShare?.(userId)}
              sx={{
                borderRadius: 1,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: 13,
              }}
            >
              Share
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Speaking Rating Assessment Dialog */}
      <Dialog
        open={ratingOpen}
        onClose={() => setRatingOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{ zIndex: theme.zIndex.modal + 10 }}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Rate Speaking Level</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            How well is <strong>{name}</strong> communicating and expressing ideas?
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Rating
              size="large"
              value={starRating}
              onChange={(_, val) => setStarRating(val)}
              precision={1}
              sx={{ mb: 1, fontSize: '2.4rem' }}
            />
            <Typography variant="caption" fontWeight={700} color="primary.main">
              {starRating === 5
                ? 'Native / Fluent'
                : starRating === 4
                  ? 'Advanced (C1)'
                  : starRating === 3
                    ? 'Intermediate (B2)'
                    : starRating === 2
                      ? 'Pre-Intermediate (B1)'
                      : 'Beginner (A1-A2)'}
            </Typography>
          </Box>

          <FormControl fullWidth size="small">
            <InputLabel id="rated-level-label">Estimated CEFR Level</InputLabel>
            <Select
              labelId="rated-level-label"
              value={ratedLevel}
              label="Estimated CEFR Level"
              onChange={(e) => setRatedLevel(e.target.value)}
              MenuProps={{
                PaperProps: { sx: { zIndex: theme.zIndex.modal + 30 } },
                sx: { zIndex: theme.zIndex.modal + 30 },
              }}
            >
              <MenuItem value="Beginner (A1-A2)">Beginner (A1-A2)</MenuItem>
              <MenuItem value="Intermediate (B1-B2)">Intermediate (B1-B2)</MenuItem>
              <MenuItem value="Advanced (C1)">Advanced (C1)</MenuItem>
              <MenuItem value="Fluent / Native (C2)">Fluent / Native (C2)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRatingOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveRating}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Submit Rating
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VoiceRoomUserProfile;
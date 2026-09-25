import { useIsSpeaking } from '@livekit/components-react';
import { Participant } from 'livekit-client';
import React, { useEffect, useState } from 'react';

import {
  Block as BlockIcon,
  Close as CloseIcon,
  Gavel as GavelIcon,
  Headset as HeadsetIcon,
  HeadsetOff as HeadsetOffIcon,
  PersonRemoveTwoTone as KickIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Report as ReportIcon,
  Share as ShareIcon,
  StarRounded as StarIcon,
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

import { ButtonRelationshipToggle } from '@/components/buttons';
import { useCredentials, useRoomTools } from '@/core/slices';
import { ParticipantStageType } from '@/types/type-room';
import { UserStats } from '@/types/type-social';
import { fDateTime } from '@/utils/format-time';
import { fUsername } from 'src/utils/helper';
import { KrispNoiseFilterToggle } from '../voice-button-krisp-noise-filter';
import { useParticipantAudioController } from './hook-participant-audio-controller';
import ParticipantStatsRow from './user-controller-participant-stats-row';

interface RoomUserControllerMainProps {
  open: boolean;
  onClose: () => void;
  user: ParticipantStageType;
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

const LiveParticipantSpeakingWatcher: React.FC<{
  participant: Participant;
  onSpeakingChange: (speaking: boolean) => void;
}> = ({ participant, onSpeakingChange }) => {
  const isSpeaking = useIsSpeaking(participant);

  useEffect(() => {
    onSpeakingChange(isSpeaking);
  }, [isSpeaking, onSpeakingChange]);

  return null;
};

export const RoomUserControllerMain: React.FC<RoomUserControllerMainProps> = ({
  open,
  onClose,
  user,
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

  const { checkIfFollowing, checkIfBlocked } = useCredentials();
  const { updateParticipants } = useRoomTools();

  const safeUser = user ?? ({} as Partial<ParticipantStageType>);
  const { id: userId = '', isSelf = false, rawParticipant } = safeUser;

  const isViewerHost = Boolean(!isSelf);

  // Use persistent audio & LiveKit controller hook
  const {
    volume,
    micGain,
    isMuted,
    microphones,
    speakers,
    activeMicId,
    activeSpeakerId,
    handleVolumeChange,
    handleMicGainChange,
    handleMicDeviceChange,
    handleSpeakerDeviceChange,
    handleToggleMic,
    handleToggleDeafen,
    handleHostMuteParticipant,
    handleKickParticipant: executeKick,
  } = useParticipantAudioController({
    userId,
    isSelf,
    rawParticipant,
    isViewerHost,
    onVolumeChange,
    onToggleMute,
    onToggleDeafen,
    onKickParticipant,
  });

  const participant = {
    name: user?.name,
    username: user?.username,
    verified: user?.verified,
    profilePhoto: user?.profilePhoto || '',
    genUserId: user?.genUserId || '',
    accountType: user?.accountType,
    follower_count: user?.follower_count,
    following_count: user?.following_count,
    friend_count: user?.friend_count,
    isHost: user?.isHost,
    joinedAt: user?.joinedAt ? new Date(user.joinedAt) : undefined,
    bio: user?.bio,
    isFollowing: checkIfFollowing(user?.userId),
    isBlocked: checkIfBlocked(user?.userId),
  };

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBlocked, setIsBlocked] = useState<boolean>(Boolean(participant?.isBlocked));

  // Rating Modal State
  const [ratingOpen, setRatingOpen] = useState(false);
  const [starRating, setStarRating] = useState<number | null>(4);
  const [ratedLevel, setRatedLevel] = useState('Intermediate (B1-B2)');

  useEffect(() => {
    setIsBlocked(Boolean(participant?.isBlocked));
  }, [participant?.isBlocked]);

  const handleBlockToggle = () => {
    if (!userId) return;
    setIsBlocked(!isBlocked);
    onBlock?.(userId);
  };

  const handleKickAndClose = async () => {
    await executeKick();
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
      return fUsername(participant?.name || 'User');
    } catch {
      return 'U';
    }
  })();

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
      {rawParticipant && (
        <LiveParticipantSpeakingWatcher
          participant={rawParticipant}
          onSpeakingChange={setIsSpeaking}
        />
      )}

      <Drawer
        anchor={isMobile ? 'bottom' : undefined}
        open={open}
        onClose={onClose}
        PaperProps={{ elevation: 0 }}
        ModalProps={{
          keepMounted: true,
        }}
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
            borderRadius: { xs: 1 },
            height: 'fit-content',
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
            backgroundColor: alpha(theme.palette.background.neutral, 0.4),
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
        <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 2.5, sm: 3.5 }, py: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 2, sm: 2.5 }, mb: 3 }}>
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: theme.palette.success.main,
                      border: `3px solid ${theme.palette.background.paper}`,
                    }}
                  />
                }
              >
                <Avatar
                  src={participant?.profilePhoto || undefined}
                  alt={participant?.name}
                  sx={{
                    width: { xs: 120, sm: 160 },
                    height: { xs: 120, sm: 160 },
                    fontSize: 28,
                    fontWeight: 800,
                    border: `3px solid ${alpha(theme.palette.background.paper, 0.8)}`,
                  }}
                  variant="rounded"
                >
                  {initials}
                </Avatar>
              </Badge>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, pt: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                <Typography variant="h6" fontWeight={800} noWrap sx={{ flexShrink: 1 }}>
                  {participant?.name || 'Unknown User'} {isSelf && '(You)'}
                </Typography>
                {participant?.verified && (
                  <VerifiedIcon sx={{ color: '#5865F2', fontSize: 18, flexShrink: 0 }} />
                )}
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5, fontSize: 13 }}
                noWrap
              >
                @{userId || 'username'}
              </Typography>

              <ParticipantStatsRow participant={participant} />

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
          </Box>

          {/* Bio Card */}
          {(participant?.bio || participant?.joinedAt) && (
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
              {participant?.bio && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6, mb: 1.5, fontSize: 13 }}
                >
                  {participant?.bio}
                </Typography>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                {participant?.joinedAt && (
                  <>
                    <Typography variant="caption" color="text.disabled">
                      JoinedAt:
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      {fDateTime(participant?.joinedAt)}
                    </Typography>
                  </>
                )}
              </Box>
            </Paper>
          )}

          {/* Self: Audio Hardware Devices */}
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
                Audio Hardware Devices
              </Typography>

              <Stack spacing={1.5}>
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

          {/* Volume Control / Mic Gain */}
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
              {isSelf ? 'Microphone Gain & Status' : 'Participant Volume'}
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
                <Stack spacing={1.25} sx={{ flex: 1, ml: 0.5, minWidth: 0 }}>
                  {/* 1. Mic Gain Slider Row */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                    <MicIcon fontSize="small" color="action" sx={{ opacity: 0.6 }} />
                    <Slider
                      value={micGain}
                      onChange={handleMicGainChange}
                      min={0}
                      max={100}
                      step={5}
                      valueLabelDisplay="auto"
                      sx={{ flex: 1 }}
                    />
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="text.secondary"
                      sx={{ minWidth: 36, textAlign: 'right' }}
                    >
                      {micGain}%
                    </Typography>
                  </Box>

                  <Divider sx={{ borderStyle: 'dashed', opacity: 0.6 }} />

                  {/* 2. Krisp Noise Cancellation Toggle */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      AI Noise Suppression
                    </Typography>
                    <KrispNoiseFilterToggle />
                  </Box>
                </Stack>
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
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="text.secondary"
                      sx={{ minWidth: 32, ml: 0.5 }}
                    >
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
                  onClick={handleKickAndClose}
                  sx={{ borderRadius: 1, fontWeight: 700, textTransform: 'none' }}
                >
                  Kick User
                </Button>
              </Stack>
            </Paper>
          )}

          {/* Speaking Level Rating */}
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

          {/* Social Follow & Block */}
          {!isSelf && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
              <ButtonRelationshipToggle
                targetUser={{
                  id: userId,
                  name: participant?.name,
                }}
                isFollow={Boolean(participant?.isFollowing)}
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
                onClick={handleBlockToggle}
                sx={{ borderRadius: 1, fontWeight: 700, textTransform: 'none' }}
              >
                {isBlocked ? 'Unblock' : 'Block'}
              </Button>
            </Box>
          )}

          {/* Report & Share */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<ReportIcon />}
              disabled={!userId || isSelf}
              onClick={() => userId && onReport?.(userId)}
              sx={{ borderRadius: 1, fontWeight: 600, textTransform: 'none', fontSize: 13 }}
            >
              Report
            </Button>

            <Button
              variant="outlined"
              color="info"
              startIcon={<ShareIcon />}
              disabled={!userId}
              onClick={() => userId && onShare?.(userId)}
              sx={{ borderRadius: 1, fontWeight: 600, textTransform: 'none', fontSize: 13 }}
            >
              Share
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Rating Dialog */}
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
            How well is <strong>{participant?.name}</strong> communicating and expressing ideas?
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

export default RoomUserControllerMain;

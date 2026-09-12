// VoiceRoomUserProfile.tsx

import type { VoiceParticipant } from 'src/types/type-room';

import React, { useState, useEffect } from 'react';

import {
  Box,
  Chip,
  alpha,
  Badge,
  Paper,
  Avatar,
  Button,
  Drawer,
  Slider,
  Divider,
  Tooltip,
  useTheme,
  IconButton,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  Mic as MicIcon,
  Block as BlockIcon,
  Close as CloseIcon,
  Share as ShareIcon,
  MicOff as MicOffIcon,
  Report as ReportIcon,
  Headset as HeadsetIcon,
  PersonAdd as FollowIcon,
  VolumeUp as VolumeUpIcon,
  MoreHoriz as MoreHorizIcon,
  CheckCircle as VerifiedIcon,
  HeadsetOff as HeadsetOffIcon,
  PersonRemove as UnfollowIcon,
} from '@mui/icons-material';

import { fUsername } from 'src/utils/helper';

interface VoiceRoomUserProfileProps {
  open: boolean;
  onClose: () => void;

  user?: Partial<VoiceParticipant> & {
    isFollowing?: boolean;
    isBlocked?: boolean;
    isMuted?: boolean;
    isDeafened?: boolean;
    isSpeaking?: boolean;
    volume?: number;
    joinDate?: string;
    bio?: string;
    location?: string;
    followers?: number;
    following?: number;
  };

  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onBlock?: (userId: string) => void;
  onReport?: (userId: string) => void;
  onVolumeChange?: (userId: string, volume: number) => void;
  onToggleMute?: (userId: string) => void;
  onToggleDeafen?: (userId: string) => void;
  onShare?: (userId: string) => void;
}

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
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const safeUser = user ?? {};

  const {
    userId = '',
    name = 'Unknown User',
    profilePhoto = '',
    userType = 'guest',
    verified = false,
    isMuted = false,
    isDeafened = false,
    isSpeaking = false,
    bio = 'No bio yet',
    location = 'Unknown location',
    joinDate = 'Joined recently',
    followers = 0,
    following = 0,
  } = safeUser;

  const [volume, setVolume] = useState<number>(
    typeof safeUser.volume === 'number' ? safeUser.volume : 80
  );

  const [isFollowing, setIsFollowing] = useState<boolean>(Boolean(safeUser.isFollowing));
  const [isBlocked, setIsBlocked] = useState<boolean>(Boolean(safeUser.isBlocked));

  useEffect(() => {
    setVolume(typeof safeUser.volume === 'number' ? safeUser.volume : 80);
    setIsFollowing(Boolean(safeUser.isFollowing));
    setIsBlocked(Boolean(safeUser.isBlocked));
  }, [safeUser.volume, safeUser.isFollowing, safeUser.isBlocked, userId]);

  const handleFollowToggle = () => {
    if (!userId) return;
    if (isFollowing) {
      onUnfollow?.(userId);
    } else {
      onFollow?.(userId);
    }
    setIsFollowing((previous) => !previous);
  };

  const handleBlockToggle = () => {
    if (!userId) return;
    const nextBlockedState = !isBlocked;
    setIsBlocked(nextBlockedState);
    onBlock?.(userId);
  };

  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    setVolume(value);
    if (userId) {
      onVolumeChange?.(userId, value);
    }
  };

  const initials = (() => {
    try {
      return fUsername(name || 'User');
    } catch {
      return 'U';
    }
  })();

  const roleColor =
    userType === 'host'
      ? theme.palette.primary.main
      : userType === 'moderator'
        ? theme.palette.secondary.main
        : userType === 'speaker'
          ? theme.palette.success.main
          : theme.palette.grey[500];

  const roleLabel =
    userType === 'host'
      ? 'HOST'
      : userType === 'moderator'
        ? 'MODERATOR'
        : userType === 'speaker'
          ? 'SPEAKER'
          : 'LISTENER';

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        elevation: 0,
      }}
      sx={{
        zIndex: theme.zIndex.modal + 1,

        '& .MuiBackdrop-root': {
          backdropFilter: 'blur(16px)',
          backgroundColor: alpha(theme.palette.common.black, 0.4),
          transition: 'all 300ms ease-in-out',
        },

        '& .MuiDrawer-paper': {
          width: '100%',
          maxWidth: { xs: '100%', sm: 500 },
          margin: '0 auto',

          /* Desktop vs Mobile Position Layout */
          position: 'fixed',
          bottom: { xs: 0, sm: 'auto' },
          top: { xs: 'auto', sm: '50%' },
          left: { sm: '50%' },
          transform: {
            xs: 'none',
            sm: 'translate(-50%, -50%) !important',
          },

          borderRadius: { xs: '24px 24px 0 0', sm: 5 },

          maxHeight: { xs: '90vh', sm: '85vh' },
          minHeight: { xs: '65vh', sm: 'auto' },

          overflow: 'hidden',

          /* Glassmorphism Background & Shadows */
          backgroundColor: alpha(theme.palette.background.paper, 0.75),
          backdropFilter: 'blur(20px) saturate(180%)',
          border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,

          boxShadow: `0 24px 48px -12px ${alpha(theme.palette.common.black, 0.5)}, 0 0 32px ${alpha(
            theme.palette.primary.main,
            0.15
          )}`,

          /* Desktop scale-in and mobile slide-up animations */
          animation: isMobile
            ? 'profileMobileSlideUp 350ms cubic-bezier(0.16, 1, 0.3, 1)'
            : 'profileDesktopPop 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',

          '@keyframes profileMobileSlideUp': {
            from: { transform: 'translateY(100%)' },
            to: { transform: 'translateY(0)' },
          },
          '@keyframes profileDesktopPop': {
            from: { transform: 'translate(-50%, -45%) scale(0.95)', opacity: 0 },
            to: { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
          },

          /* Custom Scrollbar */
          '&::-webkit-scrollbar': {
            width: 5,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.text.primary, 0.15),
            borderRadius: 999,
          },
        },
      }}
    >
      {/* Dynamic Header */}
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
        {/* Mobile Swipe Handle Indicator */}
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
          User Profile
        </Typography>

        <IconButton
          onClick={onClose}
          aria-label="Close profile"
          size="small"
          sx={{
            position: 'absolute',
            right: 14,
            top: isMobile ? 14 : 10,
            width: 32,
            height: 32,
            backgroundColor: alpha(theme.palette.text.primary, 0.05),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            '&:hover': {
              backgroundColor: alpha(theme.palette.text.primary, 0.12),
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: { xs: 2.5, sm: 3.5 },
          py: 2,
        }}
      >
        {/* Avatar and Identity */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 2,
          }}
        >
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
                  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`,
                }}
              />
            }
          >
            <Box
              sx={{
                position: 'relative',
                borderRadius: '50%',
                p: isSpeaking ? '3px' : 0,
                background: isSpeaking
                  ? `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
                  : 'transparent',
                boxShadow: isSpeaking
                  ? `0 0 24px ${alpha(theme.palette.success.main, 0.45)}`
                  : 'none',
                transition: 'all 250ms ease',
              }}
            >
              <Avatar
                src={profilePhoto || undefined}
                alt={name}
                sx={{
                  width: { xs: 84, sm: 96 },
                  height: { xs: 84, sm: 96 },
                  fontSize: { xs: 30, sm: 36 },
                  fontWeight: 800,
                  backgroundColor: alpha(roleColor, 0.15),
                  color: roleColor,
                  border: `3px solid ${alpha(theme.palette.background.paper, 0.8)}`,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.15)}`,
                }}
              >
                {initials}
              </Avatar>
            </Box>
          </Badge>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 2,
              mb: 0.5,
            }}
          >
            <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={800} letterSpacing="-0.02em">
              {name || 'Unknown User'}
            </Typography>

            {!verified && <VerifiedIcon sx={{ color: '#5865F2', fontSize: 20 }} />}
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1.5, fontWeight: 500, fontSize: 13 }}
          >
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
                letterSpacing: '0.06em',
                color: roleColor,
                backgroundColor: alpha(roleColor, 0.12),
                border: `1px solid ${alpha(roleColor, 0.25)}`,
                '& .MuiChip-label': { px: 1.5 },
              }}
            />

            {isSpeaking && (
              <Chip
                label="Speaking"
                size="small"
                sx={{
                  height: 24,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  color: theme.palette.success.main,
                  backgroundColor: alpha(theme.palette.success.main, 0.12),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.25)}`,
                  '& .MuiChip-label': { px: 1.5 },
                }}
              />
            )}

            {(isMuted || isDeafened) && (
              <Chip
                label={isMuted && isDeafened ? 'Muted & Deafened' : isMuted ? 'Muted' : 'Deafened'}
                size="small"
                sx={{
                  height: 24,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  color: theme.palette.error.main,
                  backgroundColor: alpha(theme.palette.error.main, 0.12),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.25)}`,
                  '& .MuiChip-label': { px: 1.5 },
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
            mb: 2.5,
            p: 1.5,
            borderRadius: 3,
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
              mb: 2.5,
              borderRadius: 3,
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

        {/* Audio Controls */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.text.primary, 0.03),
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          }}
        >
          <Typography
            variant="caption"
            fontWeight={800}
            color="text.secondary"
            sx={{ letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', mb: 1.5 }}
          >
            Audio Settings
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
              <IconButton
                onClick={() => userId && onToggleMute?.(userId)}
                disabled={!userId}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2.5,
                  backgroundColor: isMuted
                    ? alpha(theme.palette.error.main, 0.15)
                    : alpha(theme.palette.text.primary, 0.05),
                  color: isMuted ? theme.palette.error.main : theme.palette.text.primary,
                  border: `1px solid ${
                    isMuted
                      ? alpha(theme.palette.error.main, 0.3)
                      : alpha(theme.palette.divider, 0.1)
                  }`,
                }}
              >
                {isMuted ? <MicOffIcon fontSize="small" /> : <MicIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            <Tooltip title={isDeafened ? 'Enable audio' : 'Deafen'}>
              <IconButton
                onClick={() => userId && onToggleDeafen?.(userId)}
                disabled={!userId}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2.5,
                  backgroundColor: isDeafened
                    ? alpha(theme.palette.error.main, 0.15)
                    : alpha(theme.palette.text.primary, 0.05),
                  color: isDeafened ? theme.palette.error.main : theme.palette.text.primary,
                  border: `1px solid ${
                    isDeafened
                      ? alpha(theme.palette.error.main, 0.3)
                      : alpha(theme.palette.divider, 0.1)
                  }`,
                }}
              >
                {isDeafened ? (
                  <HeadsetOffIcon fontSize="small" />
                ) : (
                  <HeadsetIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                ml: 0.5,
              }}
            >
              <VolumeUpIcon fontSize="small" color="action" sx={{ opacity: 0.6 }} />

              <Slider
                value={volume}
                onChange={handleVolumeChange}
                min={0}
                max={100}
                step={1}
                disabled={!userId}
                aria-label="Volume"
                valueLabelDisplay="auto"
                sx={{
                  flex: 1,
                  '& .MuiSlider-thumb': {
                    width: 14,
                    height: 14,
                    boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
                  },
                  '& .MuiSlider-track': {
                    height: 4,
                    borderRadius: 999,
                  },
                  '& .MuiSlider-rail': {
                    height: 4,
                    borderRadius: 999,
                    opacity: 0.15,
                  },
                }}
              />

              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ minWidth: 32, textAlign: 'right' }}
              >
                {Math.round(volume)}%
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Primary Action Row */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1.5,
            mb: 1.5,
          }}
        >
          <Button
            fullWidth
            variant={isFollowing ? 'outlined' : 'contained'}
            color="primary"
            startIcon={isFollowing ? <UnfollowIcon /> : <FollowIcon />}
            disabled={!userId}
            onClick={handleFollowToggle}
            sx={{
              minHeight: 44,
              borderRadius: 2.5,
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: isFollowing
                ? 'none'
                : `0 8px 20px -4px ${alpha(theme.palette.primary.main, 0.4)}`,
            }}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            color={isBlocked ? 'error' : 'warning'}
            startIcon={<BlockIcon />}
            disabled={!userId}
            onClick={handleBlockToggle}
            sx={{
              minHeight: 44,
              borderRadius: 2.5,
              fontWeight: 700,
              textTransform: 'none',
              borderColor: isBlocked
                ? alpha(theme.palette.error.main, 0.4)
                : alpha(theme.palette.warning.main, 0.4),
            }}
          >
            {isBlocked ? 'Unblock' : 'Block'}
          </Button>
        </Box>

        {/* Secondary Actions */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1.5,
          }}
        >
          <Button
            variant="outlined"
            color="error"
            startIcon={<ReportIcon />}
            disabled={!userId}
            onClick={() => userId && onReport?.(userId)}
            sx={{
              minHeight: 40,
              borderRadius: 2.5,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: 13,
              borderColor: alpha(theme.palette.error.main, 0.2),
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
              minHeight: 40,
              borderRadius: 2.5,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: 13,
              borderColor: alpha(theme.palette.info.main, 0.2),
            }}
          >
            Share
          </Button>
        </Box>

        {/* Bottom Options */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 2,
            pt: 1,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          }}
        >
          <Button
            startIcon={<MoreHorizIcon />}
            sx={{
              color: theme.palette.text.secondary,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            More Options
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default VoiceRoomUserProfile;

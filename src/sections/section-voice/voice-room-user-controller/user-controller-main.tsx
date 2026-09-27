import { useRoomContext } from '@livekit/components-react';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  HeadsetOff as HeadsetOffIcon,
  MicOff as MicOffIcon,
  CheckCircle as VerifiedIcon,
} from '@mui/icons-material';
import {
  alpha,
  Avatar,
  Badge,
  Box,
  Drawer,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Track } from 'livekit-client';
import React, { useState } from 'react';

import { ParticipantStageType } from '@/types/type-room';
import { fUsername } from 'src/utils/helper';
import ParticipantStatsRow from './user-controller-participant-stats-row';
import { RoomUserControllerRemote } from './user-controller-remote';
import { RoomUserControllerSelf } from './user-controller-self';

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

export const RoomUserControllerMain: React.FC<RoomUserControllerMainProps> = (props) => {
  const { open, onClose, user } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const room = useRoomContext();

  const [copied, setCopied] = useState(false);
  const [remoteVolume, setRemoteVolume] = useState<number>(50);

  if (!open || !user) return null;

  const isSelf = Boolean(user.isSelf);
  const userId = String(user.userId || user.id);

  // 1. Determine Muted State
  const isMuted = isSelf
    ? room?.localParticipant
      ? !room.localParticipant.isMicrophoneEnabled
      : true
    : (() => {
      const p = room?.remoteParticipants.get(userId);
      const micPub = p?.getTrackPublication(Track.Source.Microphone);
      return p ? !p.isMicrophoneEnabled || !micPub || micPub.isMuted : true;
    })();

  // 2. Determine Deafened State
  const isDeafened = isSelf ? false : remoteVolume === 0;

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    const idToCopy = user.genUserId || userId || '';
    if (!idToCopy) return;
    navigator.clipboard.writeText(idToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const initials = fUsername(user?.name || (isSelf ? 'You' : 'User'));

  return (
    <Drawer
      anchor={isMobile ? 'bottom' : undefined}
      open={open}
      onClose={onClose}
      PaperProps={{ elevation: 0 }}
      sx={{
        zIndex: theme.zIndex.modal + 1,
        '& .MuiBackdrop-root': {
          backdropFilter: 'blur(10px)',
          backgroundColor: alpha(theme.palette.common.black, 0.4),
        },
        '& .MuiDrawer-paper': {
          width: '100%',
          maxWidth: { xs: '100%', sm: 520 },
          height: 'fit-content',
          maxHeight: { xs: '90vh', sm: '88vh' },
          margin: '0 auto',
          position: 'fixed',
          bottom: { xs: 0, sm: 'auto' },
          top: { xs: 'auto', sm: '50%' },
          left: { sm: '50%' },
          transform: { xs: 'none', sm: 'translate(-50%, -50%) !important' },
          borderRadius: { xs: 1 },
          overflow: 'hidden',
          backgroundColor: alpha(theme.palette.background.paper, 0.94),
          border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
          boxShadow: `0 24px 48px -12px ${alpha(theme.palette.common.black, 0.5)}`,
        },
      }}
    >
      {/* Shared Drawer Top Header */}
      <Box
        sx={{
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: alpha(theme.palette.background.neutral, 0.4),
          position: 'relative',
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight={800}
          sx={{
            color: 'text.secondary',
            fontSize: 12,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
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
            width: 32,
            height: 32,
            backgroundColor: alpha(theme.palette.text.primary, 0.05),
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Main Scrollable Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 2.5, sm: 3.5 }, py: 2.5 }}>
        {/* User Identity Row with Avatar & Status Badge */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 2, sm: 2.5 }, mb: 2.5 }}>
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              sx={{
                '& .MuiBadge-badge': {
                  bottom: { xs: 6, sm: 10 },
                  right: { xs: 6, sm: 10 },
                  transform: 'none',
                  p: 0,
                  height: 'auto',
                },
              }}
              badgeContent={
                (isMuted || isDeafened) ? (
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 0.9,
                      py: 0.35,
                      borderRadius: 999,
                      bgcolor: alpha(theme.palette.error.dark, 0.92),
                      color: theme.palette.common.white,
                      backdropFilter: 'blur(8px)',
                      border: `2px solid ${theme.palette.background.paper}`,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.25)}`,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                      userSelect: 'none',
                    }}
                  >
                    {isDeafened ? (
                      <HeadsetOffIcon sx={{ fontSize: 13 }} />
                    ) : (
                      <MicOffIcon sx={{ fontSize: 13 }} />
                    )}
                    <span>{isDeafened ? 'Deafened' : 'Muted'}</span>
                  </Box>
                ) : null
              }
            >
              <Avatar
                src={user.profilePhoto || undefined}
                alt={user.name}
                sx={{
                  width: { xs: 100, sm: 120 },
                  height: { xs: 100, sm: 120 },
                  fontSize: 26,
                  fontWeight: 800,
                  border: `3px solid ${alpha(theme.palette.background.paper, 0.8)}`,
                  boxShadow: `0 8px 24px -4px ${alpha(theme.palette.common.black, 0.15)}`,
                }}
                variant="rounded"
              >
                {initials}
              </Avatar>
            </Badge>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, pt: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
              <Typography variant="h6" fontWeight={800} noWrap sx={{ flexShrink: 1 }}>
                {user.name || 'Unknown User'} {isSelf && '(You)'}
              </Typography>
              {user.verified && (
                <VerifiedIcon sx={{ color: '#5865F2', fontSize: 17, flexShrink: 0 }} />
              )}
            </Box>

            <Box
              onClick={handleCopyId}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                width: 'fit-content',
                maxWidth: '100%',
                mb: 1.25,
                py: 0.2,
                borderRadius: 0.5,
                '&:hover': {
                  color: alpha(theme.palette.text.primary, 0.8),
                },
              }}
            >
              <Typography
                variant="caption"
                noWrap
                sx={{ color: copied ? 'success.main' : 'text.secondary', fontWeight: 600 }}
              >
                @{user.genUserId || 'username'}
              </Typography>

              <Tooltip title={copied ? 'Copied to clipboard!' : 'Copy user ID'} arrow placement="top">
                <IconButton size="small" disableRipple sx={{ p: 0, ml: 0.25 }}>
                  {copied ? (
                    <CheckIcon sx={{ fontSize: 13, color: 'success.main' }} />
                  ) : (
                    <CopyIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                  )}
                </IconButton>
              </Tooltip>
            </Box>

            <ParticipantStatsRow participant={{
              follower_count: user.follower_count,
              following_count: user.following_count,
              friend_count: user.friend_count
            }} />
          </Box>
        </Box>

        {/* View Specific Modules */}
        {isSelf ? (
          <RoomUserControllerSelf user={user} isMuted={isMuted} />
        ) : (
          <RoomUserControllerRemote
            {...props}
            onLocalVolumeTracked={(vol) => setRemoteVolume(vol)}
          />
        )}
      </Box>
    </Drawer>
  );
};

export default React.memo(RoomUserControllerMain);

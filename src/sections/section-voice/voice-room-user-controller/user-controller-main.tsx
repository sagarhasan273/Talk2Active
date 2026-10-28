// src/sections/section-voice/voice-room-user-controller/user-controller-main.tsx

import {
  useLocalParticipant,
  useRemoteParticipant
} from '@livekit/components-react';
import {
  Close as CloseIcon,
  HeadsetOff as HeadsetOffIcon,
  MicOff as MicOffIcon,
  CheckCircle as VerifiedIcon
} from '@mui/icons-material';
import {
  alpha,
  Avatar,
  Badge,
  Box,
  Drawer,
  IconButton,
  Paper,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Track } from 'livekit-client';
import React, { useState } from 'react';

import { UseBooleanReturn } from '@/hooks/use-boolean';
import { ParticipantStageType } from '@/types/type-room';
import { fDateTime } from '@/utils/format-time';
import { fUsername } from 'src/utils/helper';
import { getStoredVolume } from './hook-participant-audio-controller';
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
  onToggleDeafen?: (userId: string) => void;
  onShare?: (userId: string) => void;
  onKickParticipant?: (userId: string) => void;
  onRateOpen: UseBooleanReturn;
}

export const RoomUserControllerMain: React.FC<RoomUserControllerMainProps> = (props) => {
  const { open, onClose, user, onRateOpen } = props;
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [copied, setCopied] = useState(false);

  const isSelf = Boolean(user?.isSelf);
  const userId = String(user?.userId || '');

  // 🔑 Reactive LiveKit Hooks to ensure the UI updates instantly
  const { isMicrophoneEnabled } = useLocalParticipant();
  const remoteParticipant = useRemoteParticipant(isSelf ? '' : userId);

  const [remoteVolume, setRemoteVolume] = useState<number>(() =>
    getStoredVolume(userId)
  );

  const isMuted = isSelf
    ? !isMicrophoneEnabled
    : (() => {
      if (!remoteParticipant) return true;
      const micPub = remoteParticipant.getTrackPublication(Track.Source.Microphone);
      return !micPub || micPub.isMuted;
    })();

  const isDeafened = isSelf ? false : remoteVolume === 0;

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    const idToCopy = user?.genUserId || userId || '';
    if (!idToCopy) return;
    navigator.clipboard.writeText(idToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const initials = fUsername(user?.name || (isSelf ? 'You' : 'User'));

  const sectionCardSx = {
    p: 2,
    mb: 1.5,
    borderRadius: 0.5,
    bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
    border: '1px solid',
    borderColor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06),
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{ elevation: 0 }}
      SlideProps={{ direction: 'up', timeout: { enter: 320, exit: 240 } }}
      sx={{
        zIndex: theme.zIndex.drawer,
        '& .MuiBackdrop-root': {
          backdropFilter: 'blur(10px)',
          backgroundColor: alpha(theme.palette.common.black, 0.55),
        },
        '& .MuiDrawer-paper': {
          width: '100%',
          maxWidth: { xs: '100%', sm: 500 },
          height: 'fit-content',
          maxHeight: { xs: '90vh', sm: '88vh' },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: isDark
            ? '#1a1f2b'
            : alpha(theme.palette.background.paper, 0.98),
          backgroundImage: 'none',
          backdropFilter: 'blur(16px)',
          border: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
          boxShadow: isDark
            ? '0 24px 48px -12px rgba(0, 0, 0, 0.65)'
            : `0 24px 48px -12px ${alpha(theme.palette.common.black, 0.25)}`,
          ...(isMobile
            ? {
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              top: 'auto',
              margin: 0,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }
            : {
              position: 'fixed',
              inset: 0,
              margin: 'auto',
              borderRadius: 2,
            }),
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 1.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDark
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)} 0%, ${alpha('#1a1f2b', 0.4)} 100%)`
            : alpha(theme.palette.primary.main, 0.04),
          borderBottom: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.07) : alpha('#000', 0.06),
          position: 'relative',
        }}
      >
        {isMobile && (
          <Box
            sx={{
              position: 'absolute',
              top: 3,
              width: 38,
              height: 4,
              borderRadius: 2,
              bgcolor: isDark ? alpha('#fff', 0.2) : alpha('#000', 0.2),
            }}
          />
        )}
        <Typography
          variant="subtitle2"
          fontWeight={800}
          sx={{
            color: 'text.secondary',
            fontSize: 11.5,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {isSelf ? 'Your Audio & Profile' : 'Speaker Profile'}
        </Typography>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: 'absolute',
            right: 14,
            width: 30,
            height: 30,
            borderRadius: 0.5,
            bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
            '&:hover': {
              bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
            },
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 2, sm: 3 }, py: 2.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: { xs: 1, sm: 2 },
            mb: 2,
          }}
        >
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              sx={{
                '& .MuiBadge-badge': {
                  bottom: { xs: 6, sm: 8 },
                  right: { xs: 6, sm: 8 },
                  transform: 'none',
                  p: 0,
                  height: 'auto',
                },
              }}
              badgeContent={
                isMuted || isDeafened ? (
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.4,
                      px: 0.85,
                      py: 0.3,
                      borderRadius: 0.5,
                      bgcolor: 'error.main',
                      color: '#fff',
                      border: `2px solid ${isDark ? '#1a1f2b' : '#ffffff'}`,
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                      userSelect: 'none',
                    }}
                  >
                    {isDeafened ? (
                      <HeadsetOffIcon sx={{ fontSize: 12 }} />
                    ) : (
                      <MicOffIcon sx={{ fontSize: 12 }} />
                    )}
                    <span>{isDeafened ? 'Deafened' : 'Muted'}</span>
                  </Box>
                ) : null
              }
            >
              <Avatar
                src={user?.profilePhoto || undefined}
                alt={user?.name}
                sx={{
                  width: { xs: 120, sm: 184 },
                  height: { xs: 120, sm: 184 },
                  borderRadius: 2.5,
                  fontSize: 26,
                  fontWeight: 800,
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  color: 'primary.main',
                  border: `2px solid ${isDark ? alpha('#fff', 0.12) : alpha('#000', 0.08)}`,
                  boxShadow: isDark
                    ? '0 8px 20px -4px rgba(0, 0, 0, 0.45)'
                    : '0 8px 20px -4px rgba(0, 0, 0, 0.12)',
                }}
                variant="rounded"
              >
                {initials}
              </Avatar>
            </Badge>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minWidth: 0,
              pt: 0.25,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.35 }}>
              <Typography
                variant="h6"
                fontWeight={800}
                noWrap
                sx={{ flexShrink: 1, fontSize: { xs: '1.05rem', sm: '1.15rem' } }}
              >
                {user?.name || 'Unknown User'} {isSelf && '(You)'}
              </Typography>
              {user?.verified && (
                <VerifiedIcon sx={{ color: 'info.main', fontSize: 17, flexShrink: 0 }} />
              )}
            </Box>
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
          </Box>
        </Box>

        {isSelf ? (
          <RoomUserControllerSelf
            user={user}
            isMuted={isMuted}
          />
        ) : (
          <RoomUserControllerRemote
            {...props}
            onOpenRating={() => {
              onRateOpen.onTrue();
              onClose?.();
            }}
            onLocalVolumeTracked={(vol) => setRemoteVolume(vol)}
          />
        )}
      </Box>
    </Drawer>
  );
};

export default RoomUserControllerMain;

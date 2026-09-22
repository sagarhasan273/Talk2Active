// src/sections/section-voice-room/voice-room-header/room-header-compact.tsx

import type { RoomType } from 'src/types/type-chat';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CrownIcon from '@mui/icons-material/MilitaryTechRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';

import {
  alpha,
  Avatar,
  Box,
  Button,
  IconButton,
  keyframes,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';

import { Label, ParticipantLevel } from '@/components/label';
import { useCredentials } from '@/core/slices';
import { fgetLanguageName } from '@/utils/helper';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getLanguageDetails } from './utils';

// ----------------------------------------------------------------------

const miniWave = keyframes`
  0%, 100% { height: 3px; }
  50% { height: 11px; }
`;

// ----------------------------------------------------------------------

export const CompactRoomHeader = ({
  room,
  onBack,
  onSettingsClick,
}: {
  room: RoomType;
  onBack?: () => void;
  onSettingsClick?: () => void;
  onShareClick?: () => void;
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { user } = useCredentials();
  const [copied, setCopied] = useState(false);

  const languageDetails = getLanguageDetails(room?.languages);

  const isHost = useMemo(() => {
    if (!room || !user) return false;
    const hostId = typeof room.host === 'object' ? room.host?.userId || (room.host as any)?._id : room.host;
    return String(hostId) === String(user.userId);
  }, [room, user]);

  const handleShareLink = useCallback(() => {
    if (!room) return;
    const url = `${window.location.origin}/room/${room.roomId}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    toast.success('Room link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  }, [room]);

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        position: 'relative',
        borderRadius: 0,
        backdropFilter: 'blur(16px)',
        bgcolor: isDark
          ? alpha(theme.palette.background.paper, 0.85)
          : alpha(theme.palette.common.white, 0.92),
        borderBottom: '2px solid',
        borderColor: theme.palette.divider,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={{ xs: 1, sm: 1.5 }}
        sx={{
          minHeight: { xs: 56, sm: 62 },
          px: { xs: 1.25, sm: 2 },
          py: 0.75,
        }}
      >
        {/* Left Side: Back Navigation & Room Info */}
        <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.25 }} sx={{ minWidth: 0, flex: 1 }}>
          {onBack && (
            <Tooltip title="Leave room view" arrow>
              <Button
                onClick={onBack}
                size="small"
                variant="outlined"
                startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 17 }} />}
                sx={{
                  height: 34,
                  minWidth: { xs: 34, sm: 'auto' },
                  px: { xs: 1, sm: 1.5 },
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: 'text.secondary',
                  borderColor: alpha(theme.palette.divider, 0.6),
                  bgcolor: alpha(theme.palette.action.hover, 0.04),
                  flexShrink: 0,
                  '& .MuiButton-startIcon': {
                    mr: { xs: 0, sm: 0.75 },
                    ml: 0,
                  },
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                {!isMobile ? 'Lobby' : ''}
              </Button>
            </Tooltip>
          )}

          {/* Room Topic & Metadata */}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0, mb: 0.35 }}>
              <Typography
                noWrap
                sx={{
                  fontSize: { xs: '0.875rem', sm: '0.975rem' },
                  fontWeight: 800,
                  color: 'text.primary',
                  letterSpacing: '-0.01em',
                }}
              >
                {room?.topic || 'Untitled voice room'}
              </Typography>

              {/* Pulsing Live Pill with Equalizer Wave */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 0.75,
                  py: 0.25,
                  borderRadius: '6px',
                  bgcolor: alpha(theme.palette.success.main, 0.12),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.25)}`,
                  color: 'success.main',
                  flexShrink: 0,
                }}
              >
                {/* Micro Audio Equalizer bars */}
                <Stack direction="row" alignItems="center" spacing={0.3} sx={{ height: 10 }}>
                  {[0.1, 0.3, 0.2].map((delay, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        width: 2,
                        borderRadius: 1,
                        bgcolor: 'success.main',
                        animation: `${miniWave} 1s ease-in-out infinite`,
                        animationDelay: `${delay}s`,
                      }}
                    />
                  ))}
                </Stack>
                <Typography
                  sx={{
                    fontSize: '0.625rem',
                    fontWeight: 900,
                    lineHeight: 1,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Live
                </Typography>
              </Box>
            </Stack>

            {/* Badges: Languages & Learning Level */}
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexWrap: 'nowrap', overflow: 'hidden' }}>

              {languageDetails.map((lang, index) => (
                <Label
                  key={`${lang.code}-${index}`}
                  label={fgetLanguageName(lang.code)}
                  size="small"
                  color="primary"
                  sx={{
                    borderRadius: 1,
                    bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                  }}
                />
              ))
              }
              {room?.level && (
                <ParticipantLevel
                  value={room.level}
                  label={room.level}
                  showEmoji
                  size="small"
                  sx={{
                    transform: 'none !important',
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    bgcolor: 'transparent',
                    color: theme.palette.text.secondary,
                    transition: 'color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease',
                  }}
                />
              )}

              {/* Host Preview Avatar Badge (Desktop Only) */}
              {!isMobile && room?.host && typeof room.host === 'object' && (
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ pl: 0.5 }}>
                  <Avatar
                    src={room.host.profilePhoto}
                    alt={room.host.name}
                    sx={{ width: 18, height: 18, border: `1px solid ${theme.palette.divider}` }}
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 600 }}>
                    {room.host.name}
                  </Typography>
                  {isHost && (
                    <CrownIcon sx={{ fontSize: 13, color: 'warning.main', ml: -0.2 }} />
                  )}
                </Stack>
              )}
            </Stack>
          </Box>
        </Stack>

        {/* Right Side: Quick Action Controls */}
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
          {/* Share Action */}
          <Tooltip title={copied ? 'Link Copied!' : 'Share Room URL'} arrow>
            <IconButton
              onClick={handleShareLink}
              size="small"
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                color: copied ? 'success.main' : 'text.secondary',
                bgcolor: copied ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.action.hover, 0.05),
                border: '1px solid',
                borderColor: copied ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.divider, 0.6),
                transition: 'all 0.18s ease-in-out',
                '&:hover': {
                  color: 'primary.main',
                  borderColor: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {copied ? <CheckRoundedIcon sx={{ fontSize: 18 }} /> : <ShareRoundedIcon sx={{ fontSize: 17 }} />}
            </IconButton>
          </Tooltip>

          {/* Host Room Settings */}
          {isHost && onSettingsClick && (
            <Tooltip title="Room Settings" arrow>
              <IconButton
                onClick={onSettingsClick}
                size="small"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  color: 'text.secondary',
                  bgcolor: alpha(theme.palette.action.hover, 0.05),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.6),
                  transition: 'all 0.18s ease-in-out',
                  '&:hover': {
                    color: 'primary.main',
                    borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    transform: 'rotate(45deg)',
                  },
                }}
              >
                <SettingsRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default CompactRoomHeader;

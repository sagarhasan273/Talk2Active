// src/sections/section-voice-room/voice-room-header/room-header-compact.tsx

import type { RoomType } from '@/types/type-room';

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
  useTheme,
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
    const hostId =
      typeof room.host === 'object' ? room.host?.userId || (room.host as any)?._id : room.host;
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
        borderRadius: isMobile ? 1 : 0,
        p: 0.5,
        backdropFilter: 'blur(16px)',
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
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
        <Stack
          direction="row"
          alignItems="center"
          spacing={{ xs: 1, sm: 1.5 }}
          sx={{ minWidth: 0, flex: 1 }}
        >
          {onBack && (
            <Tooltip title="Leave room view" arrow>
              <Button
                onClick={onBack}
                size="small"
                variant="outlined"
                startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 17 }} />}
                sx={{
                  height: 36,
                  minWidth: { xs: 36, sm: 'auto' },
                  px: { xs: 1, sm: 1.5 },
                  borderRadius: 0.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: isDark ? 'text.secondary' : '#475569',
                  borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
                  bgcolor: isDark ? alpha('#fff', 0.03) : '#f8fafc',
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

          {/* Room Topic & Metadata Wrapper */}
          <Box
            sx={{
              minWidth: 0,
              flex: 1,
              overflowX: 'auto',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              // CSS mask creates a fade-out effect on the right edge
              WebkitMaskImage: 'linear-gradient(to right, #000 85%, transparent 100%)',
              maskImage: 'linear-gradient(to right, #000 85%, transparent 100%)',
            }}
          >
            {/* Row 1: Topic */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                minWidth: 'max-content',
                mb: 0.35,
                pr: 4 // Ensures content clears the fade when fully scrolled
              }}
            >
              <Typography
                noWrap
                sx={{
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 800,
                  color: isDark ? 'text.primary' : '#0f172a',
                  letterSpacing: '-0.01em',
                }}
              >
                {room?.topic || 'Untitled voice room'}
              </Typography>

              {/* Micro Audio Equalizer Indicator */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 0.5,
                  bgcolor: isDark ? alpha(theme.palette.success.main, 0.12) : '#ecfdf5',
                  border: '1px solid',
                  borderColor: isDark ? alpha(theme.palette.success.main, 0.25) : '#a7f3d0',
                  color: isDark ? 'success.main' : '#059669',
                  flexShrink: 0,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={0.3} sx={{ height: 10 }}>
                  {[0.1, 0.3, 0.2].map((delay, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        width: 2,
                        borderRadius: 0.5,
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
                    fontWeight: 800,
                    lineHeight: 1,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Live
                </Typography>
              </Box>
            </Stack>

            {/* Row 2: Badges (Languages, Learning Level, Host) */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{
                minWidth: 'max-content',
                pr: 4 // Ensures badges clear the fade when fully scrolled
              }}
            >
              {languageDetails.map((lang, index) => (
                <Label
                  key={`${lang.code}-${index}`}
                  label={fgetLanguageName(lang.code)}
                  size="small"
                  color="primary"
                  sx={{
                    borderRadius: 0.5,
                    bgcolor: isDark
                      ? alpha(theme.palette.primary.main, 0.14)
                      : alpha(theme.palette.primary.main, 0.08),
                    fontWeight: 700,
                  }}
                />
              ))}
              {room?.level && (
                <ParticipantLevel
                  value={room.level}
                  label={room.level}
                  showEmoji
                  size="small"
                  sx={{
                    transform: 'none !important',
                    borderRadius: 0.5,
                    border: '1px solid',
                    borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
                    bgcolor: isDark ? 'transparent' : '#f8fafc',
                    color: isDark ? theme.palette.text.secondary : '#475569',
                  }}
                />
              )}

              {/* Host Preview Avatar Badge (Desktop Only) */}
              {!isMobile && room?.host && typeof room.host === 'object' && (
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ pl: 0.5 }}>
                  <Avatar
                    src={room.host.profilePhoto}
                    alt={room.host.name}
                    sx={{
                      width: 18,
                      height: 18,
                      border: `1px solid ${theme.palette.primary.main}`,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: isDark ? 'text.secondary' : '#475569',
                      fontSize: '0.725rem',
                      fontWeight: 600,
                    }}
                  >
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
                borderRadius: 0.5,
                color: copied ? 'success.main' : isDark ? 'text.secondary' : '#475569',
                bgcolor: copied
                  ? alpha(theme.palette.success.main, 0.1)
                  : isDark
                    ? alpha('#fff', 0.03)
                    : '#f8fafc',
                border: '1px solid',
                borderColor: copied
                  ? alpha(theme.palette.success.main, 0.3)
                  : isDark
                    ? alpha('#fff', 0.08)
                    : '#e2e8f0',
                transition: 'all 0.18s ease-in-out',
                '&:hover': {
                  color: 'primary.main',
                  borderColor: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              {copied ? (
                <CheckRoundedIcon sx={{ fontSize: 18 }} />
              ) : (
                <ShareRoundedIcon sx={{ fontSize: 17 }} />
              )}
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
                  borderRadius: 0.5,
                  color: isDark ? 'text.secondary' : '#475569',
                  bgcolor: isDark ? alpha('#fff', 0.03) : '#f8fafc',
                  border: '1px solid',
                  borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
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

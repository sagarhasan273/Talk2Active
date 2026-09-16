// src/sections/section-voice-room/voice-room-header/room-header-compact.tsx

import { Volume2Icon } from 'lucide-react';
import type { RoomResponse } from 'src/types/type-chat';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import SettingsIcon from '@mui/icons-material/Settings';
import ShareIcon from '@mui/icons-material/Share';
import { alpha, Box, Chip, IconButton, Paper, Stack, Tooltip, Typography, useTheme } from '@mui/material';

import { useCredentials } from '@/core/slices';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { getLanguageDetails, getLevelLabel } from './utils';

export const CompactRoomHeader = ({
  room,
  onBack,
  onSettingsClick,
}: {
  room: RoomResponse;
  onBack?: () => void;
  onSettingsClick?: () => void;
  onShareClick?: () => void;
}) => {
  const theme = useTheme();

  const { user } = useCredentials();

  const languageDetails = getLanguageDetails(room?.languages);

  const isHost = useMemo(() => {
    if (!room || !user) return false;
    return room.host.userId === user.userId;
  }, [room, user]);

  const handleShareLink = useCallback(() => {
    if (!room) return;
    const url = `${window.location.origin}/room/${room.roomId}`;
    navigator.clipboard?.writeText(url);
    toast.success('Room link copied to clipboard!');
  }, [room]);


  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        borderRadius: 0,
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${alpha(theme.palette.background.neutral, 1)}`,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={{ xs: 0.75, sm: 1 }}
        sx={{
          minHeight: { xs: 48, sm: 54 },
          px: { xs: 1, sm: 1.5 },
        }}
      >
        {onBack && (
          <Tooltip title="Back to rooms">
            <IconButton
              onClick={onBack}
              size="small"
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1.25,
                bgcolor: alpha(theme.palette.text.primary, 0.04),
                transition: theme.transitions.create(['background-color', 'color', 'transform'], {
                  duration: 150,
                }),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  transform: 'translateX(-2px)',
                },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}

        <Box
          sx={{
            mx: 1,
            position: 'relative',
            width: 32,
            height: 32,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {[0, 1].map((ring) => (
            <Box
              key={ring}
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: 1,
                border: `1.5px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                animation: `voiceJoinGateRing 2.2s ease-out ${ring * 0.7}s infinite`,
                '@keyframes voiceJoinGateRing': {
                  '0%': { transform: 'scale(0.85)', opacity: 0.6 },
                  '100%': { transform: 'scale(1.5)', opacity: 0 },
                },
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                  display: 'none',
                },
              }}
            />
          ))}

          <Box
            sx={{
              position: 'relative',
              width: 1,
              height: 1,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main',
            }}
          >
            <Volume2Icon size={26} />
          </Box>
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
            <Typography
              noWrap
              sx={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: { xs: '0.78rem', sm: '0.85rem' },
                fontWeight: 800,
              }}
            >
              {room?.topic || 'Untitled room'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35, flexShrink: 0 }}>
              <FiberManualRecordIcon
                sx={{
                  fontSize: 6,
                  color: 'success.main',
                  animation: 'voiceLiveDotBlink 1.8s ease-in-out infinite',
                  '@keyframes voiceLiveDotBlink': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.35 },
                  },
                  '@media (prefers-reduced-motion: reduce)': {
                    animation: 'none',
                  },
                }}
              />

              <Typography
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  fontSize: 9,
                  color: 'success.main',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}
              >
                Live
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
            {languageDetails.map((lang) => (
              <Chip
                key={lang.code}
                label={`${lang.flag} ${lang.name}`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: 10,
                  fontWeight: 600,
                  color: 'text.secondary',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  backgroundColor: 'background.paper',
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
            ))}
            {room?.level && (
              <Chip
                label={getLevelLabel(room.level, true)}
                size="small"
                variant="outlined"
                sx={{
                  height: 20,
                  fontSize: 10,
                  fontWeight: 600,
                  color: 'text.secondary',
                  borderColor: 'divider',
                }}
              />
            )}
          </Box>
        </Box>


        <Tooltip title="Share room">
          <IconButton
            onClick={handleShareLink}
            size="small"
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.25,
              color: 'text.secondary',
              bgcolor: alpha(theme.palette.text.primary, 0.04),
              transition: theme.transitions.create(['background-color', 'color'], {
                duration: 150,
              }),
              '&:hover': {
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <ShareIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>


        {isHost && onSettingsClick && (
          <Tooltip title="Room settings">
            <IconButton
              onClick={onSettingsClick}
              size="small"
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.25,
                color: 'text.secondary',
                bgcolor: alpha(theme.palette.text.primary, 0.04),
                transition: theme.transitions.create(['background-color', 'color', 'transform'], {
                  duration: 150,
                }),
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  transform: 'rotate(30deg)',
                },
              }}
            >
              <SettingsIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Paper>
  );
};

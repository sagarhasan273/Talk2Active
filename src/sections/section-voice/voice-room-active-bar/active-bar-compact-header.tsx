import type { RoomResponse } from 'src/types/type-chat';

import React from 'react';
import { Volume2Icon, PhoneOffIcon } from 'lucide-react';

import ShareIcon from '@mui/icons-material/Share';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { Box, Stack, alpha, Paper, Tooltip, useTheme, Typography, IconButton } from '@mui/material';

// ----------------------------------------------------------------------
// Small Room Header - shown when inside room
// ----------------------------------------------------------------------

export const CompactRoomHeader = ({
  room,
  isHost,
  onBack,
  onSettingsClick,
  onShareClick,
  onLeaveRoom,
}: {
  room: RoomResponse;
  isHost: boolean;
  onBack: () => void;
  onSettingsClick: () => void;
  onShareClick?: () => void;
  onLeaveRoom: () => void;
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        borderRadius: { xs: 1, sm: 1.5 },
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,

        animation: 'voiceCompactHeaderIn 0.24s ease-out',

        '@keyframes voiceCompactHeaderIn': {
          from: { opacity: 0, transform: 'translateY(-4px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },

        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={{ xs: 0.75, sm: 1 }}
        sx={{
          minHeight: { xs: 48, sm: 54 },
          px: { xs: 0.75, sm: 1 },
        }}
      >
        {/* Back */}
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

        {/* Room icon */}
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.09),
            color: 'primary.main',
            flexShrink: 0,
          }}
        >
          <Volume2Icon size={15} />
        </Box>

        {/* Room title */}
        <Box
          sx={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              noWrap
              sx={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',

                fontSize: {
                  xs: '0.78rem',
                  sm: '0.85rem',
                },

                fontWeight: 800,
              }}
            >
              {room?.topic || 'Untitled room'}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.35,
                flexShrink: 0,
              }}
            >
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
                  display: {
                    xs: 'none',
                    sm: 'block',
                  },

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

          <Typography
            variant="caption"
            noWrap
            sx={{
              display: 'block',
              color: 'text.secondary',
              fontSize: 9,
              mt: 0.15,
            }}
          >
            {room?.language || 'English'} • {room?.level || 'All Levels'}
          </Typography>
        </Box>

        {/* Share */}
        {onShareClick && (
          <Tooltip title="Share room">
            <IconButton
              onClick={onShareClick}
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
        )}

        {/* Settings */}
        {isHost && (
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

        {/* Leave */}
        <Tooltip title="Leave room">
          <IconButton
            onClick={onLeaveRoom}
            size="small"
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.25,

              color: 'error.main',
              bgcolor: alpha(theme.palette.error.main, 0.08),
              transition: theme.transitions.create(['background-color'], { duration: 150 }),

              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.16),
              },
            }}
          >
            <PhoneOffIcon size={15} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
};

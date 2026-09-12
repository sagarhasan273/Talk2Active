import type { RoomResponse } from 'src/types/type-chat';

import { UsersIcon, Volume2Icon, PhoneOffIcon, ArrowRightIcon } from 'lucide-react';

import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import {
  Box,
  Stack,
  alpha,
  Paper,
  Tooltip,
  useTheme,
  Typography,
  IconButton,
  useMediaQuery,
} from '@mui/material';

import { ActiveSpeaker } from './room-header-active-speaker';
import { ParticipantAvatarStack } from './room-header-participant-avatar-stack';

import type { VoiceParticipant } from './types';

export const VoiceRoomActiveBar = ({
  room,
  participants,
  currentSpeaker,
  onEnterRoom,
  onLeaveRoom,
}: {
  room: RoomResponse;
  participants: VoiceParticipant[];
  currentSpeaker?: VoiceParticipant | null;
  onEnterRoom: () => void;
  onLeaveRoom: () => void;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const participantCount = participants.length;

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        overflow: 'hidden',
        borderRadius: 1,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
        bgcolor: 'background.paper',
        boxShadow: {
          xs: `0 3px 14px ${alpha(theme.palette.common.black, 0.06)}`,
          sm: `0 4px 18px ${alpha(theme.palette.common.black, 0.07)}`,
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',

          px: { xs: 1, sm: 1.5 },
          py: { xs: 0.9, sm: 1.1 },

          display: 'flex',
          alignItems: 'center',
          gap: { xs: 0.8, sm: 1.25 },

          minHeight: { xs: 58, sm: 64 },
        }}
      >
        {/* Active indicator */}
        <Box
          sx={{
            width: 4,
            alignSelf: 'stretch',
            borderRadius: 2,
            bgcolor: 'success.main',
            flexShrink: 0,
          }}
        />

        {/* Icon with pulsing rings */}
        <Box
          sx={{
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
            <Volume2Icon size={isMobile ? 17 : 26} />
          </Box>
        </Box>

        {/* Room information */}
        <Box
          sx={{
            minWidth: 0,
            flex: 1,
            overflow: 'hidden',
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            sx={{
              minWidth: 0,
              mb: 0.25,
            }}
          >
            <Typography
              sx={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: {
                  xs: '0.8rem',
                  sm: '0.875rem',
                },

                fontWeight: 800,
                color: 'text.primary',
              }}
            >
              {room?.topic || 'Untitled room'}
            </Typography>

            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.4,
                px: 0.6,
                py: 0.2,
                borderRadius: 0.75,
                bgcolor: alpha(theme.palette.success.main, 0.1),
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
                  fontSize: 8,
                  lineHeight: 1,
                  fontWeight: 800,
                  color: 'success.main',
                  textTransform: 'uppercase',
                }}
              >
                Live
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              variant="caption"
              noWrap
              sx={{
                fontSize: 10,
                color: 'text.secondary',
                fontWeight: 600,
              }}
            >
              {room?.languages || 'English'}
            </Typography>

            <Box
              sx={{
                width: 3,
                height: 3,
                borderRadius: '50%',
                bgcolor: 'text.disabled',
              }}
            />

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.35}
              sx={{
                flexShrink: 0,
              }}
            >
              <UsersIcon size={11} />

              <Typography
                variant="caption"
                sx={{
                  fontSize: 10,
                  color: 'text.secondary',
                  fontWeight: 700,
                }}
              >
                {participantCount}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {/* Desktop participant avatars */}
        {!isMobile && participantCount > 0 && (
          <ParticipantAvatarStack participants={participants} />
        )}

        {/* Current speaker */}
        {!isMobile && (
          <Box
            sx={{
              pl: 1.25,
              borderLeft: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
            }}
          >
            <ActiveSpeaker speaker={currentSpeaker} />
          </Box>
        )}

        {/* Mobile speaker */}
        {isMobile && (
          <Box
            sx={{
              maxWidth: 120,
              overflow: 'hidden',
            }}
          >
            <ActiveSpeaker speaker={currentSpeaker} mobile />
          </Box>
        )}

        {/* Enter room */}
        <Tooltip title="Open room">
          <IconButton
            onClick={onEnterRoom}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              width: { xs: 34, sm: 38 },
              height: { xs: 34, sm: 38 },
              borderRadius: 1.5,

              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',

              flexShrink: 0,
              transition: theme.transitions.create(['background-color', 'transform'], {
                duration: 150,
              }),

              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.18),
                transform: 'translateX(2px)',
              },
            }}
          >
            <ArrowRightIcon size={isMobile ? 17 : 19} />
          </IconButton>
        </Tooltip>

        {/* Leave active room */}
        <Tooltip title="Leave room">
          <IconButton
            onClick={onLeaveRoom}
            size="small"
            sx={{
              display: {
                xs: 'none',
                sm: 'flex',
              },

              width: 34,
              height: 34,
              borderRadius: 1.25,

              color: 'error.main',
              bgcolor: alpha(theme.palette.error.main, 0.07),
              transition: theme.transitions.create(['background-color'], { duration: 150 }),

              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.14),
              },
            }}
          >
            <PhoneOffIcon size={15} />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

import type { RoomType } from 'src/types/type-chat';

import {
  ArrowRightIcon,
  Headphones,
  PhoneOffIcon,
} from 'lucide-react';

import {
  alpha,
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

import { ActiveSpeaker } from './room-header-active-speaker';
import { ParticipantAvatarStack } from './room-header-participant-avatar-stack';
import type { VoiceParticipant } from './types';
import { formatLanguages } from './utils';

// ----------------------------------------------------------------------

const soundwave = keyframes`
  0%, 100% { height: 4px; }
  50% { height: 16px; }
`;

const liveGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6); }
  70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
`;

// ----------------------------------------------------------------------

export const VoiceRoomActiveBar = ({
  room,
  participants,
  currentSpeaker,
  onEnterRoom,
  onLeaveRoom,
}: {
  room: RoomType;
  participants: VoiceParticipant[];
  currentSpeaker?: VoiceParticipant | null;
  onEnterRoom: () => void;
  onLeaveRoom: () => void;
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const participantCount = participants.length;

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2,
        backdropFilter: 'blur(20px)',
        bgcolor: isDark
          ? alpha(theme.palette.background.paper, 0.82)
          : alpha(theme.palette.common.white, 0.92),
        border: '1px solid',
        borderColor: isDark
          ? alpha(theme.palette.primary.main, 0.28)
          : alpha(theme.palette.primary.main, 0.2),

        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.45),
          boxShadow: isDark
            ? `0 12px 20px -4px rgba(0, 0, 0, 0.65), 0 0 18px ${alpha(theme.palette.primary.main, 0.15)}`
            : `0 12px 20px -4px ${alpha(theme.palette.primary.main, 0.18)}, 0 6px 16px rgba(0,0,0,0.05)`,
        },
      }}
    >
      {/* Top ambient color bar indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2.5,
          background: `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.info.main} 100%)`,
        }}
      />

      {/* Main Bar Content */}
      <Box
        sx={{
          px: { xs: 1.25, sm: 2 },
          py: { xs: 1, sm: 1.2 },
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, sm: 1.75 },
          minHeight: { xs: 56, sm: 66 },
        }}
      >
        {/* Animated Equalizer Wave Badge */}
        <Box
          onClick={onEnterRoom}
          sx={{
            position: 'relative',
            width: { xs: 38, sm: 44 },
            height: { xs: 38, sm: 44 },
            borderRadius: 1.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)}, ${alpha(theme.palette.primary.main, 0.06)})`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            transition: 'transform 0.2s ease, background-color 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.28)}, ${alpha(theme.palette.primary.main, 0.12)})`,
            },
          }}
        >
          {/* Sound bars animation */}
          <Stack direction="row" alignItems="center" spacing={0.45} sx={{ height: 18 }}>
            {[0.1, 0.4, 0.2, 0.5].map((delay, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 3,
                  borderRadius: 1.5,
                  bgcolor: 'primary.main',
                  animation: `${soundwave} 1.2s ease-in-out infinite`,
                  animationDelay: `${delay}s`,
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Room Info: Title + Tags */}
        <Box
          onClick={onEnterRoom}
          sx={{
            minWidth: 0,
            flex: 1,
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, mb: 0.35 }}>
            <Typography
              noWrap
              sx={{
                fontSize: { xs: '0.85rem', sm: '0.95rem' },
                fontWeight: 800,
                color: 'text.primary',
                letterSpacing: '-0.01em',
              }}
            >
              {room?.topic || 'Untitled voice room'}
            </Typography>

            {/* Pulsing Live Chip */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 0.75,
                py: 0.2,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.success.main, 0.12),
                color: 'success.main',
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  animation: `${liveGlow} 1.8s infinite`,
                }}
              />
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

          {/* Sub-meta: Languages & Listener counts */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
            {room?.languages?.length ? (
              <Typography
                variant="caption"
                noWrap
                sx={{
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  maxWidth: { xs: 110, sm: 180 },
                }}
              >
                {formatLanguages(room.languages)}
              </Typography>
            ) : null}

            <Box
              sx={{
                width: 3,
                height: 3,
                borderRadius: '50%',
                bgcolor: 'text.disabled',
                flexShrink: 0,
              }}
            />

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.4}
              sx={{
                flexShrink: 0,
                color: 'text.secondary',
              }}
            >
              <Headphones size={12} />
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  color: 'text.secondary',
                }}
              >
                {participantCount} {participantCount === 1 ? 'peer' : 'peers'}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {/* Participant Stack preview (Desktop / Tablet only) */}
        {!isMobile && participantCount > 0 && (
          <Box sx={{ flexShrink: 0 }}>
            <ParticipantAvatarStack participants={participants} />
          </Box>
        )}

        {/* Active Speaker Area (Desktop / Tablet) */}
        {!isMobile && (
          <Box
            sx={{
              pl: 1.5,
              borderLeft: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
              flexShrink: 0,
            }}
          >
            <ActiveSpeaker speaker={currentSpeaker} />
          </Box>
        )}

        {/* Mobile Active Speaker */}
        {isMobile && currentSpeaker && (
          <Box sx={{ maxWidth: 95, flexShrink: 0, overflow: 'hidden' }}>
            <ActiveSpeaker speaker={currentSpeaker} mobile />
          </Box>
        )}

        {/* Primary Action Button: Enter Stage */}
        <Tooltip title="Expand stage dialog" arrow>
          <Button
            size="small"
            variant="contained"
            onClick={onEnterRoom}
            endIcon={<ArrowRightIcon size={15} />}
            sx={{
              height: { xs: 34, sm: 38 },
              px: { xs: 1.25, sm: 2 },
              borderRadius: 1.25,
              textTransform: 'none',
              fontWeight: 800,
              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              flexShrink: 0,
              boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
              '&:hover': {
                boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.45)}`,
                transform: 'translateY(-1px)',
              },
            }}
          >
            {!isTablet ? 'Open Stage' : ''}
          </Button>
        </Tooltip>

        {/* Disconnect / Leave Stage Button */}
        <Tooltip title="Disconnect voice" arrow>
          <IconButton
            onClick={onLeaveRoom}
            size="small"
            sx={{
              width: { xs: 34, sm: 38 },
              height: { xs: 34, sm: 38 },
              borderRadius: 1.25,
              color: 'error.main',
              bgcolor: alpha(theme.palette.error.main, 0.08),
              border: `1px solid ${alpha(theme.palette.error.main, 0.18)}`,
              flexShrink: 0,
              transition: 'all 0.18s ease',
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.18),
                borderColor: theme.palette.error.main,
                transform: 'scale(1.05)',
              },
            }}
          >
            <PhoneOffIcon size={16} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Mobile-Only Dedicated Bottom Row for Participant Avatar Stack */}
      {isMobile && participantCount > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.5,
            py: 0.6,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
            bgcolor: isDark
              ? alpha('#fff', 0.02)
              : alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.675rem',
              fontWeight: 700,
              color: 'text.secondary',
              letterSpacing: 0.2,
            }}
          >
            On stage ({participantCount})
          </Typography>

          <ParticipantAvatarStack participants={participants} />
        </Box>
      )}
    </Paper>
  );
};

export default VoiceRoomActiveBar;

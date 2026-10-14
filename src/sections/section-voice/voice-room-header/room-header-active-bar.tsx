// src/sections/section-voice/voice-room-header/room-header-active-bar.tsx

import type { RoomParticipantType, RoomType } from '@/types/type-room';

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

import { Label } from '@/components/label';
import { fgetLanguageName } from '@/utils/helper';
import { ActiveSpeaker } from './room-header-active-speaker';
import { ParticipantAvatarStack } from './room-header-participant-avatar-stack';

// ----------------------------------------------------------------------

const soundwave = keyframes`
  0%, 100% { height: 4px; }
  50% { height: 16px; }
`;

const liveGlow = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.55; transform: scale(0.88); }
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
  participants: RoomParticipantType[];
  currentSpeaker?: RoomParticipantType | null;
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
        borderRadius: 1,
        backdropFilter: 'blur(20px)',
        bgcolor: isDark ? alpha('#181c26', 0.94) : alpha('#ffffff', 0.96),
        border: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
        transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.4),
        },
      }}
    >
      {/* Main Bar Content */}
      <Box
        sx={{
          px: { xs: 1.5, sm: 2.25 },
          py: { xs: 1.25, sm: 1.5 },
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.25, sm: 2 },
          minHeight: { xs: 58, sm: 68 },
        }}
      >
        {/* Animated Equalizer Wave Badge */}
        <Box
          onClick={onEnterRoom}
          sx={{
            position: 'relative',
            width: { xs: 38, sm: 42 },
            height: { xs: 38, sm: 42 },
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
            bgcolor: alpha(theme.palette.primary.main, isDark ? 0.14 : 0.08),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.04)',
              bgcolor: alpha(theme.palette.primary.main, 0.18),
            },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.45} sx={{ height: 18 }}>
            {[0.1, 0.4, 0.2, 0.5].map((delay, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 3,
                  borderRadius: 1,
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
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, mb: 0.4 }}>
            {/* Simplified Pulsing Live Dot */}
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'success.main',
                flexShrink: 0,
                boxShadow: `0 0 8px ${alpha(theme.palette.success.main, isDark ? 0.8 : 0.5)}`,
                animation: `${liveGlow} 2s infinite ease-in-out`,
              }}
            />

            <Typography
              noWrap
              sx={{
                fontSize: { xs: '0.875rem', sm: '0.975rem' },
                fontWeight: 800,
                color: isDark ? 'text.primary' : '#0f172a',
                letterSpacing: '-0.01em',
              }}
            >
              {room?.topic || 'Untitled voice room'}
            </Typography>
          </Stack>

          {/* Sub-meta: Languages & Listener counts */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
            {room?.languages?.length
              ? room?.languages?.map((lang, index) => (
                <Label
                  key={`${lang}-${index}`}
                  label={lang !== 'unknown' ? fgetLanguageName(lang) : 'Any'}
                  size="small"
                  color="primary"
                  sx={{
                    borderRadius: 1,
                    bgcolor: isDark
                      ? alpha(theme.palette.primary.main, 0.14)
                      : alpha(theme.palette.primary.main, 0.08),
                    fontWeight: 700,
                  }}
                />
              ))
              : null}

            <Box
              sx={{
                width: 3,
                height: 3,
                borderRadius: '50%',
                bgcolor: isDark ? 'text.disabled' : '#cbd5e1',
                flexShrink: 0,
              }}
            />

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{
                flexShrink: 0,
                color: isDark ? 'text.secondary' : '#475569',
              }}
            >
              <Headphones size={12} />
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  color: isDark ? 'text.secondary' : '#475569',
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
              pl: 1.75,
              borderLeft: `1px solid ${isDark ? alpha('#fff', 0.08) : '#e2e8f0'}`,
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
            disableElevation
            onClick={onEnterRoom}
            endIcon={<ArrowRightIcon size={15} />}
            sx={{
              height: { xs: 34, sm: 38 },
              px: { xs: 1.5, sm: 2 },
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              flexShrink: 0,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.28)}`,
                transform: 'translateY(-1px)',
              },
            }}
          >
            {!isTablet ? 'Open Room' : 'Room'}
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
              borderRadius: 1,
              color: 'error.main',
              bgcolor: alpha(theme.palette.error.main, 0.1),
              border: `1px solid ${alpha(theme.palette.error.main, 0.22)}`,
              flexShrink: 0,
              transition: 'all 0.18s ease',
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.18),
                borderColor: theme.palette.error.main,
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
            py: 0.75,
            borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : '#e2e8f0'}`,
            bgcolor: isDark ? alpha('#fff', 0.02) : '#f8fafc',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.675rem',
              fontWeight: 700,
              color: isDark ? 'text.secondary' : '#475569',
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

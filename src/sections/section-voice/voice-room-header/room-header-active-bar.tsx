import type { RoomType } from '@/types/type-room';

import { useParticipants } from '@livekit/components-react';
import { ArrowRightIcon, Headphones, PhoneOffIcon } from 'lucide-react';
import { useState } from 'react';

import {
  alpha,
  Box,
  Button,
  IconButton,
  keyframes,
  Paper,
  Popover,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { Label } from '@/components/label';
import { fgetLanguageName } from '@/utils/helper';
import { ParticipantAvatarStack } from './room-header-participant-avatar-stack';

// ─── Animations ─────────────────────────────────────────────────────────

const soundwave = keyframes`
  0%, 100% { height: 4px; }
  50%      { height: 20px; }
`;

const liveGlow = keyframes`
  0%, 100% { opacity: 1;   transform: scale(1); }
  50%      { opacity: 0.5; transform: scale(0.8); }
`;

const spin = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to   { transform: translate(-50%, -50%) rotate(360deg); }
`;

// Gentle sweeping motion for the inner background
const panBackground = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const reduceMotion = { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } };

// ----------------------------------------------------------------------

type Props = {
  room: RoomType;
  onEnterRoom: () => void;
  onLeaveRoom: () => void;
};

export const VoiceRoomActiveBar = ({ room, onEnterRoom, onLeaveRoom }: Props) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // State for the Popover anchor
  const [leaveAnchorEl, setLeaveAnchorEl] = useState<HTMLButtonElement | null>(null);

  const participants = useParticipants();
  const participantCount = participants.length;

  const live = theme.palette.success.main;
  const primary = theme.palette.primary.main;

  // 1. Base colors
  const baseDark = '#181c26';
  const baseLight = '#ffffff';
  const base = isDark ? baseDark : baseLight;

  // 2. Mix colors for the sweeping gradient
  const mixLive = isDark ? `color-mix(in srgb, ${live} 12%, ${base})` : `color-mix(in srgb, ${live} 8%, ${base})`;
  const mixPrimary = isDark ? `color-mix(in srgb, ${primary} 12%, ${base})` : `color-mix(in srgb, ${primary} 6%, ${base})`;

  // 3. Solid cutouts for the Avatar Stack borders
  const cutoutSurface = mixLive;
  const cutoutMobileRow2 = isDark ? `color-mix(in srgb, #000 25%, ${cutoutSurface})` : `color-mix(in srgb, ${live} 4%, #f8fafc)`;

  // 4. Reusable animated background configuration
  const movingBackgroundConfig = {
    background: `linear-gradient(90deg, ${mixLive}, ${mixPrimary}, ${mixLive})`,
    backgroundSize: '200% 100%',
    animation: `${panBackground} 6s ease-in-out infinite`,
  };

  // ── Shared pieces ──────────────────────────────────────────────────

  const equalizer = (
    <Box
      onClick={onEnterRoom}
      role="button"
      aria-label="Open stage"
      sx={{
        width: { xs: 40, sm: 52 },
        height: { xs: 40, sm: 52 },
        borderRadius: 0.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        cursor: 'pointer',
        background: `linear-gradient(145deg, ${alpha(live, isDark ? 0.35 : 0.22)}, ${alpha(live, isDark ? 0.12 : 0.06)})`,
        border: `1px solid ${alpha(live, 0.5)}`,
        transition: 'transform 0.2s ease',
        '&:hover': { transform: 'scale(1.06)' },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ height: 22 }}>
        {[0.1, 0.45, 0.2, 0.55, 0.3].map((delay, idx) => (
          <Box
            key={idx}
            sx={{
              width: { xs: 3, sm: 3.5 },
              borderRadius: 2,
              bgcolor: live,
              animation: `${soundwave} 1s ease-in-out infinite`,
              animationDelay: `${delay}s`,
              ...reduceMotion,
            }}
          />
        ))}
      </Stack>
    </Box>
  );

  const info = (
    <Box onClick={onEnterRoom} sx={{ minWidth: 0, flex: 1, cursor: 'pointer' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, mb: 0.5 }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.6}
          sx={{
            px: 0.9,
            height: 18,
            borderRadius: 0.75,
            flexShrink: 0,
            bgcolor: alpha(theme.palette.error.main, 0.14),
            border: `1px solid ${alpha(theme.palette.error.main, 0.35)}`,
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: 'error.main',
              boxShadow: `0 0 8px ${alpha(theme.palette.error.main, 0.9)}`,
              animation: `${liveGlow} 1.6s infinite ease-in-out`,
              ...reduceMotion,
            }}
          />
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'error.main', lineHeight: 1 }}>
            Live
          </Typography>
        </Stack>

        <Typography
          noWrap
          sx={{
            fontSize: { xs: '0.9rem', sm: '1.1rem' },
            fontWeight: 800,
            color: isDark ? 'text.primary' : '#0f172a',
            letterSpacing: '-0.02em',
          }}
        >
          {room?.topic || 'Untitled voice room'}
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
        {room?.languages?.length ? (
          <Label
            label={room.languages[0] !== 'unknown' ? fgetLanguageName(room.languages[0]) : 'Any'}
            size="small"
            sx={{
              borderRadius: 0.75,
              bgcolor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.08),
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '0.65rem',
              height: 20,
            }}
          />
        ) : null}

        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: isDark ? 'text.secondary' : '#64748b' }}>
          <Headphones size={13} strokeWidth={2.5} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
            {participantCount} {participantCount === 1 ? 'peer' : 'peers'}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );

  const joinButton = (
    <Tooltip title="Expand stage dialog" arrow>
      <Button
        variant="contained"
        onClick={onEnterRoom}
        endIcon={<ArrowRightIcon size={16} strokeWidth={3} />}
        sx={{
          height: { xs: 36, sm: 44 },
          px: { xs: 2, sm: 2.75 },
          borderRadius: 0.5,
          textTransform: 'none',
          fontWeight: 800,
          fontSize: { xs: '0.8rem', sm: '0.9rem' },
          flexShrink: 0,
          color: '#fff',
          background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main} 55%, ${theme.palette.primary.dark})`,
          boxShadow: 'none',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 'none',
          },
        }}
      >
        {isTablet ? 'Join' : 'Open Stage'}
      </Button>
    </Tooltip>
  );

  const leaveButton = (
    <Tooltip title="Disconnect voice" arrow>
      <IconButton
        onClick={(e) => setLeaveAnchorEl(e.currentTarget)}
        aria-label="Disconnect voice"
        sx={{
          width: { xs: 36, sm: 44 },
          height: { xs: 36, sm: 44 },
          borderRadius: 0.5,
          color: 'error.main',
          bgcolor: alpha(theme.palette.error.main, 0.1),
          border: `1px solid ${alpha(theme.palette.error.main, 0.25)}`,
          flexShrink: 0,
          transition: 'all 0.2s ease',
          '&:hover': { bgcolor: 'error.main', color: 'common.white', transform: 'scale(1.06)' },
        }}
      >
        <PhoneOffIcon size={16} strokeWidth={2.5} />
      </IconButton>
    </Tooltip>
  );

  // ── Layout ─────────────────────────────────────────────────────────

  return (
    <>
      <Box
        sx={{
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 0.5,
          p: '2px',
          isolation: 'isolate',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '200%',
            aspectRatio: '1 / 1',
            zIndex: -1,
            background: `conic-gradient(from 0deg, ${alpha(live, 0.15)}, ${live}, ${theme.palette.primary.main}, ${alpha(live, 0.15)} 50%, ${live}, ${theme.palette.primary.main}, ${alpha(live, 0.15)})`,
            animation: `${spin} 4s linear infinite`,
          },
          ...reduceMotion,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 0.5,
            boxShadow: 'none',
            border: 'none',
            ...movingBackgroundConfig,
          }}
        >
          {isMobile ? (
            <>
              <Box sx={{ px: 1.5, pt: 1.25, pb: 1, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                {equalizer}
                {info}
                {leaveButton}
              </Box>
              <Box
                sx={{
                  px: 1.5,
                  py: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  borderTop: `1px solid ${isDark ? alpha('#fff', 0.07) : alpha(live, 0.18)}`,
                }}
              >
                <Box sx={{ minWidth: 0, flexShrink: 0 }}>
                  {participantCount > 0 && <ParticipantAvatarStack surface={cutoutMobileRow2} />}
                </Box>
                {joinButton}
              </Box>
            </>
          ) : (
            <Box
              sx={{
                px: { sm: 2, md: 2.75 },
                py: 1.5,
                minHeight: 76,
                display: 'flex',
                alignItems: 'center',
                gap: { sm: 2, md: 2.5 },
              }}
            >
              {equalizer}
              {info}
              {participantCount > 0 && (
                <Box sx={{ flexShrink: 0 }}>
                  <ParticipantAvatarStack surface={cutoutSurface} />
                </Box>
              )}
              {joinButton}
              {leaveButton}
            </Box>
          )}
        </Paper>
      </Box>

      {/* Confirmation Popover */}
      <Popover
        open={Boolean(leaveAnchorEl)}
        anchorEl={leaveAnchorEl}
        onClose={() => setLeaveAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 2,
              borderRadius: 0.75,
              minWidth: 220,
              bgcolor: isDark ? '#181c26' : '#ffffff',
              border: '1px solid',
              borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
              boxShadow: isDark
                ? '0 8px 32px rgba(0,0,0,0.6)'
                : '0 8px 24px rgba(15,23,42,0.1)',
              backgroundImage: 'none',
            }
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, color: isDark ? 'text.primary' : '#0f172a' }}>
          Leave Room?
        </Typography>
        <Typography variant="caption" sx={{ color: isDark ? 'text.secondary' : '#475569', display: 'block', mb: 2.5 }}>
          Are you sure you want to disconnect?
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            size="small"
            color="inherit"
            onClick={() => setLeaveAnchorEl(null)}
            sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 0.5 }}
          >
            Cancel
          </Button>
          <Button
            size="small"
            color="error"
            variant="contained"
            disableElevation
            onClick={() => {
              setLeaveAnchorEl(null);
              onLeaveRoom();
            }}
            sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 0.5 }}
          >
            Leave
          </Button>
        </Stack>
      </Popover>
    </>
  );
};

export default VoiceRoomActiveBar;

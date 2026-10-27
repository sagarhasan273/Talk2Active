import type { RoomType } from '@/types/type-room';

import { useParticipants } from '@livekit/components-react';
import { ArrowRightIcon, Headphones, PhoneOffIcon } from 'lucide-react';
import { useState } from 'react';

import {
  alpha,
  Box,
  Button,
  ButtonBase,
  darken,
  IconButton,
  keyframes,
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

const reduceMotion = { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } };

// ─── Component ──────────────────────────────────────────────────────────

type Props = {
  room: RoomType;
  onEnterRoom: () => void;
  onLeaveRoom: () => void;
};

export const VoiceRoomActiveBar = ({ room, onEnterRoom, onLeaveRoom }: Props) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [leaveAnchorEl, setLeaveAnchorEl] = useState<HTMLButtonElement | null>(null);

  const participantCount = useParticipants().length;

  const live = theme.palette.primary.darker;
  const onLive = theme.palette.common.white;
  const bottomBg = darken(live, 0.2);
  const stackAccent = { accent: onLive, onAccent: theme.palette.common.white };

  const surfaceSx = {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 0.5,
    color: onLive,
    backgroundColor: live,
    border: `1px solid ${alpha(onLive, 0.2)}`,
    boxShadow: theme.shadows[isDark ? 0 : 1],
  } as const;

  // ── Pieces ─────────────────────────────────────────────────────────

  const equalizer = (
    <Box
      aria-hidden
      sx={{
        width: { xs: 40, sm: 48 },
        height: { xs: 40, sm: 48 },
        borderRadius: 0.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        bgcolor: alpha(onLive, 0.18),
        border: `1px solid ${alpha(onLive, 0.35)}`,
      }}
    >
      <Stack direction="row" alignItems="center" sx={{ gap: 0.5, height: 22 }}>
        {[0.1, 0.45, 0.2, 0.55, 0.3].map((delay, idx) => (
          <Box
            key={idx}
            sx={{
              width: 3,
              borderRadius: 2,
              bgcolor: onLive,
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
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Stack direction="row" alignItems="center" sx={{ gap: 1, minWidth: 0, mb: 0.5 }}>
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            gap: 0.6,
            px: 0.9,
            height: 18,
            borderRadius: 0.5,
            flexShrink: 0,
            bgcolor: 'error.main',
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: 'error.contrastText',
              animation: `${liveGlow} 1.6s infinite ease-in-out`,
              ...reduceMotion,
            }}
          />
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'error.contrastText', lineHeight: 1 }}>
            Live
          </Typography>
        </Stack>

        <Typography
          noWrap
          sx={{
            fontSize: { xs: '0.95rem', sm: '1.05rem' },
            fontWeight: 800,
            color: onLive,
            letterSpacing: '-0.01em',
          }}
        >
          {room?.topic || 'Untitled voice room'}
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" sx={{ gap: 1.25, minWidth: 0 }}>
        {room?.languages?.length ? (
          <Label
            label={room.languages[0] !== 'unknown' ? fgetLanguageName(room.languages[0]) : 'Any'}
            size="small"
            sx={{
              borderRadius: 0.5,
              bgcolor: alpha(onLive, 0.2),
              color: onLive,
              fontWeight: 700,
              fontSize: '0.65rem',
              height: 20,
            }}
          />
        ) : null}

        <Stack direction="row" alignItems="center" sx={{ gap: 0.5, color: alpha(onLive, 0.85) }}>
          <Headphones size={13} strokeWidth={2.5} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
            {participantCount} {participantCount === 1 ? 'peer' : 'peers'}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );

  const openArea = (
    <ButtonBase
      onClick={onEnterRoom}
      disableRipple
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: { xs: 1.25, sm: 2 },
        flex: 1,
        minWidth: 0,
        textAlign: 'left',
        borderRadius: 0.5,
        WebkitTapHighlightColor: 'transparent',
        '&:focus-visible': { outline: `2px solid ${onLive}`, outlineOffset: 2 },
      }}
    >
      {equalizer}
      {info}
    </ButtonBase>
  );

  const joinButton = (
    <Tooltip title="Expand stage dialog" arrow>
      <Button
        variant="contained"
        disableElevation
        onClick={onEnterRoom}
        endIcon={<ArrowRightIcon size={16} strokeWidth={3} />}
        sx={{
          height: { xs: 38, sm: 44 },
          px: { xs: 2.25, sm: 2.75 },
          borderRadius: 0.5,
          textTransform: 'none',
          fontWeight: 800,
          fontSize: { xs: '0.85rem', sm: '0.9rem' },
          flexShrink: 0,
          bgcolor: onLive,
          color: live,
          '&:hover': { bgcolor: alpha(onLive, 0.9) },
        }}
      >
        {isTablet ? 'Join' : 'Open stage'}
      </Button>
    </Tooltip>
  );

  const leaveButton = (
    <Tooltip title="Disconnect voice" arrow>
      <IconButton
        onClick={(e) => setLeaveAnchorEl(e.currentTarget)}
        aria-label="Disconnect voice"
        sx={{
          width: { xs: 38, sm: 44 },
          height: { xs: 38, sm: 44 },
          borderRadius: 0.5,
          color: onLive,
          bgcolor: 'error.main',
          border: `1px solid ${alpha(onLive, 0.35)}`,
          flexShrink: 0,
          '&:hover': { bgcolor: 'error.main', color: 'error.contrastText' },
        }}
      >
        <PhoneOffIcon size={16} strokeWidth={2.5} />
      </IconButton>
    </Tooltip>
  );

  // ── Layout ─────────────────────────────────────────────────────────

  return (
    <>
      <Box sx={surfaceSx}>
        <Box sx={{ pl: 1.5, pr: 1.5, pt: 1.5, pb: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
          {openArea}
          {joinButton}
        </Box>
        <Box
          sx={{
            pl: 1.5,
            pr: 1.5,
            py: 1.25,
            backgroundColor: bottomBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            borderTop: `1px solid ${alpha(onLive, 0.25)}`,
          }}
        >
          <ParticipantAvatarStack surface={bottomBg} {...stackAccent} />
          {leaveButton}
        </Box>
      </Box>

      {/* Leave confirmation */}
      <Popover
        open={Boolean(leaveAnchorEl)}
        anchorEl={leaveAnchorEl}
        onClose={() => setLeaveAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 2,
              borderRadius: 0.5,
              minWidth: 240,
              backgroundImage: 'none',
              border: `1px solid ${theme.palette.divider}`,
            },
          },
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
          Leave room?
        </Typography>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', display: 'block', mb: 2.5 }}>
          You'll be disconnected from stage.
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            size="small"
            color="inherit"
            onClick={() => setLeaveAnchorEl(null)}
            sx={{ height: 26, borderRadius: 0.5, fontWeight: 600, textTransform: 'none' }}
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
            sx={{ height: 26, borderRadius: 0.5, fontWeight: 700, textTransform: 'none' }}
          >
            Leave
          </Button>
        </Stack>
      </Popover>
    </>
  );
};

export default VoiceRoomActiveBar;

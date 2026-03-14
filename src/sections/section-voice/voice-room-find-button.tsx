import { useSelector } from 'react-redux';

import { useTheme } from '@mui/material/styles';
import { Box, Chip, alpha, SvgIcon, ButtonBase, Typography } from '@mui/material';

import { varAlpha } from 'src/theme/styles';
import { selectAccount } from 'src/core/slices';

import { AvatarUser } from 'src/components/avatar-user';

const RoomIcon = () => (
  <SvgIcon viewBox="0 0 512 512" sx={{ width: 16, height: 16 }}>
    <path
      fill="currentColor"
      d="M440 424V88h-88V13.005L88 58.522V424H16v32h86.9L352 490.358V120h56v336h88v-32Zm-120 29.642l-200-27.586V85.478L320 51Z"
    />
    <path fill="currentColor" d="M256 232h32v64h-32z" />
  </SvgIcon>
);

interface FindRoomButtonProps {
  selected?: boolean;
  isJoined?: boolean;
  onClick?: () => void;
}

export function VoiceRoomFindButton({
  selected = false,
  isJoined = false,
  onClick,
}: FindRoomButtonProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary = theme.palette.primary.main;
  const backgroundColor = theme.vars.palette.background.paperChannel;
  const success = theme.palette.success.main;
  const currentUser = useSelector(selectAccount);

  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: 1,
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        mb: 1,
        textAlign: 'left',
        overflow: 'hidden',
        transition: 'all 0.22s ease',
        position: 'relative',

        bgcolor: selected ? varAlpha(backgroundColor, isDark ? 0.18 : 0.51) : 'background.paper',

        border: '1.5px solid',
        borderColor: selected
          ? alpha(primary, 0.45)
          : isDark
            ? alpha('#fff', 0.07)
            : alpha('#000', 0.07),

        color: selected ? primary : theme.palette.text.secondary,

        boxShadow: isJoined
          ? `0 4px 20px ${alpha(primary, 0.18)}`
          : selected
            ? `0 2px 12px ${alpha(primary, 0.2)}`
            : 'none',

        '&:hover': {
          borderColor: alpha(primary, isJoined ? 0.65 : selected ? 0.55 : 0.2),
          transform: 'translateY(-1px)',
          boxShadow: `0 4px 18px ${alpha(primary, isJoined ? 0.24 : 0.1)}`,
        },

        '&:active': { transform: 'scale(0.97)' },
      }}
    >
      {/* ── Always-visible top banner ───────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 0.55,
          bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
          borderBottom: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06),
          transition: 'background 0.22s',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {/* Dot — pulses green when joined, static grey when not */}
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              flexShrink: 0,
              bgcolor: isJoined ? success : theme.palette.text.disabled,
              boxShadow: isJoined ? `0 0 7px ${success}` : 'none',
              transition: 'background 0.3s, box-shadow 0.3s',
              ...(isJoined && {
                animation: 'livePulse 2s ease-in-out infinite',
                '@keyframes livePulse': {
                  '0%,100%': { opacity: 1, transform: 'scale(1)' },
                  '50%': { opacity: 0.5, transform: 'scale(0.72)' },
                },
              }),
            }}
          />
          <Typography
            sx={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: 0.3,
              color: isJoined ? primary : theme.palette.text.secondary,
              transition: 'color 0.2s',
            }}
          >
            Browsing other rooms to join
          </Typography>
        </Box>

        {/* LIVE pill — only when joined */}
        {isJoined && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.4,
              bgcolor: alpha(success, 0.15),
              border: `1px solid ${alpha(success, 0.45)}`,
              borderRadius: '8px',
              px: 0.75,
              py: 0.2,
            }}
          >
            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                bgcolor: success,
                boxShadow: `0 0 6px ${success}`,
              }}
            />
            <Typography
              sx={{ fontSize: '0.58rem', fontWeight: 900, color: success, letterSpacing: 0.9 }}
            >
              LIVE
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Main row ───────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 1.5,
          height: 44,
          gap: 1.25,
          position: 'relative',
        }}
      >
        {/* Left stripe when joined */}
        {isJoined && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              height: '55%',
              width: 3.5,
              borderRadius: '0 3px 3px 0',
              bgcolor: primary,
            }}
          />
        )}

        {/* Avatar (joined) or icon (default) */}
        {isJoined ? (
          <AvatarUser
            avatarUrl={currentUser?.profilePhoto ?? null}
            name={currentUser?.name ?? ''}
            verified={currentUser?.verified}
            accountType={currentUser?.accountType}
            sx={{ width: 28, height: 28, flexShrink: 0 }}
          />
        ) : (
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              bgcolor: selected
                ? alpha(primary, 0.18)
                : isDark
                  ? alpha('#fff', 0.07)
                  : alpha('#000', 0.05),
              color: 'inherit',
              transition: 'background 0.2s',
            }}
          >
            <RoomIcon />
          </Box>
        )}

        {/* Label */}
        <Typography
          noWrap
          sx={{
            fontWeight: isJoined || selected ? 700 : 500,
            fontSize: '0.82rem',
            color: 'inherit',
            letterSpacing: isJoined || selected ? '-0.01em' : 0,
            flex: 1,
          }}
        >
          Find a room
        </Typography>

        {/* YOU chip when joined */}
        {isJoined && (
          <Chip
            label="YOU"
            size="small"
            sx={{
              height: 16,
              fontSize: '0.58rem',
              fontWeight: 900,
              letterSpacing: 0.8,
              bgcolor: alpha(primary, 0.12),
              color: primary,
              border: `1px solid ${alpha(primary, 0.35)}`,
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        )}

        {/* BROWSE badge when selected and not joined */}
        {selected && !isJoined && (
          <Box
            sx={{
              fontSize: '0.6rem',
              fontWeight: 800,
              letterSpacing: 0.8,
              color: primary,
              bgcolor: alpha(primary, 0.12),
              border: `1px solid ${alpha(primary, 0.3)}`,
              borderRadius: '8px',
              px: 0.75,
              py: 0.2,
              lineHeight: 1.6,
            }}
          >
            BROWSE
          </Box>
        )}
      </Box>
    </ButtonBase>
  );
}

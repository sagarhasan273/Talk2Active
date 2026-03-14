import type { RoomResponse } from 'src/types/type-chat';

import React from 'react';
import { useSelector } from 'react-redux';

import { useTheme } from '@mui/material/styles';
import { Box, alpha, Tooltip, Typography, ButtonBase, AvatarGroup } from '@mui/material';

import { selectAccount } from 'src/core/slices';

import { AvatarUser } from 'src/components/avatar-user';

// ─────────────────────────────────────────────────────────────────────────────

type VoiceRoomSelectButtonProps = {
  selected?: boolean;
  isJoined?: boolean;
  room: RoomResponse;
  onClick: (room: RoomResponse) => void;
};

const VoiceRoomSelectButton = ({
  selected = false,
  isJoined = false,
  room,
  onClick,
}: VoiceRoomSelectButtonProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary = theme.palette.primary.main;
  const success = theme.palette.success.main;

  const currentUser = useSelector(selectAccount);

  if (!room?.id) return null;

  const participantCount = room?.currentParticipants?.length ?? 0;

  const langLabel =
    (room.languages?.length ?? 0) > 2
      ? `${room.languages
          .slice(0, 2)
          .map((l) => l.toUpperCase())
          .join(' · ')} +${room.languages.length - 2}`
      : (room.languages?.map((l) => l.toUpperCase()).join(' · ') ?? '');

  // ── Joined-state style tokens ──────────────────────────────────────────
  const joinedBg = isDark ? alpha(primary, 0.15) : alpha(primary, 0.07);
  const joinedBorder = alpha(primary, 0.5);
  const defaultBg = selected
    ? theme.palette.background.paper
    : isDark
      ? alpha('#fff', 0.03)
      : theme.palette.background.paper;
  const defaultBorder = selected ? alpha(primary, 0.6) : theme.palette.divider;

  return (
    <ButtonBase
      onClick={() => onClick(room)}
      sx={{
        width: 1,
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        mb: 0.75,
        textAlign: 'left',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        bgcolor: isJoined ? joinedBg : defaultBg,
        border: selected ? '2px solid' : '1.5px solid',
        borderColor: isJoined ? joinedBorder : defaultBorder,
        boxShadow: isJoined
          ? `0 4px 20px ${alpha(primary, 0.18)}`
          : `0 1px 4px ${alpha('#000', 0.06)}`,
        '&:hover': {
          borderColor: alpha(primary, isJoined ? 0.65 : 0.3),
          transform: 'translateY(-1px)',
          boxShadow: isJoined
            ? `0 6px 26px ${alpha(primary, 0.24)}`
            : `0 4px 14px ${alpha('#000', 0.08)}`,
        },
        '&:active': { transform: 'scale(0.98)' },
      }}
    >
      {/* ── "You're in this room" banner — only when joined ────────────── */}
      {isJoined && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.5,
            py: 0.6,
            bgcolor: alpha(primary, isDark ? 0.22 : 0.12),
            borderBottom: `1px solid ${alpha(primary, 0.2)}`,
          }}
        >
          {/* Left: dot + label */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: success,
                boxShadow: `0 0 7px ${success}`,
                flexShrink: 0,
                animation: 'livePulse 2s ease-in-out infinite',
                '@keyframes livePulse': {
                  '0%,100%': { opacity: 1, transform: 'scale(1)' },
                  '50%': { opacity: 0.5, transform: 'scale(0.72)' },
                },
              }}
            />
            <Typography
              sx={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: primary,
                letterSpacing: 0.3,
              }}
            >
              You are in this room
            </Typography>
          </Box>

          {/* Right: LIVE pill */}
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
        </Box>
      )}

      {/* ── Main row ───────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 1.5,
          py: 1.1,
          gap: 1.25,
          minWidth: 0,
        }}
      >
        {/* Left stripe */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: isJoined ? 'auto' : '15%',
            bottom: isJoined ? 0 : 'auto',
            height: isJoined ? '55%' : '70%',
            width: 3.5,
            borderRadius: '0 3px 3px 0',
            bgcolor: isJoined ? primary : selected ? alpha(primary, 0.6) : alpha(success, 0.45),
            opacity: isJoined ? 1 : selected ? 0.85 : 0.4,
            transition: 'all 0.2s',
          }}
        />

        {/* Host avatar */}
        <Box sx={{ flexShrink: 0, position: 'relative' }}>
          <AvatarUser
            avatarUrl={room.host?.profilePhoto}
            verified={room.host?.verified}
            name={room.host?.name}
            accountType={room.host?.accountType}
            sx={{ width: 40, height: 40 }}
          />
        </Box>

        {/* Text */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Name + lang badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.35 }}>
            <Typography
              noWrap
              sx={{
                fontWeight: 700,
                fontSize: '0.845rem',
                lineHeight: 1.25,
                flex: 1,
                color: isJoined ? primary : theme.palette.text.primary,
              }}
            >
              {room.name}
            </Typography>

            {langLabel && (
              <Tooltip
                title={room.languages?.map((l) => l.toUpperCase()).join(', ')}
                arrow
                placement="top"
              >
                <Box
                  sx={{
                    fontSize: '0.58rem',
                    fontWeight: 800,
                    letterSpacing: 0.4,
                    color: isJoined ? primary : theme.palette.text.disabled,
                    bgcolor: isJoined
                      ? alpha(primary, 0.1)
                      : isDark
                        ? alpha('#fff', 0.07)
                        : alpha('#000', 0.05),
                    border: '1px solid',
                    borderColor: isJoined ? alpha(primary, 0.3) : alpha(theme.palette.divider, 0.8),
                    borderRadius: '6px',
                    px: 0.6,
                    py: 0.15,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    cursor: 'default',
                  }}
                >
                  {langLabel}
                </Box>
              </Tooltip>
            )}
          </Box>

          {/* Participants row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <AvatarGroup
              max={isJoined ? 5 : 4}
              sx={{
                '& .MuiAvatar-root': {
                  width: 16,
                  height: 16,
                  fontSize: 7,
                  border: '1.5px solid',
                  borderColor: 'background.paper',
                },
              }}
            >
              {room?.currentParticipants
                ?.filter((p) => p.user.id !== currentUser?.id)
                .map((p, i) => (
                  <AvatarUser
                    key={`${p.user.id}+${i}`}
                    avatarUrl={p.user.profilePhoto}
                    name={p.user.name}
                    verified={p.user?.verified}
                    shouldSpin={false}
                  />
                ))}
            </AvatarGroup>

            <Typography
              sx={{
                fontSize: '0.7rem',
                fontWeight: 500,
                color: isJoined ? alpha(primary, 0.75) : theme.palette.text.disabled,
              }}
            >
              {isJoined
                ? `${participantCount} online`
                : participantCount > 0
                  ? `${participantCount} online`
                  : 'Empty room'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flexShrink: 0, display: 'flex', gap: 0.4 }}>
          <Tooltip title={room.isActive ? 'ACTIVE' : 'INACTIVE'} placement="top">
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: room.isActive ? success : 'grey.500',
                boxShadow: `0 0 6px ${room.isActive ? success : 'grey.500'}`,
              }}
            />
          </Tooltip>
        </Box>
      </Box>
    </ButtonBase>
  );
};

export default VoiceRoomSelectButton;

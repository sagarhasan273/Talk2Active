import React from 'react';

import { Box, Paper, Badge, Typography } from '@mui/material';

import { useRoomTools, useCredentials } from 'src/core/slices';

import { AvatarUser } from 'src/components/avatar-user';

const WAVE_HEIGHTS = [3, 6, 9, 5, 4, 7, 5, 3, 6];

const VoiceUserProfileView = () => {
  const { user } = useCredentials();

  const { userVoiceState } = useRoomTools();

  const { isMicMuted, hasJoined } = userVoiceState;

  return (
    <Paper
      elevation={0}
      sx={{
        width: 1,
        bgcolor: 'background.paper',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        mb: 1,
        transition: 'all 0.3s ease',
      }}
    >
      {/* ── Header: avatar + name + live badge ─────────────────── */}
      <Box
        onClick={() => {}}
        sx={{
          px: 2,
          pt: 1.5,
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
        }}
      >
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
          sx={{
            '& .MuiBadge-badge': {
              bgcolor: '#43b581',
              boxShadow: '0 0 0 2px #1e1f22, 0 0 6px #43b581',
              width: 11,
              height: 11,
              borderRadius: '50%',
            },
          }}
        >
          <AvatarUser
            avatarUrl={user?.profilePhoto}
            verified={Boolean(user?.verified)}
            name={user?.name}
            accountType={user.accountType}
          />
        </Badge>

        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Typography
            sx={{ fontWeight: 700, fontSize: '0.88rem', color: 'text.primary', lineHeight: 1.2 }}
            noWrap
          >
            {user.name}
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: '#72767d' }} noWrap>
            @{user.username}
          </Typography>
        </Box>

        {/* Live pulse chip */}
        {hasJoined && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              bgcolor: 'rgba(67,181,129,0.12)',
              border: '1px solid rgba(67,181,129,0.25)',
              borderRadius: '20px',
              px: 1,
              py: 0.3,
            }}
          >
            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                bgcolor: '#43b581',
                boxShadow: '0 0 5px #43b581',
                animation: 'livePulse 1.8s ease-in-out infinite',
                '@keyframes livePulse': {
                  '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                  '50%': { opacity: 0.5, transform: 'scale(0.8)' },
                },
              }}
            />
            <Typography
              sx={{ fontSize: '0.6rem', color: '#43b581', fontWeight: 700, letterSpacing: 0.6 }}
            >
              LIVE
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Waveform visualizer ─────────────────────────────────── */}
      {hasJoined && (
        <Box
          sx={{
            px: 2,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {WAVE_HEIGHTS.map((h, i) => (
            <Box
              key={i}
              sx={{
                width: 3,
                height: isMicMuted ? 4 : h * 1.5,
                bgcolor: isMicMuted ? '#ed4245' : '#43b581',
                borderRadius: '2px',
                transition: 'height 0.25s ease, background-color 0.3s ease',
                animation: !isMicMuted
                  ? `waveAnim ${0.6 + i * 0.08}s ease-in-out infinite alternate`
                  : 'none',
                '@keyframes waveAnim': {
                  from: { transform: 'scaleY(0.5)' },
                  to: { transform: 'scaleY(1)' },
                },
              }}
            />
          ))}
          <Typography
            sx={{
              ml: 1,
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: 0.8,
              color: isMicMuted ? '#ed4245' : '#43b581',
            }}
          >
            {isMicMuted ? 'MUTED' : 'VOICE ACTIVE'}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default VoiceUserProfileView;

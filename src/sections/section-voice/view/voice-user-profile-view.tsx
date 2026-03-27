import React, { useMemo } from 'react';

import { Mic, MicOff } from '@mui/icons-material';
import HeadsetIcon from '@mui/icons-material/Headset';
import HeadsetOffIcon from '@mui/icons-material/HeadsetOff';
import { Box, alpha, Tooltip, useTheme, Typography } from '@mui/material';

import { useRoomTools, useCredentials } from 'src/core/slices';
import { useWebRTCContext } from 'src/core/contexts/webRTC-context';

import { AvatarUser } from 'src/components/avatar-user';

import { VoiceParticipantAvatar } from '../voice-participant-avatar';

// 20-bar frequency spectrum — asymmetric peaks for organic feel
const BARS = [4, 6, 10, 14, 18, 22, 16, 12, 20, 26, 24, 20, 14, 18, 10, 16, 8, 12, 6, 4];
const SPEEDS = [
  0.7, 0.5, 0.9, 0.6, 0.8, 0.4, 1.0, 0.6, 0.7, 0.5, 0.8, 0.6, 0.9, 0.5, 0.7, 0.8, 0.6, 0.4, 0.9,
  0.7,
];

const VoiceUserProfileView = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const success = theme.palette.success.main;
  const grey = theme.palette.grey['500'];

  const { user } = useCredentials();
  const webRTC = useWebRTCContext();
  const { userVoiceState, participants } = useRoomTools();

  const { isMicMuted, isDeafened, hasJoined } = userVoiceState;
  const { localStream, remoteStreams } = webRTC;

  const allParticipants = useMemo(() => Object.values(participants), [participants]);

  // Design tokens
  const surface = 'background.paper';
  const line = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
  const sub = isDark ? '#3a3d4a' : '#c4c6d0';
  const muted = isDark ? '#555868' : '#9da0ae';
  const accent = isMicMuted ? '#e84042' : success;
  const accentMic = isMicMuted ? '#e84042' : grey;
  const accentDeafen = isDeafened ? '#e84042' : grey;

  return (
    <Box
      sx={{
        width: 1,
        mb: 1,
        borderRadius: '10px',
        overflow: 'hidden',
        bgcolor: surface,
        border: `1px solid ${line}`,
        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
      }}
    >
      {/* ── STATUS STRIP ──────────────────────────────── */}
      <Box
        sx={{
          height: 28,
          bgcolor: hasJoined ? alpha(accent, isDark ? 0.15 : 0.1) : alpha(sub, 0.15),
          borderBottom: !isMicMuted ? 'none' : `1px solid ${line}`,
          display: 'flex',
          alignItems: 'center',
          px: 1.5,
          gap: 1,
          transition: 'background 0.4s',
        }}
      >
        {/* macOS-style traffic-light dots */}
        {['#e84042', '#3ecf6e'].map((c, i) => (
          <Box
            key={i}
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: c,
              opacity: hasJoined ? 1 : 0.3,
            }}
          />
        ))}

        <Box sx={{ flex: 1 }} />

        {hasJoined ? (
          <>
            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                bgcolor: accent,
                animation: 'blip 1.6s ease-in-out infinite',
                '@keyframes blip': {
                  '0%,100%': { opacity: 1 },
                  '50%': { opacity: 0.25 },
                },
                transition: 'background-color 0.3s',
              }}
            />
            <Typography
              sx={{
                fontFamily: 'inherit',
                fontSize: '0.6rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                color: accent,
                transition: 'color 0.3s',
              }}
            >
              {isMicMuted ? 'MUTED' : 'BROADCASTING'}
            </Typography>
          </>
        ) : (
          <Typography
            sx={{ fontFamily: 'inherit', fontSize: '0.6rem', letterSpacing: '0.1em', color: muted }}
          >
            IDLE
          </Typography>
        )}
      </Box>
      {/* ── FREQUENCY VISUALIZER ──────────────────────── */}
      <Box
        sx={{
          px: 1.5,
          pt: 0.5,
          pb: 0,
          borderBottom: `1px solid ${line}`,
          display: 'flex',
          alignItems: 'flex-end',
          gap: '2px',
          height: !hasJoined || isMicMuted ? 0 : 15,
          opacity: !hasJoined || isMicMuted ? 0 : 1,
          transition: 'all 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          bgcolor: alpha(accent, isDark ? 0.15 : 0.1),
        }}
      >
        {BARS.map((h, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              borderRadius: '1px 1px 0 0',
              height: isMicMuted ? 0 : `${h}px`,
              bgcolor: isMicMuted
                ? 'transparent'
                : i % 3 === 0
                  ? alpha(success, 0.9)
                  : i % 3 === 1
                    ? alpha(success, 0.5)
                    : alpha(success, 0.28),
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transformOrigin: 'bottom',
              animation: !isMicMuted ? `fbar ${SPEEDS[i]}s ease-in-out infinite alternate` : 'none',
              '@keyframes fbar': {
                from: { transform: 'scaleY(0.12)', opacity: 0.5 },
                to: { transform: 'scaleY(1)', opacity: 1 },
              },
            }}
          />
        ))}
      </Box>

      {/* ── USER ROW ──────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1.5,
          py: 1.25,
          borderBottom: `1px solid ${line}`,
        }}
      >
        <Box sx={{ position: 'relative', flexShrink: 0, mr: 1 }}>
          <AvatarUser
            avatarUrl={user?.profilePhoto}
            verified={Boolean(user?.verified)}
            name={user?.name}
            accountType={user.accountType}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 1,
              right: 1,
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#3ecf6e',
              border: `2px solid ${surface}`,
              zIndex: 2,
            }}
          />
        </Box>

        <Box sx={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: 'inherit',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'text.primary',
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
            }}
            noWrap
          >
            {user.name}
          </Typography>
          <Typography sx={{ fontFamily: 'inherit', fontSize: '0.65rem', color: muted }} noWrap>
            @{user.username}
          </Typography>
        </Box>

        {/* Mic icon badge */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 0.35,
            py: 0.35,
            borderRadius: '4px',
            bgcolor: alpha(accentMic, 0.12),
            border: `1px solid ${alpha(accentMic, 0.22)}`,
            transition: 'all 0.3s',
          }}
        >
          {isMicMuted ? (
            <MicOff sx={{ fontSize: 11, color: accentMic }} />
          ) : (
            <Mic sx={{ fontSize: 11, color: accentMic }} />
          )}
        </Box>
        {/* Deafen icon badge */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 0.25,
            py: 0.35,
            borderRadius: '4px',
            bgcolor: alpha(accentDeafen, 0.12),
            border: `1px solid ${alpha(accentDeafen, 0.22)}`,
            transition: 'all 0.3s',
          }}
        >
          {isDeafened ? (
            <HeadsetOffIcon sx={{ fontSize: 11, color: accentDeafen }} />
          ) : (
            <HeadsetIcon sx={{ fontSize: 11, color: accentDeafen }} />
          )}
        </Box>
      </Box>

      {/* ── PARTICIPANTS ──────────────────────────────── */}
      <Box sx={{ px: 1.5, pt: 1, pb: 1.25 }}>
        {/* Section header */}
        {hasJoined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
            <Typography
              sx={{
                fontFamily: 'inherit',
                fontSize: '0.58rem',
                letterSpacing: '0.14em',
                color: sub,
              }}
            >
              PARTICIPANTS
            </Typography>
            <Box sx={{ height: '1px', flex: 1, bgcolor: line }} />
            <Typography
              sx={{
                fontFamily: 'inherit',
                fontSize: '0.58rem',
                letterSpacing: '0.1em',
                color: sub,
              }}
            >
              {String(allParticipants.length).padStart(2, '0')}
            </Typography>
          </Box>
        )}

        {/* Message to join a channel */}
        {!hasJoined && allParticipants.length === 0 && (
          <Box
            sx={{
              mt: 1.5,
              mb: 0.5,
              px: 1.5,
              py: 1.25,
              borderRadius: '6px',
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
              textAlign: 'center',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                borderColor: alpha(theme.palette.primary.main, 0.5),
              },
            }}
          >
            <Typography
              sx={{
                fontFamily: 'inherit',
                fontSize: '0.7rem',
                color: theme.palette.primary.main,
                fontWeight: 500,
                mb: 0.5,
              }}
            >
              ✨ No one&lsquo;s here yet
            </Typography>
            <Typography
              sx={{
                fontFamily: 'inherit',
                fontSize: '0.6rem',
                color: muted,
                letterSpacing: '0.02em',
              }}
            >
              Choose a voice channel to start chatting
            </Typography>
          </Box>
        )}

        {/* Rows */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {allParticipants.map((p, index) => {
            const key = `${p.userId}-${p.socketId}-${index}`;
            const stream = p.isLocal ? localStream : remoteStreams[p.socketId];

            return (
              <Tooltip key={key} title={p.isLocal ? 'You' : p.name} placement="right" arrow>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.85,
                    px: 0.5,
                    py: 0.15,
                    borderRadius: '4px',
                    border: '1px solid transparent',
                    cursor: 'default',
                    transition: 'all 0.15s',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                      border: `1px solid ${line}`,
                    },
                  }}
                >
                  <VoiceParticipantAvatar
                    avatarUrl={p.profilePhoto}
                    name={p.name}
                    verified={p?.verified}
                    accountType={p.accountType || 'member'}
                    stream={stream}
                  />

                  {/* Name */}
                  <Typography
                    sx={{
                      fontFamily: 'inherit',
                      fontSize: '0.67rem',
                      color: p.isLocal ? 'text.primary' : 'text.secondary',
                      fontWeight: p.isLocal ? 600 : 400,
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {p.isLocal ? `${p.name} (you)` : p.name}
                  </Typography>

                  {/* Muted badge for local user */}
                  {p.isMuted && <MicOff sx={{ fontSize: 9, color: '#e84042', flexShrink: 0 }} />}
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default VoiceUserProfileView;

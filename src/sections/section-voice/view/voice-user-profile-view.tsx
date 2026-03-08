import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import HeadsetIcon from '@mui/icons-material/Headset';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HeadsetOffIcon from '@mui/icons-material/HeadsetOff';
import {
  Box,
  Fade,
  Stack,
  Paper,
  Badge,
  Tooltip,
  Collapse,
  Typography,
  IconButton,
} from '@mui/material';

import { useRoomTools, selectAccount } from 'src/core/slices';
import { useWebRTCContext } from 'src/core/contexts/webRTC-context';
import { useSocketContext } from 'src/core/contexts/socket-context';

import { AvatarUser } from 'src/components/avatar-user';

import VoiceUserAudio from 'src/sections/section-voice/voice-user-audio';
import { VoiceAudioControls } from 'src/sections/section-voice/voice-audio-controls';

const WAVE_HEIGHTS = [3, 6, 9, 5, 4, 7, 5, 3, 6];

const VoiceUserProfileView = ({ onLeave }: { onLeave: () => void }) => {
  const user = useSelector(selectAccount);
  const [showAudioControls, setShowAudioControls] = useState(false);

  const { room, userVoiceState, participants, updateUserVoiceState } = useRoomTools();
  const { emit, socket } = useSocketContext();
  const { userVolumes, isMicMuted, isDeafened, hasJoined } = userVoiceState;
  const { localStream, remoteStreams, toggleDeafen, onClickMicrophone } = useWebRTCContext();

  const handleMicMute = () => {
    onClickMicrophone(!isMicMuted);
    updateUserVoiceState({ isMicMuted: !isMicMuted });
    if (room.id) {
      emit('user-audio-toggle', {
        socketId: socket?.id,
        roomId: room.id,
        isMuted: !isMicMuted,
        name: user.name,
      });
    }
  };

  const handleDeafen = () => {
    toggleDeafen();
    updateUserVoiceState({ isDeafened: !isDeafened });
  };

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

      {/* ── Control strip ──────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: 'background.neutral',
          px: 0.5,
          py: 0.75,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Left: mic + deafen */}
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={isMicMuted ? 'Unmute' : 'Mute'}>
            <IconButton
              size="small"
              onClick={handleMicMute}
              sx={{
                color: isMicMuted ? '#ed4245' : '#72767d',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.07)',
                  color: isMicMuted ? '#ed4245' : '#667eea',
                  transform: 'scale(1.12)',
                },
              }}
            >
              {isMicMuted ? (
                <MicOffIcon sx={{ fontSize: '1rem' }} />
              ) : (
                <MicIcon sx={{ fontSize: '1rem' }} />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title={isDeafened ? 'Undeafen' : 'Deafen'}>
            <IconButton
              size="small"
              onClick={handleDeafen}
              sx={{
                color: isDeafened ? '#ed4245' : '#72767d',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.07)',
                  color: isDeafened ? '#ed4245' : '#667eea',
                  transform: 'scale(1.12)',
                },
              }}
            >
              {isDeafened ? (
                <HeadsetOffIcon sx={{ fontSize: '1rem' }} />
              ) : (
                <HeadsetIcon sx={{ fontSize: '1rem' }} />
              )}
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Right: settings + leave */}
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title="Audio settings">
            <IconButton
              size="small"
              onClick={() => setShowAudioControls((p) => !p)}
              sx={{
                color: showAudioControls ? '#667eea' : '#72767d',
                borderRadius: '8px',
                transition: 'transform 0.35s ease, color 0.2s ease',
                transform: showAudioControls ? 'rotate(90deg)' : 'rotate(0deg)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.07)' },
              }}
            >
              <SettingsIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Tooltip>

          {hasJoined && (
            <Tooltip title="Leave voice">
              <IconButton
                size="small"
                onClick={onLeave}
                sx={{
                  color: '#ed4245',
                  bgcolor: 'rgba(237,66,69,0.1)',
                  border: '1px solid rgba(237,66,69,0.2)',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(237,66,69,0.22)',
                    transform: 'scale(1.08)',
                  },
                }}
              >
                <ExitToAppIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>

      {/* ── Collapsible audio controls ─────────────────────────── */}
      <Collapse in={showAudioControls} timeout={380} easing="cubic-bezier(0.4,0,0.2,1)">
        <Box
          sx={{
            px: 2,
            py: 1.5,
            animation: showAudioControls ? 'fadeSlide 0.38s ease' : 'none',
            '@keyframes fadeSlide': {
              from: { opacity: 0, transform: 'translateY(-8px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <VoiceAudioControls />
        </Box>
      </Collapse>

      {/* ── Bottom accent line ─────────────────────────────────── */}
      <Fade in timeout={600}>
        <Box
          sx={{
            height: '6px',
            opacity: 0.55,
            transition: 'background 0.5s ease',
          }}
        />
      </Fade>

      {/* ── Hidden audio elements ──────────────────────────────── */}
      {Object.values(participants).map((participant: any) => (
        <VoiceUserAudio
          key={participant.socketId}
          stream={participant.isLocal ? localStream : remoteStreams[participant.socketId]}
          isLocal={participant.isLocal}
          userName={participant.name || 'unknown'}
          volume={userVolumes[participant.socketId] || 50}
          muted={participant.isMuted || isDeafened}
        />
      ))}
    </Paper>
  );
};

export default VoiceUserProfileView;

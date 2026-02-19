import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import MicIcon from '@mui/icons-material/Mic';
import ChatIcon from '@mui/icons-material/Chat';
import PanToolIcon from '@mui/icons-material/PanTool';
import VideocamIcon from '@mui/icons-material/Videocam';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import {
  Box,
  Paper,
  Stack,
  Slider,
  styled,
  Tooltip,
  Divider,
  Typography,
  IconButton,
} from '@mui/material';

import { useRoomTools, selectAccount } from 'src/core/slices';
import { useWebRTCContext } from 'src/core/contexts/webRTC-context';

import { Scrollbar } from 'src/components/scrollbar';

import VoiceUserAudio from '../voice-user-audio';
import { VoiceUserCard } from '../voice-user-card';

const ControlBar = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  bottom: 10,
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '10px 30px',
  borderRadius: '50px',
  display: 'flex',
  gap: '20px',
  backgroundColor:
    theme.palette.mode === 'dark' ? 'rgba(2, 2, 2, 0.3)' : 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  zIndex: 1000,
}));

export function VoiceRoomBodyView({ onLeaveRoom }: { onLeaveRoom: () => void }) {
  const webRTC = useWebRTCContext();
  const { localStream, remoteStreams } = webRTC;

  const { room, participants, userVoiceState } = useRoomTools();
  const user = useSelector(selectAccount);

  const { isMicMuted } = userVoiceState;

  const participantsArray = useMemo(() => Object.values(participants), [participants]);

  return (
    <Box
      sx={{
        minHeight: 1,
        height: '100%',
        bgcolor: 'background.neutral',
        color: 'primary.main',
        p: 2,
        position: 'relative',
        borderRadius: 2,
        // background: (theme) =>
        //   `radial-gradient(circle at top right, ${theme.palette.background.neutral}, ${theme.palette.background.paper})`, // Subtle radial gradient
      }}
    >
      {/* Top Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            AI Ethics Discussion
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.6 }}>
            Ongoing • 01:24:05
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton color="inherit">
            <ChatIcon />
          </IconButton>
          <IconButton color="inherit">
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        {/* The Speaker Stage (Viewing another user) */}
        {localStream && (
          <VoiceUserCard
            user={{
              id: user.id,
              name: user.name,
              avatar: user.profilePhoto,
              status: 'online',
              isSpeaking: false,
              isMuted: isMicMuted,
              userType: room.host.id === user.id ? 'Host' : 'Guest',
              verified: user.verified,
            }}
          />
        )}
        <Box sx={{ textAlign: 'center', mb: 1, width: '100%' }}>
          {/* User Interaction Strip */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#1e1f22',
              p: '4px 12px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {/* Local Volume for this specific user */}
            <Tooltip title="User Volume">
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mr: 1, width: 80 }}>
                <VolumeUpIcon sx={{ fontSize: 16, color: '#949ba4' }} />
                <Slider
                  size="small"
                  defaultValue={100}
                  sx={{ color: '#5865f2', '& .MuiSlider-thumb': { width: 8, height: 8 } }}
                />
              </Stack>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ bgcolor: '#4e5058', my: 1 }} />

            {/* Quick Social Actions */}
            <Tooltip title="Send Reaction">
              <IconButton size="small" sx={{ color: '#b5bac1', '&:hover': { color: '#ffcc00' } }}>
                <AddReactionIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="View Profile">
              <IconButton size="small" sx={{ color: '#b5bac1', '&:hover': { color: '#fff' } }}>
                <PersonSearchIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Direct Message">
              <IconButton size="small" sx={{ color: '#b5bac1', '&:hover': { color: '#5865f2' } }}>
                <ChatBubbleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Participant Grid */}
        <Scrollbar
          sx={{
            width: '83.333%',
            height: 190,
            borderRadius: 2,
            pt: 1,
            pb: 8,
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
              gap: 2,

              justifyItems: 'center',
            }}
          >
            {participantsArray.map((participant) => (
              <VoiceUserCard
                key={participant.socketId}
                user={{
                  id: participant.id,
                  name: participant.name,
                  avatar: participant.profilePhoto,
                  status: participant.status,
                  isSpeaking: false,
                  isMuted: Boolean(participant.isMuted),
                  userType: participant.userType,
                  verified: participant.verified,
                }}
              />
            ))}
          </Box>
        </Scrollbar>
      </Box>

      {/* Floating Control Bar */}
      <ControlBar>
        <Tooltip title="Mute">
          <IconButton
            sx={{
              bgcolor: 'rgba(2, 2, 2, 0.3)',
              color: 'common.white',
              '&:hover': { bgcolor: 'rgba(2, 2, 2, 0.5)' },
            }}
          >
            <MicIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Camera">
          <IconButton
            sx={{
              bgcolor: 'rgba(2, 2, 2, 0.3)',
              color: 'common.white',
              '&:hover': { bgcolor: 'rgba(2, 2, 2, 0.5)' },
            }}
          >
            <VideocamIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Share Screen">
          <IconButton
            sx={{
              bgcolor: 'rgba(2, 2, 2, 0.3)',
              color: 'common.white',
              '&:hover': { bgcolor: 'rgba(2, 2, 2, 0.5)' },
            }}
          >
            <ScreenShareIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Raise Hand">
          <IconButton
            sx={{
              bgcolor: 'rgba(2, 2, 2, 0.3)',
              color: 'common.white',
              '&:hover': { bgcolor: 'rgba(2, 2, 2, 0.5)' },
            }}
          >
            <PanToolIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Leave Room">
          <IconButton
            onClick={onLeaveRoom}
            sx={{ bgcolor: '#ff4d4d', color: 'white', '&:hover': { bgcolor: '#ff0000' } }}
          >
            <ExitToAppIcon />
          </IconButton>
        </Tooltip>
      </ControlBar>

      <VoiceUserAudio stream={localStream} isLocal userName={user.name || 'unknown'} />
      {participantsArray?.map((participant) => {
        if (participant.isLocal) return null;
        return (
          <VoiceUserAudio
            key={participant.userId}
            stream={remoteStreams[participant.socketId]}
            isLocal={participant.isLocal}
            userName={participant.name || 'unknown'}
          />
        );
      })}
    </Box>
  );
}

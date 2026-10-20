import { useRemoteParticipant } from '@livekit/components-react';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ConnectionQuality } from 'livekit-client';

// Assuming you are passing your 'participant' object as a prop to your tile
export const ParticipantStatusOverlay = ({ participant }: { participant: any }) => {
  // Grab the live LiveKit participant to monitor their real-time network quality
  const livekitParticipant = useRemoteParticipant(participant.id);
  const quality = livekitParticipant?.connectionQuality;

  let statusText = null;
  let statusColor = alpha('#181c26', 0.85);

  // 1. Fully Disconnected / Left the Room (Triggered by your ghost system)
  if (participant.isGhost) {
    statusText = 'Left Room';
    statusColor = alpha('#ef4444', 0.9); // Red
  }
  // 2. Network connection lost, LiveKit is trying to reconnect them
  else if (quality === ConnectionQuality.Lost) {
    statusText = 'Reconnecting...';
    statusColor = alpha('#f59e0b', 0.9); // Orange
  }
  // 3. User is in the room, but their internet is severely lagging
  else if (quality === ConnectionQuality.Poor) {
    statusText = 'Poor Connection';
    statusColor = alpha('#eab308', 0.9); // Yellow
  }

  // If they are healthy and connected, don't show any overlay
  if (!statusText) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: alpha('#000', 0.5), // Dim the avatar slightly
        borderRadius: '50%', // Assuming it covers a circular avatar
        zIndex: 5,
        pointerEvents: 'none',
      }}
    >
      <Box
        sx={{
          bgcolor: statusColor,
          backdropFilter: 'blur(4px)',
          color: '#fff',
          px: 1,
          py: 0.25,
          borderRadius: 1,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.6rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          {statusText}
        </Typography>
      </Box>
    </Box>
  );
};

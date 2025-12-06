import { useSelector } from 'react-redux';

import { Box, Stack, Typography, LinearProgress } from '@mui/material';

import { selectAccount } from 'src/core/slices';

// Assumed actual import
import { VoiceRoomUserAudioCard } from '../chat-user-audio-card';

import type { Participant } from '../type';

export function VoiceRoomChatBody({
  isConnected,
  initialize,
  isMicMuted,
  participants,
  remoteStreams,
  localStream,
}: {
  isConnected: boolean;
  initialize: boolean;
  isMicMuted: boolean;
  participants: Participant[];
  remoteStreams: { [socketId: string]: MediaStream };
  localStream: MediaStream | null;
}) {
  const user = useSelector(selectAccount);

  return (
    <Box flex={1} display="flex" flexDirection="column">
      {!isConnected && !initialize && <LinearProgress color="warning" sx={{ mb: 2 }} />}

      <Stack direction="row" gap={2} flexWrap="wrap">
        {participants.map((participant) => (
          <VoiceRoomUserAudioCard
            key={participant.id}
            user={{
              id: participant.id,
              name: participant.name,
              avatar: participant.profilePhoto,
              status: participant.status,
              isSpeaking: false,
              isMuted: participant.isMuted,
            }}
            stream={remoteStreams[participant.socketId] || null}
            isLocal={false}
          />
        ))}
        {localStream && (
          <VoiceRoomUserAudioCard
            user={{
              id: user.id,
              name: user.name,
              avatar: user.profilePhoto,
              status: user.status,
              isSpeaking: false,
              isMuted: isMicMuted,
            }}
            stream={localStream}
            isLocal
          />
        )}
      </Stack>

      {participants.length === 0 && isConnected && (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="text.secondary">
            Waiting for other participants to join...
          </Typography>
        </Box>
      )}
    </Box>
  );
}

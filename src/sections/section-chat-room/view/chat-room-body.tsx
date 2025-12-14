import { useSelector } from 'react-redux';

import { Box, Stack, Typography, LinearProgress } from '@mui/material';

import { selectAccount } from 'src/core/slices';
import { useRoomTools } from 'src/core/slices/slice-room';

// Assumed actual import
import { ChatUserCard } from '../chat-user-card';

import type { Participant } from '../type';

export function ChatRoomChatBody({
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
  const { room } = useRoomTools();

  return (
    <Box flex={1} display="flex" flexDirection="column">
      {!isConnected && !initialize && <LinearProgress color="warning" sx={{ mb: 2 }} />}

      <Stack direction="row" gap={2} flexWrap="wrap">
        {participants.map((participant) => (
          <ChatUserCard
            key={participant.socketId}
            user={{
              id: participant.id,
              name: participant.name,
              avatar: participant.profilePhoto,
              status: participant.status,
              isSpeaking: false,
              isMuted: participant.isMuted,
              userType: participant.userType,
              verified: participant.verified,
            }}
            stream={remoteStreams[participant.socketId] || null}
            isLocal={false}
          />
        ))}
        {localStream && (
          <ChatUserCard
            user={{
              id: user.id,
              name: user.name,
              avatar: user.profilePhoto,
              status: user.status,
              isSpeaking: false,
              isMuted: isMicMuted,
              userType: room.host.id === user.id ? 'Host' : 'Guest',
              verified: user.verified,
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

import type { Message } from 'src/types/type-room';

import { Box } from '@mui/material';

import { useRoomTools } from 'src/core/slices/slice-room';

import { MessageText } from './message-text';
import { MessageAvatars } from './message-avatars';

export function MessageContainer({ messages }: { messages: Message[] }) {
  const { remoteParticipants } = useRoomTools();

  return (
    <>
      {messages.map((msg) => (
        <Box
          key={msg.id}
          sx={{
            display: 'flex',
            justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start',
            ml: 'auto',
            mb: 1.5,
            '&:hover': {
              '& .message-time': {
                opacity: 1,
              },
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: msg.sender === 'me' ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              maxWidth: msg.type === 'system' ? '100%' : '75%',
              position: 'relative',
            }}
          >
            <MessageAvatars
              message={msg}
              targetUser={{
                name: remoteParticipants[msg.targetSocketId || '']?.name || '',
                profilePhoto: remoteParticipants[msg.targetSocketId || '']?.profilePhoto || '',
              }}
            />

            <MessageText message={msg} />
          </Box>
        </Box>
      ))}
    </>
  );
}

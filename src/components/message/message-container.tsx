import type { Message } from 'src/types/type-room';

import { Box, Divider, useTheme } from '@mui/material';

import { varAlpha } from 'src/theme/styles';
import { useRoomTools } from 'src/core/slices/slice-room';

import { MessageText } from './message-text';
import { MessageAvatars } from './message-avatars';
import { MessageActions } from './message-actions';

export function MessageContainer({ messages }: { messages: Message[] }) {
  const { isUnreadChatRoomMessage } = useRoomTools();

  const theme = useTheme();

  const handleEdit = (id: number, newText: string) => {
    console.log(id, newText);
  };

  const handleReply = (id: number) => {
    console.log('Reply to message:', id);
    // Implement reply logic
  };

  const handleResend = (id: number) => {
    console.log('Resend message:', id);
  };

  const handleDelete = (id: number) => {
    console.log('message', id);
  };

  const handleReact = (emoji: string) => {
    console.log('message', emoji);
  };

  return (
    <>
      {messages.map((msg) => (
        <>
          {msg?.startOfUnread && (
            <Divider
              sx={{
                typography: 'caption',
                color: theme.vars.palette.text.primary,
                background: varAlpha(theme.vars.palette.primary.mainChannel, 0.18),
                '&::before, &::after': {
                  border: 1,
                  borderColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.8),
                },
              }}
            >
              Unread
            </Divider>
          )}
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start',
              pl: 'auto',
              p: 1,
              pb: 1.5,
              backgroundColor: msg.isUnread
                ? varAlpha(theme.vars.palette.primary.mainChannel, 0.18)
                : 'transparent',
              '&:hover': {
                '& .message-time': {
                  opacity: 1,
                },
                '& .message-actions': {
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
                maxWidth: msg.type === 'message' ? '80%' : '95%',
                position: 'relative',
              }}
            >
              {/* Messages Avatar */}
              <MessageAvatars message={msg} />

              {/* Messages Text */}
              <MessageText message={msg} />

              {/* Messages Action */}
              <MessageActions
                message={msg}
                onEdit={handleEdit}
                onReply={handleReply}
                onResend={handleResend}
                onDelete={handleDelete}
                onReaction={handleReact}
              />
            </Box>
          </Box>
        </>
      ))}

      {/*
       *  Make sure there is space for message actions
       */}
      <Box
        sx={{
          display: 'flex',
          pb: 2,
          '&:hover': {
            '& .message-time': {
              opacity: 1,
            },
          },
          backgroundColor: isUnreadChatRoomMessage
            ? varAlpha(theme.vars.palette.primary.mainChannel, 0.18)
            : 'transparent',
        }}
      />
    </>
  );
}

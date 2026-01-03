import { Box, Divider, useTheme } from '@mui/material';

import { varAlpha } from 'src/theme/styles';
import { useRoomTools } from 'src/core/slices/slice-room';

import { MessageText } from './message-text';
import { MessageAvatars } from './message-avatars';
import { MessageActions } from './message-actions';

import type { MessageContainerProps } from './type';

export function MessageContainer({ messages, onReaction, onReply }: MessageContainerProps) {
  const { isUnreadChatRoomMessage } = useRoomTools();

  const theme = useTheme();

  const handleEdit = (id: number, newText: string) => {
    console.log(id, newText);
  };

  const handleResend = (id: number) => {
    console.log('Resend message:', id);
  };

  const handleDelete = (id: number) => {
    console.log('message', id);
  };

  return (
    <>
      {messages.map((msg, index) => (
        <Box key={`${msg.id}${index}`}>
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
            sx={{
              pl: 'auto',
              p: 1,
              pb: msg.reactions?.length ? 3 : 1,
              display: 'flex',
              justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start',
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
                maxWidth: msg.type === 'message' ? '90%' : '95%',
                minWidth: '60%',
                position: 'relative',
              }}
            >
              {/* Messages Avatar */}
              <MessageAvatars message={msg} />

              {/* Messages Text */}
              <MessageText message={msg} onReaction={onReaction} />

              {/* Messages Action */}
              <MessageActions
                message={msg}
                onEdit={handleEdit}
                onReply={onReply}
                onResend={handleResend}
                onDelete={handleDelete}
                onReaction={onReaction}
              />
            </Box>
          </Box>
        </Box>
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

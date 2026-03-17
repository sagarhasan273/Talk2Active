import type { Message } from 'src/types/type-room';

import { useState, useCallback } from 'react';

import { Box, useTheme } from '@mui/material';

import { varAlpha } from 'src/theme/styles';
import { useRoomTools } from 'src/core/slices/slice-room';

import { MessageText } from './message-text';
import { MessageAvatars } from './message-avatars';
import { MessageActions } from './message-actions';

import type { MessageContainerProps } from './type';

export function MessageContainer({
  messages,
  onReaction,
  onReply,
  onEdit,
  onDelete,
  isEditing,
}: MessageContainerProps) {
  const { isUnreadRoomMessage } = useRoomTools();

  const theme = useTheme();

  const [messageIdEdit, setMessageIdEdit] = useState<Message['id']>('');

  const handleResend = (id: number) => {
    console.log('Resend message:', id);
  };

  const handleEdit = useCallback(
    (message: Message) => {
      setMessageIdEdit(message.id);
      onEdit?.(message);
    },
    [onEdit, setMessageIdEdit]
  );

  const handleDelete = useCallback(
    (message: Message) => {
      onDelete?.(message);
    },
    [onDelete]
  );

  return (
    <>
      {messages.map((msg, index) => (
        <Box key={`${msg.id}${index}`}>
          {/* {msg?.startOfUnread && (
            <Divider
              sx={{
                typography: 'caption',
                color: theme.vars.palette.text.primary,
                background: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
                '&::before, &::after': {
                  border: 1,
                  borderColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.8),
                },
              }}
            >
              <Typography variant="caption" color="primary">
                Unread Messages
              </Typography>
            </Divider>
          )} */}
          <Box
            sx={{
              pl: 'auto',
              py: 1,
              pb: msg.reactions?.length ? 3 : 1,
              display: 'flex',
              justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start',
              // backgroundColor: msg.isUnread
              //   ? varAlpha(theme.vars.palette.primary.mainChannel, 0.08)
              //   : 'transparent',
              '&:hover': {
                '& .message-time': {
                  opacity: 1,
                },
                '& .message-actions': {
                  opacity: 1,
                },
              },
              ...(isEditing && {
                opacity: messageIdEdit === msg.id ? 1 : 0.5,
              }),
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
          backgroundColor: isUnreadRoomMessage
            ? varAlpha(theme.vars.palette.primary.mainChannel, 0.18)
            : 'transparent',
        }}
      />
    </>
  );
}

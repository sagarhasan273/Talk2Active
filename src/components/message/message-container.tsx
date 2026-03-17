// message-container.tsx
import type { Message } from 'src/types/type-room';

import { useState, useEffect, useCallback } from 'react';

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

  // Clear editing highlight when editing mode ends
  useEffect(() => {
    if (!isEditing) setMessageIdEdit('');
  }, [isEditing]);

  const handleResend = useCallback((id: number) => {
    console.log('Resend message:', id);
  }, []);

  const handleEdit = useCallback(
    (message: Message) => {
      setMessageIdEdit(message.id);
      onEdit?.(message);
    },
    [onEdit]
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
        <Box
          // Use id as primary key; fall back to index only as tiebreaker
          key={msg.id ?? index}
          sx={{
            py: 1,
            pb: msg.reactions?.length ? 3 : 1,
            display: 'flex',
            justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start',
            transition: 'opacity 0.2s',
            '&:hover': {
              '& .message-time': { opacity: 1 },
              '& .message-actions': { opacity: 1 },
            },
            ...(isEditing && {
              opacity: messageIdEdit === msg.id ? 1 : 0.4,
              pointerEvents: messageIdEdit === msg.id ? 'auto' : 'none',
            }),
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: msg.sender === 'me' ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              // System messages can be wider; regular messages capped tighter
              maxWidth: msg.type === 'system' ? '95%' : '75%',
              position: 'relative',
              gap: 0.5,
            }}
          >
            <MessageAvatars message={msg} />
            <MessageText message={msg} onReaction={onReaction} />
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
      ))}

      {/* Spacer — also doubles as unread highlight strip */}
      <Box
        sx={{
          pb: 2,
          transition: 'background-color 0.3s',
          backgroundColor: isUnreadRoomMessage
            ? varAlpha(theme.vars.palette.primary.mainChannel, 0.18)
            : 'transparent',
        }}
      />
    </>
  );
}

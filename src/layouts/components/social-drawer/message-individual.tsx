import type { Message } from 'src/types/type-room';

import { useSelector } from 'react-redux';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import { Box, Paper, Typography } from '@mui/material';

import { fDate } from 'src/utils/format-time';

import { varAlpha } from 'src/theme/styles';
import { selectAccount, useMessagesTools } from 'src/core/slices';
import { useSocketContext } from 'src/core/contexts/socket-context';

import { Scrollbar } from 'src/components/scrollbar/scrollbar';
import { MessageInput } from 'src/components/message/message-input';
import { MessageContainer } from 'src/components/message/message-container';

export const VoiceRoomMessageIndividual = ({ targetUserId }: { targetUserId?: string }) => {
  const {
    individualMessages,
    reactionIndividualMessage,
    reactionPopIndividualMessage,
    clearUnreadIndividualMessages,
  } = useMessagesTools();
  const user = useSelector(selectAccount);

  const { socket } = useSocketContext();
  console.log(individualMessages);
  const [message, setMessage] = useState<string>('');
  const [messageId, setMessageId] = useState<Message['id']>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isPrivateMessage, setIsPrivateMessage] = useState<boolean>(false);
  const [replyMessage, setReplyMessage] = useState<Message | undefined>(undefined);
  const [editMessage, setEditMessage] = useState<Message | undefined>(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = useCallback(
    (
      isPrivate: boolean,
      targetUserInfo: Message['targetUserInfo'],
      mentions: Message['mentions'] = []
    ): void => {
      if (message.trim() === '') return;

      const newMessage: Message = {
        text: message,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUnread: false,
        isPrivate,
        senderSocketId: socket?.id,
        targetSocketId: targetUserInfo?.socketId,
        type: 'message',
        userInfo: {
          userId: user.id,
          name: user.name,
          avatar: user.profilePhoto,
        },
        targetUserInfo,
        mentions,
        messageRepliedOf: replyMessage,
      };

      if (isEditing) {
        socket?.emit('send-edit-group-message', {
          messageId,
          text: newMessage.text,
          time: newMessage.time,
        });
      } else {
        socket?.emit('send-individual-message', {
          userId: targetUserId,
          ...newMessage,
        });
      }

      setMessage('');
      setMessageId('');
      setIsEditing(false);
      setIsPrivateMessage(false);
      setReplyMessage(undefined);
    },
    [message, targetUserId, messageId, isEditing, replyMessage, socket, user]
  );

  const handleReaction = useCallback(
    (messageObj: Message, emoji: string) => {
      const reactionData = {
        messageId: messageObj.id,
        reaction: {
          userId: user.id,
          name: user.name,
          emoji,
        },
      };

      const hasReact = messageObj?.reactions?.some((reaction) => reaction?.userId === user?.id);

      if (hasReact) {
        reactionPopIndividualMessage(reactionData);
        socket?.emit('send-reaction-pop-group-message', {
          ...reactionData,
        });
      } else {
        reactionIndividualMessage(reactionData);
        socket?.emit('send-reaction-group-message', {
          ...reactionData,
        });
      }
    },
    [user.id, user.name, socket, reactionIndividualMessage, reactionPopIndividualMessage]
  );

  const handleReply = useCallback((messageReply: Message) => {
    setReplyMessage(messageReply);
    setIsPrivateMessage(!!messageReply.isPrivate);
    console.log('private', messageReply);
  }, []);

  const handleEdit = useCallback((messageEdit: Message) => {
    setMessage(messageEdit?.text || '');
    setMessageId(messageEdit?.id);
    setEditMessage(messageEdit);
    setIsPrivateMessage(!!messageEdit.isPrivate);
    setIsEditing(true);
  }, []);

  const handleDelete = useCallback(
    (messageDelete: Message) => {
      socket?.emit('send-delete-group-message', {
        messageId: messageDelete.id,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    },
    [socket]
  );

  const handleCancelReply = useCallback(() => {
    setReplyMessage(undefined);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setMessage('');
    setIsEditing(false);
  }, []);

  useEffect(() => {
    clearUnreadIndividualMessages();

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [individualMessages]);

  return (
    <>
      {/* Chat Header */}
      <Paper
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 0,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          zIndex: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="caption" color="grey.500">
            Messages will be remove after 7 days.
          </Typography>
        </Box>
      </Paper>
      <Scrollbar
        sx={{
          backgroundColor: 'background.neutral',
          backgroundRepeat: 'repeat',
          backgroundSize: 'contain',
        }}
      >
        {/* Messages Display Area */}
        <Box>
          {/* Date Separator */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              my: 2,
            }}
          >
            <Paper
              sx={{
                px: 2,
                py: 0.5,
                backgroundColor: (theme) =>
                  varAlpha(theme.vars.palette.background.paperChannel, 0.28),
                borderRadius: 2,
              }}
            >
              <Typography variant="caption" color="text.primary">
                {fDate(new Date(), 'dddd, MMMM DD, YYYY')}
              </Typography>
            </Paper>
          </Box>

          {/* Messages */}
          <MessageContainer
            messages={individualMessages}
            onReaction={handleReaction}
            onReply={handleReply}
            isEditing={isEditing}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <div ref={messagesEndRef} />
        </Box>
      </Scrollbar>
      {/* Message Input Box */}
      <MessageInput
        onSendMessage={handleSendMessage}
        isEditing={isEditing}
        replyMessage={replyMessage}
        cancelReplyMessage={handleCancelReply}
        cancelEditMessage={handleCancelEdit}
        message={message}
        setMessage={setMessage}
        isPrivateMessage={isPrivateMessage}
        setIsPrivateMessage={setIsPrivateMessage}
      />
    </>
  );
};

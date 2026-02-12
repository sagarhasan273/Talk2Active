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

export const VoiceRoomMessageIndividual = ({
  targetUserInfo,
}: {
  targetUserInfo?: { userId?: string; name?: string; avatar?: string };
}) => {
  const {
    individualMessages,
    selectedForMessage,
    reactionIndividualMessage,
    reactionPopIndividualMessage,
    clearUnreadIndividualMessages,
  } = useMessagesTools();
  const user = useSelector(selectAccount);

  const { socket } = useSocketContext();

  const [message, setMessage] = useState<string>('');
  const [messageId, setMessageId] = useState<Message['id']>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isPrivateMessage, setIsPrivateMessage] = useState<boolean>(false);
  const [replyMessage, setReplyMessage] = useState<Message | undefined>(undefined);
  const [editMessage, setEditMessage] = useState<Message | undefined>(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = useCallback((): void => {
    if (message.trim() === '') return;

    const newMessage = {
      text: message,
      sender: 'me',
      isUnread: false,
      type: 'message',
      senderInfo: {
        id: user.id,
        name: user.name,
        profilePhoto: user.profilePhoto,
      },
      receiverInfo: {
        id: selectedForMessage?.id || '',
        name: selectedForMessage?.name || '',
        profilePhoto: selectedForMessage?.profilePhoto || '',
      },
      isReply: !!replyMessage,
      parentMessage: replyMessage
        ? {
            id: replyMessage?.id,
            text: replyMessage?.text,
          }
        : undefined,
    };

    if (isEditing) {
      socket?.emit('send-edit-individual-message', {
        messageId,
        userId: user.id,
        text: message,
        receiverInfo: editMessage?.receiverInfo,
      });
    } else {
      socket?.emit('send-individual-message', {
        ...newMessage,
      });
    }

    setMessage('');
    setMessageId('');
    setIsEditing(false);
    setIsPrivateMessage(false);
    setReplyMessage(undefined);
  }, [message, editMessage, selectedForMessage, messageId, isEditing, replyMessage, socket, user]);

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

      const hasReact = messageObj?.reactions?.some(
        (reaction) => reaction?.userId === user?.id && reaction?.emoji === emoji
      );

      if (hasReact) {
        reactionPopIndividualMessage({ ...reactionData, userId: selectedForMessage?.userId });
        socket?.emit('send-reaction-pop-individual-message', {
          senderId: user.id,
          receiverId: selectedForMessage?.userId,
          ...reactionData,
        });
      } else {
        reactionIndividualMessage({ ...reactionData, userId: selectedForMessage?.userId });
        socket?.emit('send-reaction-individual-message', {
          senderId: user.id,
          receiverId: selectedForMessage?.userId,
          ...reactionData,
        });
      }
    },
    [
      user.id,
      user.name,
      selectedForMessage,
      socket,
      reactionIndividualMessage,
      reactionPopIndividualMessage,
    ]
  );

  const handleReply = useCallback((messageReply: Message) => {
    setReplyMessage(messageReply);
    setIsPrivateMessage(!!messageReply.isPrivate);
  }, []);

  const handleEdit = useCallback((messageEdit: Message) => {
    setMessage(messageEdit?.text || '');
    setMessageId(messageEdit?.id);
    setEditMessage(messageEdit);
    setIsEditing(true);
  }, []);

  const handleDelete = useCallback(
    (messageDelete: Message) => {
      socket?.emit('send-delete-individual-message', {
        senderId: user.id,
        receiverId: selectedForMessage?.id,
        messageId: messageDelete.id,
      });
    },
    [socket, user.id, selectedForMessage?.id]
  );

  const handleCancelReply = useCallback(() => {
    setReplyMessage(undefined);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setMessage('');
    setIsEditing(false);
  }, []);

  const handleMessageUnread = useCallback(() => {
    if (selectedForMessage?.id) {
      setTimeout(() => {
        clearUnreadIndividualMessages();
      }, 1500);
    }
  }, [selectedForMessage, clearUnreadIndividualMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [individualMessages, targetUserInfo?.userId]);

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
        <Box onClick={() => handleMessageUnread()} sx={{ minHeight: 200, p: 2 }}>
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
            messages={individualMessages[selectedForMessage?.id || ''] || []}
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

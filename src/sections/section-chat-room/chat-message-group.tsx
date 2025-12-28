import type { Message, MessageOnReply } from 'src/types/type-room';

import { useSelector } from 'react-redux';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { Box, Paper, Typography } from '@mui/material';

import { fDate } from 'src/utils/format-time';

import { varAlpha } from 'src/theme/styles';
import { selectAccount } from 'src/core/slices';
import { useRoomTools } from 'src/core/slices/slice-room';
import { useSocketContext } from 'src/core/contexts/socket-context';

import { Scrollbar } from 'src/components/scrollbar';
import { MessageContainer } from 'src/components/message';

import { MessageInput } from '../../components/message/message-input';

export const ChatMessageGroup = ({
  onClose,
}: {
  onClose?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  const {
    room,
    chatRoomMessages,
    remoteParticipants,
    reactionChatRoomMessage,
    clearUnreadChatRoomMessages,
  } = useRoomTools();
  const user = useSelector(selectAccount);

  const { socket } = useSocketContext();

  const [message, setMessage] = useState<string>('');
  const [replyMessage, setReplyMessage] = useState<MessageOnReply | undefined>(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const participantsArray = useMemo(() => Object.values(remoteParticipants), [remoteParticipants]);

  const handleSendMessage = useCallback(
    (
      isPrivateMessage: boolean,
      targetUserInfo: Message['targetUserInfo'],
      mentions: Message['mentions'] = []
    ): void => {
      if (message.trim() === '') return;

      const newMessage: Message = {
        text: message,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUnread: false,
        isPrivate: isPrivateMessage,
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

      if (isPrivateMessage && targetUserInfo) {
        socket?.emit('send-private-message', {
          roomId: room.id,
          ...newMessage,
        });
      } else {
        socket?.emit('send-group-message', {
          roomId: room.id,
          ...newMessage,
        });
      }

      setMessage('');
    },
    [message, replyMessage, room.id, socket, user]
  );

  const handleReaction = (messageId: Message['id'], emoji: string) => {
    const reactionData = {
      messageId,
      reaction: {
        userId: user.id,
        name: user.name,
        emoji,
      },
    };
    reactionChatRoomMessage(reactionData);
    socket?.emit('send-reaction-group-message', {
      roomId: room.id,
      ...reactionData,
    });
  };

  const handleReply = (messageReply?: MessageOnReply) => {
    setReplyMessage(messageReply);
  };

  const handleCancelReply = () => {
    setReplyMessage(undefined);
  };

  useEffect(() => {
    clearUnreadChatRoomMessages();

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoomMessages]);

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
          <Typography variant="caption" color="success.main">
            Online • Last seen 5 minutes ago
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
            messages={chatRoomMessages}
            onReaction={handleReaction}
            onReply={handleReply}
          />

          <div ref={messagesEndRef} />
        </Box>
      </Scrollbar>
      {/* Message Input Box */}
      <MessageInput
        participants={participantsArray}
        onSendMessage={handleSendMessage}
        replyMessage={replyMessage}
        cancelReplyMessage={handleCancelReply}
        message={message}
        setMessage={setMessage}
      />
    </>
  );
};

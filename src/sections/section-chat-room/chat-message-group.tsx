import type { Socket } from 'socket.io-client';
import type { Message } from 'src/types/type-room';

import { useSelector } from 'react-redux';
import React, { useRef, useMemo, useState, useEffect } from 'react';

import { Box, Paper, Typography } from '@mui/material';

import { fDate } from 'src/utils/format-time';

import { varAlpha } from 'src/theme/styles';
import { selectAccount } from 'src/core/slices';
import { useRoomTools } from 'src/core/slices/slice-room';

import { Scrollbar } from 'src/components/scrollbar';
import { MessageContainer } from 'src/components/message';

import { ChatMessageInput } from './chat-message-input';

export const ChatMessageGroup = ({
  onClose,
}: {
  onClose?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  const {
    room,
    chatRoomMessages,
    remoteParticipants,
    addChatRoomMessage,
    clearUnreadChatRoomMessages,
  } = useRoomTools();
  const user = useSelector(selectAccount);

  const [message, setMessage] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const participantsArray = useMemo(() => Object.values(remoteParticipants), [remoteParticipants]);

  const handleSendMessage = (
    isPrivateMessage: boolean,
    targetUser: { socketId: string; name?: string } | null = null,
    mentions: {
      userId: string;
      name: string;
    }[] = []
  ): void => {
    if (message.trim() === '') return;

    const newMessage: Message = {
      text: message,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUnread: false,
      isPrivate: isPrivateMessage,
      senderSocketId: socketRef.current?.id,
      targetSocketId: targetUser?.socketId,
      type: 'message',
      userInfo: {
        name: user.name,
        userId: user.id,
        avatar: user.profilePhoto,
      },
      mentions,
    };

    addChatRoomMessage(newMessage);

    if (isPrivateMessage && targetUser) {
      socketRef.current?.emit('send-private-message', {
        roomId: room.id,
        senderSocketId: socketRef.current?.id,
        targetSocketId: targetUser.socketId,
        ...newMessage,
      });
    } else {
      socketRef.current?.emit('send-group-message', {
        roomId: room.id,
        senderSocketId: socketRef.current?.id,
        ...newMessage,
      });
    }

    setMessage('');
  };

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = (window as any).socket;
    }

    setTimeout(() => {
      clearUnreadChatRoomMessages();
    }, 1000);

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
        <Box
          sx={{
            p: 1.5,
            pb: 3,
          }}
        >
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
          <MessageContainer messages={chatRoomMessages} />

          <div ref={messagesEndRef} />
        </Box>
      </Scrollbar>
      {/* Message Input Box */}
      <ChatMessageInput
        participants={participantsArray}
        onSendMessage={handleSendMessage}
        message={message}
        setMessage={setMessage}
      />
    </>
  );
};

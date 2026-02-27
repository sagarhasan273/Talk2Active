import type { Message, PrivateParticipantProps } from 'src/types/type-room';

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
  privateMessage,
}: {
  onClose?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  privateMessage?: PrivateParticipantProps;
}) => {
  const {
    room,
    chatRoomMessages,
    participants,
    reactionChatRoomMessage,
    reactionPopChatRoomMessage,
    clearUnreadChatRoomMessages,
  } = useRoomTools();
  const user = useSelector(selectAccount);

  const { socket } = useSocketContext();

  const [message, setMessage] = useState<string>('');
  const [messageId, setMessageId] = useState<Message['id']>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isPrivateMessage, setIsPrivateMessage] = useState<boolean>(false);
  const [privateRecipient, setPrivateRecipient] = useState<PrivateParticipantProps | null>(null);
  const [replyMessage, setReplyMessage] = useState<Message | undefined>(undefined);
  const [editMessage, setEditMessage] = useState<Message | undefined>(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const privateMessageRef = useRef<PrivateParticipantProps | undefined>(privateMessage);

  const participantsArray = useMemo(() => Object.values(participants), [participants]);

  const handleSendMessage = useCallback(
    (
      isPrivate: boolean,
      targetUserInfo: (Message['receiverInfo'] & { socketId?: string }) | undefined,
      mentions: Message['mentions'] = []
    ): void => {
      if (message.trim() === '') return;

      const newMessage: Message = {
        text: message,
        sender: 'me',
        time: new Date(),
        isUnread: false,
        isPrivate,
        senderSocketId: socket?.id,
        receiverSocketId: targetUserInfo?.socketId,
        type: 'message',
        senderInfo: {
          id: user.id,
          name: user.name,
          profilePhoto: user.profilePhoto,
        },
        receiverInfo: targetUserInfo,
        mentions,
        messageRepliedOf: replyMessage,
      };

      if (isEditing) {
        if (isPrivate && editMessage?.receiverSocketId) {
          socket?.emit('send-edit-private-message', {
            roomId: room.id,
            messageId,
            text: newMessage.text,
            time: newMessage.time,
          });
        } else {
          socket?.emit('send-edit-group-message', {
            roomId: room.id,
            messageId,
            text: newMessage.text,
            time: newMessage.time,
          });
        }
      } else if (isPrivate && targetUserInfo) {
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
      setMessageId('');
      setIsEditing(false);
      setIsPrivateMessage(false);
      setReplyMessage(undefined);
    },
    [message, messageId, isEditing, replyMessage, editMessage, room.id, socket, user]
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
        reactionPopChatRoomMessage(reactionData);
        socket?.emit('send-reaction-pop-group-message', {
          roomId: room.id,
          ...reactionData,
        });
      } else {
        reactionChatRoomMessage(reactionData);
        socket?.emit('send-reaction-group-message', {
          roomId: room.id,
          ...reactionData,
        });
      }
    },
    [room.id, user.id, user.name, socket, reactionChatRoomMessage, reactionPopChatRoomMessage]
  );

  const handleReply = useCallback((messageReply: Message) => {
    setReplyMessage(messageReply);
    setIsPrivateMessage(!!messageReply.isPrivate);
    if (!!messageReply.isPrivate && messageReply.senderSocketId) {
      setPrivateRecipient({
        socketId: messageReply.senderSocketId,
        userId: messageReply?.senderInfo?.id as string,
        name: messageReply?.senderInfo?.name as string,
        profilePhoto: messageReply?.senderInfo?.profilePhoto,
      });
    }
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
        roomId: room.id,
        messageId: messageDelete.id,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    },
    [socket, room.id]
  );

  const handleCancelReply = useCallback(() => {
    setReplyMessage(undefined);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setMessage('');
    setIsEditing(false);
  }, []);

  const handleCencelPrivateMessage = useCallback(() => {
    privateMessageRef.current = undefined;
  }, []);

  useEffect(() => {
    if (privateMessageRef.current) {
      setPrivateRecipient(privateMessageRef.current);
      setIsPrivateMessage(true);
    }
  }, [privateMessage]);

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
          <Typography variant="caption" color="grey.500">
            Conversations with other participants and system alerts will be shown in this chat.
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
        <Box sx={{ mx: 1 }}>
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
            isEditing={isEditing}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <div ref={messagesEndRef} />
        </Box>
      </Scrollbar>
      {/* Message Input Box */}
      <MessageInput
        participants={participantsArray}
        onSendMessage={handleSendMessage}
        isEditing={isEditing}
        replyMessage={replyMessage}
        cancelReplyMessage={handleCancelReply}
        cancelEditMessage={handleCancelEdit}
        message={message}
        setMessage={setMessage}
        isPrivateMessage={isPrivateMessage}
        setIsPrivateMessage={setIsPrivateMessage}
        privateRecipient={privateRecipient}
        setPrivateRecipient={setPrivateRecipient}
        onCencelPrivateMessage={handleCencelPrivateMessage}
      />
    </>
  );
};

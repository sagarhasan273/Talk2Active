import type { Socket } from 'socket.io-client';

import { useSelector } from 'react-redux';
import React, { useRef, useMemo, useState, useEffect } from 'react';

import { Box, Chip, Paper, Avatar, Typography } from '@mui/material';

import { fDate } from 'src/utils/format-time';
import { getAvatarText } from 'src/utils/helper';

import { varAlpha } from 'src/theme/styles';
import { selectAccount } from 'src/core/slices';
import { useRoomTools } from 'src/core/slices/slice-room';

import { Scrollbar } from 'src/components/scrollbar';

import { ChatMessageInput } from './chat-message-input';

import type { ChatRoomMessage } from './type';

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

    const newMessage: ChatRoomMessage = {
      text: message,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      name: user.name,
      avatar: user.profilePhoto,
      userId: user.id,
      isUnread: false,
      isPrivate: isPrivateMessage,
      senderSocketId: socketRef.current?.id,
      targetSocketId: targetUser?.socketId,
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
          {chatRoomMessages.map((msg) => (
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
                  maxWidth: '75%',
                  position: 'relative',
                }}
              >
                {msg.sender === 'them' && (
                  <Avatar
                    src={msg.avatar}
                    sx={{
                      mr: 0.5,
                      borderRadius: 1,
                      width: 32,
                      height: 32,
                      fontSize: '0.875rem',
                    }}
                  >
                    {getAvatarText(msg.name)}
                  </Avatar>
                )}

                {msg.sender === 'me' && msg.isPrivate && (
                  <Avatar
                    src={remoteParticipants[msg.targetSocketId || '']?.profilePhoto || ''}
                    sx={{
                      ml: 0.5,
                      borderRadius: 1,
                      width: 32,
                      height: 32,
                      fontSize: '0.875rem',
                      border: (theme) =>
                        `1px dashed ${varAlpha(theme.vars.palette.error.mainChannel, 1)}`,
                    }}
                  >
                    {getAvatarText(remoteParticipants[msg.targetSocketId || '']?.name || '')}
                  </Avatar>
                )}

                {/* UNREAD INDICATOR */}
                {msg.isUnread && msg.sender === 'them' && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: -8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      animation: 'pulse 1.5s infinite',
                    }}
                  />
                )}

                {/* PRIVATE MESSAGE INDICATOR */}
                {msg.isPrivate && msg.sender === 'them' && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 4,
                      top: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        borderRadius: 0.5,
                        px: 0.5,
                        py: 0.1,
                        border: msg.isPrivate
                          ? (theme) =>
                              `1px dashed ${varAlpha(theme.vars.palette.error.mainChannel, 1)}`
                          : 'none',
                        color: 'error.main',
                      }}
                    >
                      PM
                    </Typography>
                  </Box>
                )}

                {msg.isPrivate && msg.sender === 'me' && (
                  <Box
                    sx={{
                      position: 'absolute',
                      right: 4,
                      top: -1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        py: 0.1,
                        color: 'error.main',
                      }}
                    >
                      PM to
                    </Typography>
                  </Box>
                )}

                <Paper
                  sx={{
                    maxWidth: '100%',
                    p: 1.25,
                    pb: 0.75,
                    backgroundColor: (theme) =>
                      msg.sender === 'me'
                        ? varAlpha(theme.vars.palette.background.paperChannel, 1)
                        : varAlpha(theme.vars.palette.background.paperChannel, 0.5),
                    borderRadius: msg.sender === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 8px',
                    boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                    position: 'relative',
                    border: msg.isPrivate
                      ? (theme) => `1px dashed ${varAlpha(theme.vars.palette.error.mainChannel, 1)}`
                      : 'none',
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      wordBreak: 'break-word',
                      lineHeight: 1.4,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.text}
                  </Typography>

                  {(() => {
                    if (!msg.mentions.length) return null;

                    const parts: React.ReactNode[] = [];

                    msg.mentions.forEach((m, i) => {
                      parts.push(
                        <Chip
                          key={m.userId + i}
                          label={`@${m.name}`}
                          size="small"
                          variant="outlined"
                          sx={{
                            typography: 'caption',
                            border: 'none',
                            fontWeight: 'bold',
                            color: (theme) =>
                              theme.palette.mode === 'dark'
                                ? theme.vars.palette.info.light
                                : theme.vars.palette.info.main,
                            backgroundColor: (theme) =>
                              varAlpha(theme.vars.palette.info.mainChannel, 0.05),
                          }}
                        />
                      );
                    });

                    return (
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          color: 'transparent',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          mt: 0.5,
                          gap: 0.5,
                        }}
                      >
                        {parts}
                      </Box>
                    );
                  })()}

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      mt: 0.25,
                      mr: 1,
                      gap: 0.5,
                    }}
                  >
                    {msg.sender === 'them' && (
                      <Typography
                        variant="subtitle2"
                        className="message-time"
                        sx={{
                          color: (theme) =>
                            varAlpha(
                              theme.vars.palette.primary[
                                theme.palette.mode === 'dark' ? 'lightChannel' : 'mainChannel'
                              ],
                              msg.isUnread && msg.sender === 'them' ? 1 : 0.8
                            ),
                          fontWeight: msg.isUnread && msg.sender === 'them' ? 'bold' : 'normal',
                          mr: 'auto',
                        }}
                      >
                        {msg.name}
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      className="message-time"
                      sx={{
                        color: 'text.primary',
                        fontSize: '0.5rem',
                        opacity: msg.isUnread && msg.sender === 'them' ? 1 : 0.5,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      {msg.time}
                    </Typography>
                    {msg.sender === 'me' && (
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'info.main',
                            fontSize: '0.6rem',
                          }}
                        >
                          ✓✓
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Box>
            </Box>
          ))}

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

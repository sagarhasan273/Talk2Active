import type { Socket } from 'socket.io-client';
import type { EmojiClickData } from 'emoji-picker-react';

import { SendIcon } from 'lucide-react';
import { useSelector } from 'react-redux';
import EmojiPicker from 'emoji-picker-react';
import React, { useRef, useState, useEffect } from 'react';

import { Mood as MoodIcon } from '@mui/icons-material';
import {
  Box,
  Paper,
  Avatar,
  Popper,
  Button,
  Tooltip,
  TextField,
  IconButton,
  Typography,
  ClickAwayListener,
} from '@mui/material';

import { fDate } from 'src/utils/format-time';
import { getAvatarText } from 'src/utils/helper';

import { varAlpha } from 'src/theme/styles';
import { selectAccount } from 'src/core/slices';
import { useRoomTools } from 'src/core/slices/slice-room';

import { Scrollbar } from 'src/components/scrollbar';

import type { ChatRoomMessage } from './type';

export const ChatMessageGroup = ({
  onClose,
}: {
  onClose?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  const { room, chatRoomMessages, addChatRoomMessage, clearUnreadChatRoomMessages } =
    useRoomTools();
  const user = useSelector(selectAccount);

  const [message, setMessage] = useState<string>('');
  const [emojiPickerOpen, setEmojiPickerOpen] = useState<boolean>(false);

  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const handleSendMessage = (): void => {
    if (message.trim() === '') return;

    const newMessage: ChatRoomMessage = {
      text: message,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      name: user.name,
      avatar: user.profilePhoto,
      userId: user.id,
      isUnread: false,
    };

    addChatRoomMessage(newMessage);
    socketRef.current?.emit('send-group-message', {
      roomId: room.id,
      senderSocketId: socketRef.current?.id,
      ...newMessage,
    });

    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emojiObject: EmojiClickData): void => {
    setMessage((prev) => prev + emojiObject.emoji);
    setEmojiPickerOpen(false);
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

                <Paper
                  sx={{
                    maxWidth: '100%',
                    p: 1.25,
                    pb: 0.75,
                    backgroundColor: (theme) =>
                      msg.sender === 'me'
                        ? varAlpha(theme.vars.palette.background.paperChannel, 1)
                        : varAlpha(theme.vars.palette.background.paperChannel, 0.6),
                    borderRadius: msg.sender === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 8px',
                    boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                    position: 'relative',
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

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      mt: 1,
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
                              theme.vars.palette.primary.mainChannel,
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
                            color: '#009688',
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
      <Paper
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          {/* Emoji Button */}
          <Tooltip title="Emoji">
            <IconButton
              ref={emojiButtonRef}
              onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
              sx={{
                color: 'text.secondary',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
              }}
              size="medium"
            >
              <MoodIcon />
            </IconButton>
          </Tooltip>

          {/* Emoji Picker Popper */}
          <Popper
            open={emojiPickerOpen}
            anchorEl={emojiButtonRef.current}
            placement="top-start"
            sx={{ zIndex: 9999 }}
          >
            <ClickAwayListener onClickAway={() => setEmojiPickerOpen(false)}>
              <Box sx={{ mt: -2 }}>
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  height={400}
                  width={350}
                  searchDisabled={false}
                  previewConfig={{ showPreview: false }}
                />
              </Box>
            </ClickAwayListener>
          </Popper>

          {/* Message Input */}
          <TextField
            placeholder="Write a message..."
            variant="outlined"
            size="small"
            multiline
            maxRows={4}
            value={message}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
            sx={{
              flex: 1,
              width: 'fit-content',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
                borderRadius: 0,
                padding: '8px 8px',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: 'none',
                },
                '&.Mui-focused fieldset': {
                  border: 'none',
                  borderColor: 'primary.main',
                },
              },
              '& .MuiOutlinedInput-input': {
                padding: '8px 0',
              },
            }}
          />
        </Box>

        {/* Send Button */}
        <Button
          variant="contained"
          endIcon={<SendIcon size={18} />}
          onClick={handleSendMessage}
          sx={{
            color: 'white',
            fontWeight: 'bold',
            textTransform: 'none',
            borderRadius: 1,
          }}
        >
          Send
        </Button>
      </Paper>
    </>
  );
};

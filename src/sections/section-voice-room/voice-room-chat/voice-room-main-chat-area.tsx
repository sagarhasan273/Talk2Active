import type { Room, User, Message } from 'src/types/type-room';

import { Send } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import React, { useRef, useState, useEffect } from 'react';

import { SmartToy, PlayArrow, EmojiEmotions } from '@mui/icons-material';
import {
  Box,
  Card,
  Paper,
  Avatar,
  TextField,
  IconButton,
  Typography,
  CardContent,
} from '@mui/material';

import { mockUsers, mockMessages } from 'src/_mock/data/mockData';

interface VoiceRoomMainChatAreaProps {
  room: Room;
}

function VoiceRoomMainChatArea({ room }: VoiceRoomMainChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojiButtonRef = useRef(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = mockUsers[0];

  interface EmojiClickData {
    emoji: string;
    [key: string]: any;
  }

  const handleEmojiClick = (emojiData: EmojiClickData): void => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      userId: currentUser.id,
      content: newMessage,
      timestamp: new Date(),
      type: 'text',
      reactions: [],
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage('');

    // Simulate AI response
    if (room.aiAssistant.isActive && Math.random() > 0.7) {
      setTimeout(
        () => {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            userId: 'ai',
            content: getAIResponse(newMessage),
            timestamp: new Date(),
            type: 'correction',
            reactions: [],
          };
          setMessages((prev) => [...prev, aiMessage]);
        },
        1000 + Math.random() * 2000
      );
    }
  };

  const getAIResponse = (userMessage: string): string => {
    const responses = [
      'Great use of vocabulary! Consider using a more formal tone for this context.',
      'Nice sentence structure! The subjunctive mood would work well here too.',
      "Excellent pronunciation practice! Remember to roll the 'r' sound.",
      'Good cultural insight! In Spain, this expression is commonly used.',
      'Well done! This is a perfect example of natural conversation flow.',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getUserById = (userId: string): User | null => {
    if (userId === 'ai') return null;
    return mockUsers.find((user) => user.id === userId) || null;
  };

  const formatTimestamp = (date: Date) =>
    date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  const renderVoiceMessage = (message: Message) => {
    if (!message.voiceData) return null;

    return (
      <Card variant="outlined" sx={{ mt: 1, maxWidth: 300 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <IconButton size="small" color="primary">
              <PlayArrow />
            </IconButton>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {message.voiceData.waveform.map((height, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 3,
                    height: height * 20 + 4,
                    bgcolor: 'primary.main',
                    borderRadius: 1,
                  }}
                />
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {message.voiceData.duration}s
            </Typography>
          </Box>
          {message.voiceData.transcription && (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {message.voiceData.transcription}
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      {/* Messages - Scrollable area with flex grow */}
      <Box
        sx={{
          flex: '1 1 auto',
          overflowY: 'auto',
          px: 1,
        }}
      >
        {messages.map((message) => {
          const user = getUserById(message.userId);
          const isCurrentUser = message.userId === currentUser.id;
          const isAI = message.userId === 'ai';

          return (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  maxWidth: '70%',
                  flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                }}
              >
                {!isCurrentUser && (
                  <Avatar
                    src={isAI ? undefined : user?.avatar}
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: isAI ? 'primary.main' : undefined,
                    }}
                  >
                    {isAI && <SmartToy />}
                  </Avatar>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {!isCurrentUser && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {isAI ? 'AI Assistant' : user?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(message.timestamp)}
                      </Typography>
                    </Box>
                  )}

                  <Paper
                    sx={{
                      p: 1.5,
                      bgcolor: isCurrentUser
                        ? 'primary.main'
                        : isAI
                          ? 'secondary.light'
                          : 'background.neutral',
                      color: isCurrentUser ? 'primary.contrastText' : 'text.primary',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="subtitle1">{message.content}</Typography>

                    {message.type === 'voice' && renderVoiceMessage(message)}

                    {message.correction && (
                      <Box sx={{ mt: 1, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                        <Typography variant="caption" color="warning.dark" sx={{ fontWeight: 600 }}>
                          Suggestion:
                        </Typography>
                        <Typography variant="caption" color="warning.dark" display="block">
                          {message.correction.explanation}
                        </Typography>
                      </Box>
                    )}
                  </Paper>

                  {isCurrentUser && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ textAlign: 'right' }}
                    >
                      {formatTimestamp(message.timestamp)}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input - Fixed height with min-height */}
      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          flex: '0 0 auto',
          display: 'flex',
          gap: 1,
          p: 2,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          minHeight: 'fit-content',
          alignItems: 'center',
        }}
      >
        {/* <IconButton size="small">
          <AttachFile />
        </IconButton> */}
        {/* Emoji picker button and dropdown */}
        <Box sx={{ position: 'relative' }}>
          <IconButton
            size="small"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            ref={emojiButtonRef}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            <EmojiEmotions />
          </IconButton>

          {showEmojiPicker && (
            <Box
              sx={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                zIndex: 10,
                mb: 1,
              }}
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={300}
                height={350}
                previewConfig={{ showPreview: false }}
              />
            </Box>
          )}
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          size="small"
          sx={{
            borderRadius: 3,
            '& .MuiOutlinedInput-root': {
              padding: '8.5px 14px',
            },
          }}
          multiline
          maxRows={4}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
        />

        <IconButton type="submit" size="small" disabled={!newMessage.trim()} color="primary">
          <Send />
        </IconButton>
      </Box>
    </Box>
  );
}

export default VoiceRoomMainChatArea;

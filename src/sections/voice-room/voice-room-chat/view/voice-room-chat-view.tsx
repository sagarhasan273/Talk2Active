import type { Room, User, Message } from 'src/types/room';

import React, { useRef, useState, useEffect } from 'react';

import {
  Box,
  Chip,
  Card,
  Paper,
  Avatar,
  Tooltip,
  TextField,
  Typography,
  IconButton,
  CardContent,
} from '@mui/material';
import {
  Mic,
  Send,
  People,
  Videocam,
  Settings,
  SmartToy,
  ArrowBack,
  PlayArrow,
  GraphicEq,
  AttachFile,
  EmojiEmotions,
} from '@mui/icons-material';

import { getLanguageFlag } from 'src/_mock/data/languages';
import { mockUsers, mockMessages } from 'src/_mock/data/mockData';

import { VoiceRoomControls } from '../../voice-room-controls';
import { VoiceRoomParticipants } from '../../voice-room-participants';

interface ChatRoomProps {
  room: Room;
  onLeaveRoom: () => void;
}

export const VoiceRoomChat: React.FC<ChatRoomProps> = ({ room, onLeaveRoom }) => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = mockUsers[0];

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

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // Simulate voice recording
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        const voiceMessage: Message = {
          id: Date.now().toString(),
          userId: currentUser.id,
          content: 'Voice message',
          timestamp: new Date(),
          type: 'voice',
          reactions: [],
          voiceData: {
            duration: 3.5,
            waveform: [0.2, 0.4, 0.8, 0.6, 0.3, 0.7, 0.9, 0.4, 0.2],
            transcription: 'This is a voice message in the target language',
            language: room.language,
          },
        };
        setMessages((prev) => [...prev, voiceMessage]);
      }, 2000);
    }
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={onLeaveRoom}>
              <ArrowBack />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4">{getLanguageFlag(room.language)}</Typography>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {room.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {room.participants.length} participants
                  </Typography>
                  <Chip label={room.skillLevel} size="small" variant="outlined" />
                  {room.aiAssistant.isActive && (
                    <Chip
                      icon={<SmartToy />}
                      label="AI Assistant"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton>
              <Videocam />
            </IconButton>
            <IconButton>
              <Mic />
            </IconButton>
            <IconButton onClick={() => setShowParticipants(!showParticipants)}>
              <People />
            </IconButton>
            <IconButton>
              <Settings />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Main Chat Area */}
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          {/* Voice Controls */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
            <VoiceRoomControls
              currentUser={currentUser}
              isHost={room.hostId === currentUser.id}
              voiceSettings={room.voiceSettings}
              onMuteToggle={() => {}}
              onDeafenToggle={() => {}}
              onVolumeChange={() => {}}
              onSettingsChange={() => {}}
            />
          </Paper>

          {/* Messages */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
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
                        elevation={1}
                        sx={{
                          p: 1.5,
                          bgcolor: isCurrentUser
                            ? 'primary.main'
                            : isAI
                              ? 'secondary.light'
                              : 'background.paper',
                          color: isCurrentUser ? 'primary.contrastText' : 'text.primary',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2">{message.content}</Typography>

                        {message.type === 'voice' && renderVoiceMessage(message)}

                        {message.correction && (
                          <Box sx={{ mt: 1, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                            <Typography
                              variant="caption"
                              color="warning.dark"
                              sx={{ fontWeight: 600 }}
                            >
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

          {/* Message Input */}
          <Paper elevation={1} sx={{ p: 2 }}>
            <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1 }}>
              <IconButton>
                <AttachFile />
              </IconButton>
              <IconButton>
                <EmojiEmotions />
              </IconButton>

              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                size="small"
                sx={{ borderRadius: 3 }}
              />

              <Tooltip title={isRecording ? 'Stop Recording' : 'Record Voice Message'}>
                <IconButton
                  onClick={handleVoiceRecord}
                  color={isRecording ? 'error' : 'default'}
                  sx={{
                    bgcolor: isRecording ? 'error.light' : 'action.hover',
                    animation: isRecording ? 'pulse 1s infinite' : 'none',
                  }}
                >
                  {isRecording ? <GraphicEq /> : <Mic />}
                </IconButton>
              </Tooltip>

              <IconButton
                type="submit"
                disabled={!newMessage.trim()}
                color="primary"
                sx={{ bgcolor: 'primary.light' }}
              >
                <Send />
              </IconButton>
            </Box>
          </Paper>
        </Box>

        {/* Voice Participants Panel */}
        {showParticipants && (
          <Paper
            elevation={1}
            sx={{
              width: 400,
              borderLeft: 1,
              borderColor: 'divider',
              overflow: 'auto',
            }}
          >
            <VoiceRoomParticipants
              participants={room.participants}
              currentUserId={currentUser.id}
              hostId={room.hostId}
              onMuteUser={(userId) => console.log('Mute user:', userId)}
              onKickUser={(userId) => console.log('Kick user:', userId)}
              onPromoteUser={(userId) => console.log('Promote user:', userId)}
            />
          </Paper>
        )}
      </Box>
    </Box>
  );
};

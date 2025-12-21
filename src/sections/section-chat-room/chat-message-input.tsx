import type { KeyboardEvent } from 'react';
import type { EmojiClickData } from 'emoji-picker-react';
import type { Message, Participant } from 'src/types/type-room';

import { useSelector } from 'react-redux';
import EmojiPicker from 'emoji-picker-react';
import React, { useRef, useState } from 'react';

import { Mood as MoodIcon, Send as SendIcon, Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  List,
  Chip,
  Paper,
  Avatar,
  Popper,
  Button,
  Tooltip,
  ListItem,
  useTheme,
  TextField,
  Typography,
  IconButton,
  ListItemText,
  ListItemAvatar,
  ClickAwayListener,
} from '@mui/material';

import { useRoomTools, selectAccount } from 'src/core/slices';

import { STATUS_OPTIONS } from './chat-status-button';

interface ChatMessageInputProps {
  participants: Participant[];
  onSendMessage: (
    isPrivateMessage: boolean,
    targetUserInfo?: Message['targetUserInfo'],
    mentions?: Message['mentions']
  ) => void;
  placeholder?: string;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}

export const ChatMessageInput: React.FC<ChatMessageInputProps> = ({
  participants,
  onSendMessage,
  placeholder = 'Write a message...',
  message,
  setMessage,
}) => {
  const theme = useTheme();

  const user = useSelector(selectAccount);
  const { clearUnreadChatRoomMessages } = useRoomTools();

  const [showMentions, setShowMentions] = useState(false);
  const [mentions, setMentions] = useState<Message['mentions']>([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [isPrivateMessage, setIsPrivateMessage] = useState(false);
  const [privateRecipient, setPrivateRecipient] = useState<Participant | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState<boolean>(false);

  const textFieldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mentionListRef = useRef<HTMLDivElement>(null);

  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  // Filter participants based on mention query
  const filteredParticipants = participants.filter(
    (participant) =>
      participant.userId !== user.id &&
      !mentions.map((m) => m.userId).includes(participant.userId) &&
      participant.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setMessage(value);

    // Check for @ mention
    const lastAtSymbol = value.lastIndexOf('@');
    if (lastAtSymbol !== -1) {
      const textAfterAt = value.substring(lastAtSymbol + 1);
      const spaceIndex = textAfterAt.indexOf(' ');

      if (spaceIndex === -1 || spaceIndex > 0) {
        setMentionQuery(textAfterAt.split(' ')[0]);

        setShowMentions(true);
        setSelectedMentionIndex(0);
        return;
      }
    }

    setShowMentions(false);
  };

  // Handle key down for mention navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Existing logic
    if (showMentions && filteredParticipants.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex((p) => (p < filteredParticipants.length - 1 ? p + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex((p) => (p > 0 ? p - 1 : filteredParticipants.length - 1));
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        mentionParticipant(filteredParticipants[selectedMentionIndex]);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Mention a participant
  const mentionParticipant = (participant: Participant) => {
    setMentions((prev) => [
      ...prev,
      {
        userId: participant.userId,
        name: participant.name,
      },
    ]);

    setShowMentions(false);
  };

  // Cancel mention suggestions
  const cancelMentionSuggestions = (participantId: string) => {
    setShowMentions(false);
    setMentionQuery('');
    setSelectedMentionIndex(0);
    setMentions((prev) => prev.filter((m) => m.userId !== participantId));
  };

  // Start a private message
  const startPrivateMessage = (participant: Participant) => {
    setIsPrivateMessage(true);
    setPrivateRecipient(participant);
    setMessage('');
    setShowMentions(false);
    inputRef.current?.focus();
  };

  // Cancel private message
  const cancelPrivateMessage = () => {
    setIsPrivateMessage(false);
    setPrivateRecipient(null);
    setMessage('');
  };

  // Send message
  const handleSendMessage = () => {
    if (message.trim()) {
      if (isPrivateMessage && privateRecipient) {
        onSendMessage(true, {
          socketId: privateRecipient.socketId,
          userId: privateRecipient.userId,
          name: privateRecipient.name,
          avatar: privateRecipient?.profilePhoto,
        });
      } else {
        onSendMessage(false, undefined, mentions);
      }
      setMessage('');
      if (isPrivateMessage) {
        cancelPrivateMessage();
      }
    }
  };

  const handleEmojiClick = (emojiObject: EmojiClickData): void => {
    setMessage((prev) => prev + emojiObject.emoji);
    setEmojiPickerOpen(false);
  };

  // Render mention chips
  const renderMentionChips = () => {
    if (!isPrivateMessage) return null;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', my: 1, px: 0.5, gap: 1 }}>
        <Chip
          label={`Private to: ${privateRecipient?.name}`}
          color="primary"
          size="small"
          onDelete={cancelPrivateMessage}
          deleteIcon={<CloseIcon />}
          sx={{ typography: 'caption' }}
        />
        <Typography variant="caption" color="text.secondary">
          Only you and {privateRecipient?.name} can see this message
        </Typography>
      </Box>
    );
  };

  const renderHighlightedText = () => {
    if (!mentions.length) return null;

    const parts: React.ReactNode[] = [];

    mentions.forEach((m, i) => {
      parts.push(
        <Chip
          key={m.userId + i}
          label={`Mention to: ${m.name}`}
          color="primary"
          size="small"
          onDelete={(e) => {
            e.stopPropagation();
            cancelMentionSuggestions(m.userId);
          }}
          deleteIcon={<CloseIcon />}
          sx={{
            typography: 'caption',
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
          px: 1,
          py: 1,
          gap: 0.5,
        }}
      >
        {parts}
        <Typography variant="caption" color="text.secondary">
          Mentioned users will be notified
        </Typography>
      </Box>
    );
  };

  // Safely resolve palette tokens like 'success.mainChannel' to a concrete value
  const palette = theme.vars.palette as unknown as Record<string, any>;

  // Status configurations
  const statusConfig = {
    online: STATUS_OPTIONS[0],
    offline: STATUS_OPTIONS[5],
    busy: STATUS_OPTIONS[1],
    brb: STATUS_OPTIONS[2],
    afk: STATUS_OPTIONS[3],
    zzz: STATUS_OPTIONS[4],
  };

  const bgColorValue = (bgColorToken: string) => {
    if (!bgColorToken || typeof bgColorToken !== 'string') return undefined;
    const parts = bgColorToken.split('.');
    if (parts.length === 2) {
      const [group, shade] = parts;
      return palette[group]?.[shade];
    }
    // fallback to direct key access if token is a single segment
    return palette[bgColorToken];
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {renderMentionChips()}

      {renderHighlightedText()}

      <Paper
        sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'background.paper',
          borderRadius: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
          minHeight: 90,
        }}
      >
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
            <Box sx={{ mt: 0 }}>
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
        <Box sx={{ flex: 1, position: 'relative' }} ref={textFieldRef}>
          <TextField
            inputRef={inputRef}
            placeholder={
              isPrivateMessage ? `Private message to ${privateRecipient?.name}...` : placeholder
            }
            variant="outlined"
            size="small"
            multiline
            maxRows={4}
            value={message}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              clearUnreadChatRoomMessages();
            }}
            fullWidth
            sx={{
              flex: 1,
              width: 1,
              typography: 'caption',
              borderRadius: 0,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
                borderRadius: 0,
                padding: '4px 0px',
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

          {/* Mention Suggestions Popover */}
          {showMentions && filteredParticipants.length > 0 && (
            <Paper
              sx={{
                position: 'absolute',
                bottom: '100%',
                left: -20,
                mb: 1,
                width: 300,
                maxHeight: 300,
                overflow: 'auto',
                boxShadow: 3,
              }}
              ref={mentionListRef}
            >
              <List dense>
                <ListItem>
                  <Typography variant="subtitle2" color="text.secondary">
                    {isPrivateMessage ? 'Private Message' : 'Participants'}
                  </Typography>
                </ListItem>
                {filteredParticipants.map((participant, index) => (
                  <ListItem
                    key={participant.userId}
                    button
                    selected={index === selectedMentionIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isPrivateMessage) {
                        startPrivateMessage(participant);
                        return;
                      }
                      mentionParticipant(participant);
                    }}
                    onMouseEnter={() => setSelectedMentionIndex(index)}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'action.selected',
                      },
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={participant.profilePhoto} sx={{ width: 32, height: 32 }}>
                        {participant.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={participant.name}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: bgColorValue(
                                statusConfig[participant.status]?.color || 'primary.main'
                              ),
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {participant.status}
                          </Typography>
                        </Box>
                      }
                    />

                    <Button
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        startPrivateMessage(participant);
                      }}
                      startIcon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            fillRule="evenodd"
                            d="M2 6a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7.333L4 21.5c-.824.618-2 .03-2-1z"
                            className="duoicon-secondary-layer"
                            opacity="0.3"
                          />
                          <path
                            fill="currentColor"
                            fillRule="evenodd"
                            d="M8 12a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2zM7 9a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1"
                            className="duoicon-primary-layer"
                          />
                        </svg>
                      }
                      size="small"
                      sx={{ textTransform: 'none' }}
                      disabled={isPrivateMessage || mentions.length > 0}
                    >
                      PM
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>

        {/* Send Button */}
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!message.trim()}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '&.Mui-disabled': {
              backgroundColor: 'action.disabledBackground',
              color: 'action.disabled',
            },
            my: 0.5,
            width: 32,
            height: 32,
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Paper>
      {/* Quick Mention Hint */}
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          top: -8,
          right: 0,
          px: 0.5,
          backgroundColor: 'background.neutral',
          borderRadius: 0.5,
          display: isPrivateMessage ? 'none' : 'block',
        }}
      >
        Type @ to find users • Click to send a private message
      </Typography>
    </Box>
  );
};

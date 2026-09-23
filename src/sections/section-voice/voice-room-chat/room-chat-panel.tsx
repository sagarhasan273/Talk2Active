import { Globe, Image as ImageIcon, Lock, Send, Sparkles, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  alpha,
  Box,
  Button,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

import axios from 'axios';
import { filterVisibleMessages } from '../@mock_/messages-data';
import { RoomChatMessage } from './room-chat-message';

import { ChatMessage, RoomParticipantType } from '@/types/type-room';
import { uploadImage } from '@/utils/helper';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type RoomChatPanelProps = {
  messages: ChatMessage[];
  currentUserId: string;
  topicContext?: string;
  participants?: RoomParticipantType[];
  onSendMessage?: (
    text: string,
    replyToId?: string,
    privateTo?: { id: string; name: string },
    imageUrl?: string
  ) => void;
  onEditMessage?: (id: string, text: string) => void;
  onReactMessage?: (id: string, emoji: string) => void;
  onClose?: () => void;
  title?: string;
};

export const RoomChatPanel = ({
  messages,
  currentUserId,
  topicContext = '',
  participants = [],
  onSendMessage,
  onEditMessage,
  onReactMessage,
  onClose,
  title = 'Chat',
}: RoomChatPanelProps) => {
  const theme = useTheme();
  const [draft, setDraft] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [whisperTarget, setWhisperTarget] = useState<{ id: string; name: string } | null>(null);
  const [whisperAnchorEl, setWhisperAnchorEl] = useState<HTMLElement | null>(null);

  // Upload & Image Preview State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // AI State
  const [isAskingAi, setIsAskingAi] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const visibleMessages = useMemo(
    () => filterVisibleMessages(messages, currentUserId),
    [messages, currentUserId]
  );

  const byId = useMemo(
    () => Object.fromEntries(visibleMessages.map((m) => [m.id, m])),
    [visibleMessages]
  );

  const whisperableUsers = useMemo(() => {
    return participants.filter((p) => {
      const id = p.userId;
      return id && id !== currentUserId;
    });
  }, [participants, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages.length]);

  const handleInitiateReply = (message: ChatMessage) => {
    setReplyingTo(message);
    if (message.privateTo) {
      if (message.authorId === currentUserId) {
        setWhisperTarget({ id: message.privateTo.id, name: message.privateTo.name });
      } else {
        setWhisperTarget({ id: message.authorId, name: message.authorName });
      }
    }
  };

  const handleCancelReply = () => {
    if (replyingTo?.privateTo) {
      setWhisperTarget(null);
    }
    setReplyingTo(null);
  };

  const handleRemoveUploadedImage = () => {
    setUploadedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const send = () => {
    const text = draft.trim();
    // Allow sending if there is text OR an uploaded image ready
    if ((!text && !uploadedImageUrl) || isUploading || isAskingAi) return;

    onSendMessage?.(
      text,
      replyingTo?.id,
      whisperTarget || undefined,
      uploadedImageUrl || undefined
    );

    setDraft('');
    setReplyingTo(null);
    setWhisperTarget(null);
    setUploadedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(20);
    setUploadFileName(file.name);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
    }, 250);

    try {
      const result = await uploadImage(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result?.imageUrl) {
        // Stage image for preview rather than sending immediately
        setUploadedImageUrl(result.imageUrl);
      }
    } catch (err) {
      clearInterval(progressInterval);
      console.error('Failed to upload image:', err);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadFileName('');
      }, 400);
    }
  };

  const handleAskAi = async () => {
    const query = draft.trim();
    if (!query || isAskingAi) return;

    setIsAskingAi(true);
    try {
      onSendMessage?.(`❓ ${query}`, replyingTo?.id, whisperTarget || undefined);

      const res = await axios.post(`${API_URL}/inventory/ai/ask`, {
        prompt: query,
        context: topicContext,
      });

      if (res.data?.answer) {
        onSendMessage?.(`🤖 AI Assistant: ${res.data.answer}`);
      }
      setDraft('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Ask AI error:', err);
      onSendMessage?.(
        '⚠️ Failed to get AI response. Please verify backend Gemini key configuration.'
      );
    } finally {
      setIsAskingAi(false);
    }
  };

  const canSend =
    (draft.trim().length > 0 || Boolean(uploadedImageUrl)) && !isUploading && !isAskingAi;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'text.primary' }}>
          {title}
        </Typography>
        {onClose && (
          <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
            <X size={16} />
          </IconButton>
        )}
      </Box>

      {/* Messages Feed */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: 2,
          py: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.25,
        }}
      >
        {visibleMessages.length === 0 ? (
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', textAlign: 'center', mt: 2 }}
          >
            No messages yet — say hello!
          </Typography>
        ) : (
          visibleMessages.map((m) => (
            <RoomChatMessage
              key={m.id}
              message={{ ...m, privateTo: m.privateTo ?? undefined }}
              replyTo={
                m.replyToId && byId[m.replyToId]
                  ? { ...byId[m.replyToId], privateTo: byId[m.replyToId].privateTo ?? undefined }
                  : undefined
              }
              onReply={(message) => handleInitiateReply(message as ChatMessage)}
              onEdit={onEditMessage}
              onReact={onReactMessage}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Reply Banner */}
      {replyingTo && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            px: 2,
            py: 0.75,
            borderTop: `1px solid ${replyingTo.privateTo ? theme.palette.warning.main : theme.palette.primary.main}`,
            bgcolor: alpha(
              replyingTo.privateTo ? theme.palette.warning.main : theme.palette.primary.main,
              0.08
            ),
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {replyingTo.privateTo && <Lock size={11} color={theme.palette.warning.dark} />}
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: replyingTo.privateTo ? 'warning.dark' : 'primary.main',
                }}
              >
                Replying {replyingTo.privateTo ? 'privately ' : ''}to {replyingTo.authorName}
              </Typography>
            </Box>
            <Typography noWrap sx={{ fontSize: 12, color: 'text.secondary', maxWidth: 260 }}>
              {replyingTo.text}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleCancelReply} sx={{ color: 'text.secondary' }}>
            <X size={14} />
          </IconButton>
        </Box>
      )}

      {/* Whisper Active Banner */}
      {whisperTarget && !replyingTo?.privateTo && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            px: 2,
            py: 0.5,
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            borderTop: `1px dashed ${alpha(theme.palette.warning.main, 0.4)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Lock size={12} color={theme.palette.warning.dark} />
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'warning.dark' }} noWrap>
              Whispering to @{whisperTarget.name}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => setWhisperTarget(null)}
            sx={{ color: 'warning.dark', p: 0.5 }}
          >
            <X size={13} />
          </IconButton>
        </Box>
      )}

      {/* Live Upload Progress Indicator */}
      {isUploading && (
        <Box
          sx={{
            px: 2,
            py: 0.85,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }} noWrap>
              Uploading {uploadFileName}...
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }}>
              {uploadProgress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={uploadProgress}
            sx={{ height: 4, borderRadius: 2 }}
          />
        </Box>
      )}

      {/* Uploaded Image Preview Banner (Before Sending) */}
      {uploadedImageUrl && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.background.paper, 0.9),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Box
              component="img"
              src={uploadedImageUrl}
              alt="Attachment preview"
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.25,
                objectFit: 'cover',
                border: `1px solid ${theme.palette.divider}`,
                flexShrink: 0,
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" fontWeight={700} sx={{ display: 'block' }} noWrap>
                Image ready to send
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                Type a caption or send directly
              </Typography>
            </Box>
          </Box>

          <Tooltip title="Remove Image">
            <IconButton
              size="small"
              onClick={handleRemoveUploadedImage}
              sx={{ color: 'text.secondary' }}
            >
              <X size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Action Toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 0.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.background.default, 0.6),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {/* Private / Whisper Target Button */}
          <Button
            size="small"
            onClick={(e) => setWhisperAnchorEl(e.currentTarget)}
            startIcon={whisperTarget ? <Lock size={13} /> : <Globe size={13} />}
            sx={{
              textTransform: 'none',
              fontSize: 11,
              fontWeight: 700,
              py: 0.3,
              px: 1,
              borderRadius: 1.5,
              color: whisperTarget ? 'warning.dark' : 'text.secondary',
              bgcolor: whisperTarget ? alpha(theme.palette.warning.main, 0.12) : 'transparent',
              border: `1px solid ${whisperTarget ? alpha(theme.palette.warning.main, 0.4) : alpha(theme.palette.divider, 0.4)}`,
              '&:hover': {
                bgcolor: whisperTarget
                  ? alpha(theme.palette.warning.main, 0.2)
                  : alpha(theme.palette.text.primary, 0.05),
              },
            }}
          >
            {whisperTarget ? `@${whisperTarget.name}` : 'Everyone'}
          </Button>

          <Menu
            anchorEl={whisperAnchorEl}
            open={Boolean(whisperAnchorEl)}
            onClose={() => setWhisperAnchorEl(null)}
          >
            <Typography
              variant="caption"
              sx={{ px: 2, py: 0.5, fontWeight: 800, color: 'text.secondary', display: 'block' }}
            >
              Send Message To:
            </Typography>

            <MenuItem
              onClick={() => {
                setWhisperTarget(null);
                setWhisperAnchorEl(null);
              }}
              sx={{ fontSize: 12, fontWeight: 600, gap: 1 }}
            >
              <Globe size={14} /> Everyone (Public)
            </MenuItem>

            {whisperableUsers.map((p) => {
              const id = p.userId || '';
              const name = p.name || p.username || 'User';
              return (
                <MenuItem
                  key={id}
                  onClick={() => {
                    setWhisperTarget({ id, name });
                    setWhisperAnchorEl(null);
                  }}
                  sx={{ fontSize: 12, gap: 1 }}
                >
                  <Lock size={13} /> Whisper to {name}
                </MenuItem>
              );
            })}
          </Menu>

          {/* Upload Image Button */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            hidden
            onChange={handleImageFileChange}
          />
          <Tooltip title="Attach image">
            <span>
              <IconButton
                size="small"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  p: 0.6,
                  color: uploadedImageUrl ? 'primary.main' : 'text.secondary',
                  border: `1px solid ${uploadedImageUrl ? theme.palette.primary.main : alpha(theme.palette.divider, 0.4)}`,
                  borderRadius: 1.5,
                }}
              >
                <ImageIcon size={15} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* Ask AI Button */}
        <Tooltip
          title={draft.trim() ? 'Ask AI this question' : 'Type a question first, then ask AI'}
        >
          <span>
            <Button
              size="small"
              variant="outlined"
              disabled={!draft.trim() || isAskingAi}
              onClick={handleAskAi}
              startIcon={<Sparkles size={13} />}
              sx={{
                textTransform: 'none',
                fontSize: 11,
                fontWeight: 700,
                py: 0.3,
                px: 1,
                borderRadius: 1.5,
                color: isAskingAi ? 'primary.main' : 'text.secondary',
                borderColor: alpha(theme.palette.divider, 0.4),
                '&:hover': {
                  color: 'primary.main',
                  borderColor: 'primary.main',
                },
              }}
            >
              {isAskingAi ? 'Thinking...' : 'Ask AI'}
            </Button>
          </span>
        </Tooltip>
      </Box>

      {/* Input Field */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1.25,
          borderTop: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
        }}
      >
        <Box
          component="input"
          value={draft}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') send();
          }}
          placeholder={
            isAskingAi
              ? 'Generating AI answer...'
              : isUploading
                ? 'Uploading image...'
                : uploadedImageUrl
                  ? 'Add a caption (optional)...'
                  : whisperTarget
                    ? `Whisper to ${whisperTarget.name}...`
                    : replyingTo
                      ? `Reply to ${replyingTo.authorName}...`
                      : 'Send a message or type question for AI...'
          }
          sx={{
            flex: 1,
            minWidth: 0,
            bgcolor: 'background.neutral',
            border: `1px solid ${whisperTarget ? alpha(theme.palette.warning.main, 0.4) : theme.palette.divider}`,
            borderRadius: 2,
            px: 1.5,
            py: 1,
            fontSize: 13,
            color: 'text.primary',
            outline: 'none',
            '&::placeholder': { color: 'text.disabled' },
            '&:focus': {
              borderColor: whisperTarget
                ? theme.palette.warning.main
                : alpha(theme.palette.primary.main, 0.6),
            },
          }}
        />

        <IconButton
          onClick={send}
          disabled={!canSend}
          sx={{
            bgcolor: whisperTarget ? 'warning.main' : 'primary.main',
            color: whisperTarget ? 'common.black' : 'primary.contrastText',
            '&:hover': {
              bgcolor: whisperTarget ? 'warning.dark' : alpha(theme.palette.primary.main, 0.85),
            },
            '&.Mui-disabled': { bgcolor: 'background.neutral', color: 'text.disabled' },
          }}
        >
          <Send size={16} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default RoomChatPanel;

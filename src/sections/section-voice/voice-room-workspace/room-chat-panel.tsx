import { Lock, Send, Users, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  alpha,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

import { filterVisibleMessages } from '../@mock_/messages-data';
import { RoomMessageBubble } from './room-message-bubble';

import type { VoiceParticipant } from '../voice-room-header/types';
import type { ChatMessage } from './types';

type RoomChatPanelProps = {
  messages: ChatMessage[];
  currentUserId: string;
  participants?: VoiceParticipant[];
  onSendMessage?: (
    text: string,
    replyToId?: string,
    privateTo?: { id: string; name: string }
  ) => void;
  onEditMessage?: (id: string, text: string) => void;
  onReactMessage?: (id: string, emoji: string) => void;
  onClose?: () => void;
  title?: string;
};

export const RoomChatPanel = ({
  messages,
  currentUserId,
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
      const id = p.id || p.userId || p.user?.userId;
      return id && id !== currentUserId;
    });
  }, [participants, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages.length]);

  // Handle setting reply and auto-inheriting private whisper target
  const handleInitiateReply = (message: ChatMessage) => {
    setReplyingTo(message);

    // If replying to a private message, lock the whisper target to that user
    if (message.privateTo) {
      if (message.authorId === currentUserId) {
        // You were the sender -> reply to the recipient
        setWhisperTarget({ id: message.privateTo.id, name: message.privateTo.name });
      } else {
        // You were the recipient -> reply back to the author
        setWhisperTarget({ id: message.authorId, name: message.authorName });
      }
    }
  };

  const handleCancelReply = () => {
    // If the whisper was automatically inherited from this private message, clear it
    if (replyingTo?.privateTo) {
      setWhisperTarget(null);
    }
    setReplyingTo(null);
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;

    onSendMessage?.(text, replyingTo?.id, whisperTarget || undefined);
    setDraft('');
    setReplyingTo(null);
    setWhisperTarget(null);
  };

  const handleSelectWhisperUser = (p: VoiceParticipant) => {
    const id = p.id || p.userId || p.user?.userId || '';
    const name = p.name || p.username || p.user?.name || 'User';
    setWhisperTarget({ id, name });
    setWhisperAnchorEl(null);
  };

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
            <RoomMessageBubble
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
            py: 1,
            borderTop: `1px solid ${replyingTo.privateTo ? theme.palette.warning.main : theme.palette.primary.main}`,
            bgcolor: alpha(
              replyingTo.privateTo ? theme.palette.warning.main : theme.palette.primary.main,
              0.08
            ),
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
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
            </Stack>
            <Typography noWrap sx={{ fontSize: 12, color: 'text.secondary', maxWidth: 260 }}>
              {replyingTo.text}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleCancelReply} sx={{ color: 'text.secondary' }}>
            <X size={14} />
          </IconButton>
        </Box>
      )}

      {/* Whisper Indicator Banner */}
      {whisperTarget && !replyingTo?.privateTo && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            px: 2,
            py: 0.75,
            borderTop: `1px dashed ${alpha(theme.palette.warning.main, 0.4)}`,
            bgcolor: alpha(theme.palette.warning.main, 0.1),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
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

      {/* Input Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1.5,
          borderTop: replyingTo || whisperTarget ? 'none' : `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
        }}
      >
        {whisperableUsers.length > 0 && !replyingTo?.privateTo && (
          <>
            <Tooltip title={whisperTarget ? 'Target selected' : 'Whisper / Private Message'}>
              <IconButton
                size="small"
                onClick={(e) => setWhisperAnchorEl(e.currentTarget)}
                sx={{
                  color: whisperTarget ? 'warning.main' : 'text.secondary',
                  bgcolor: whisperTarget ? alpha(theme.palette.warning.main, 0.12) : 'transparent',
                  p: 0.75,
                }}
              >
                {whisperTarget ? <Lock size={15} /> : <Users size={15} />}
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={whisperAnchorEl}
              open={Boolean(whisperAnchorEl)}
              onClose={() => setWhisperAnchorEl(null)}
              anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
              transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
              <Typography
                variant="caption"
                sx={{ px: 2, py: 0.5, fontWeight: 800, color: 'text.secondary', display: 'block' }}
              >
                Send Private Message To:
              </Typography>
              {whisperTarget && (
                <MenuItem
                  onClick={() => {
                    setWhisperTarget(null);
                    setWhisperAnchorEl(null);
                  }}
                  sx={{ fontSize: 12, color: 'error.main', fontWeight: 600 }}
                >
                  Clear Private Mode (Send to Everyone)
                </MenuItem>
              )}
              {whisperableUsers.map((p) => {
                const id = p.id || p.userId || p.user?.userId || '';
                const name = p.name || p.username || p.user?.name || 'User';
                return (
                  <MenuItem
                    key={id}
                    onClick={() => handleSelectWhisperUser(p)}
                    sx={{ fontSize: 12, gap: 1 }}
                  >
                    <Lock size={12} />
                    {name}
                  </MenuItem>
                );
              })}
            </Menu>
          </>
        )}

        <Box
          component="input"
          value={draft}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') send();
          }}
          placeholder={
            whisperTarget
              ? `Whisper to ${whisperTarget.name}...`
              : replyingTo
                ? `Reply to ${replyingTo.authorName}...`
                : 'Send a message...'
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
          disabled={!draft.trim()}
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

import { X, Send } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { Box, alpha, IconButton, Typography } from '@mui/material';

import { slate, accent } from './theme-tokens';
import { filterVisibleMessages } from './messages-data';
import { RoomMessageBubble } from './room-message-bubble';

import type { ChatMessage } from './types';

type RoomChatPanelProps = {
  messages: ChatMessage[];
  /** Id of the person viewing this chat — used to resolve which private
   * (whisper) messages are visible to them. */
  currentUserId: string;
  onSendMessage?: (text: string, replyToId?: string) => void;
  onEditMessage?: (id: string, text: string) => void;
  onReactMessage?: (id: string, emoji: string) => void;
  onClose?: () => void;
  title?: string;
};

export const RoomChatPanel = ({
  messages,
  currentUserId,
  onSendMessage,
  onEditMessage,
  onReactMessage,
  onClose,
  title = 'Chat',
}: RoomChatPanelProps) => {
  const [draft, setDraft] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  const visibleMessages = useMemo(
    () => filterVisibleMessages(messages, currentUserId),
    [messages, currentUserId]
  );

  const byId = useMemo(
    () => Object.fromEntries(visibleMessages.map((m) => [m.id, m])),
    [visibleMessages]
  );

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    onSendMessage?.(text, replyingTo?.id);
    setDraft('');
    setReplyingTo(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: `1px solid`,
          borderColor: 'divider',
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
          <Typography variant="caption" sx={{ color: slate[700], textAlign: 'center', mt: 2 }}>
            No messages yet — say hello!
          </Typography>
        ) : (
          visibleMessages.map((m) => (
            <RoomMessageBubble
              key={m.id}
              message={m}
              replyTo={m.replyToId ? byId[m.replyToId] : undefined}
              onReply={setReplyingTo}
              onEdit={onEditMessage}
              onReact={onReactMessage}
            />
          ))
        )}
      </Box>

      {replyingTo && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            px: 2,
            py: 1,
            borderTop: (theme) => `1px solid ${theme.palette.primary.main}`,
            bgcolor: alpha(accent.brand, 0.08),
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: accent.brand }}>
              Replying to {replyingTo.authorName}
            </Typography>
            <Typography noWrap sx={{ fontSize: 12, color: slate[400], maxWidth: 260 }}>
              {replyingTo.text}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setReplyingTo(null)} sx={{ color: slate[400] }}>
            <X size={14} />
          </IconButton>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1.5,
          borderTop: replyingTo ? 'none' : (theme) => `1px solid ${theme.palette.divider}`,
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
          placeholder={replyingTo ? `Reply to ${replyingTo.authorName}...` : 'Send a message...'}
          sx={{
            flex: 1,
            minWidth: 0,
            bgcolor: 'background.neutral',
            border: `1px solid`,
            borderColor: 'divider',
            borderRadius: 2,
            px: 1.5,
            py: 1,
            fontSize: 13,
            color: 'text.primary',
            outline: 'none',
            '&::placeholder': { color: slate[400] },
            '&:focus': { borderColor: alpha(accent.brand, 0.6) },
          }}
        />
        <IconButton
          onClick={send}
          disabled={!draft.trim()}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: alpha(accent.brand, 0.85) },
            '&.Mui-disabled': { bgcolor: 'background.neutral', color: 'text.primary' },
          }}
        >
          <Send size={16} />
        </IconButton>
      </Box>
    </Box>
  );
};

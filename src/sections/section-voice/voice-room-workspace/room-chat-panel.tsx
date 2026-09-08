import { X, Send } from 'lucide-react';
import React, { useState } from 'react';

import { Box, alpha, IconButton, Typography } from '@mui/material';

import { slate, accent } from './theme-tokens';

import type { ChatMessage } from './types';

type ChatPanelProps = {
  messages: ChatMessage[];
  onSendMessage?: (text: string) => void;
  onClose?: () => void;
  title?: string;
};

export const ChatPanel = ({ messages, onSendMessage, onClose, title = 'Chat' }: ChatPanelProps) => {
  const [draft, setDraft] = useState('');

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    onSendMessage?.(text);
    setDraft('');
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
          borderBottom: `1px solid ${slate[800]}`,
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: slate[100] }}>
          {title}
        </Typography>
        {onClose && (
          <IconButton size="small" onClick={onClose} sx={{ color: slate[400] }}>
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
        {messages.length === 0 ? (
          <Typography variant="caption" sx={{ color: slate[700], textAlign: 'center', mt: 2 }}>
            No messages yet — say hello!
          </Typography>
        ) : (
          messages.map((m) => (
            <Box
              key={m.id}
              sx={{
                alignSelf: m.isSelf ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}
            >
              {!m.isSelf && (
                <Typography variant="caption" sx={{ color: slate[400], ml: 0.5 }}>
                  {m.authorName}
                </Typography>
              )}
              <Box
                sx={{
                  mt: 0.25,
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  fontSize: 13,
                  lineHeight: 1.4,
                  color: m.isSelf ? '#fff' : slate[200],
                  bgcolor: m.isSelf ? accent.brand : slate[800],
                  wordBreak: 'break-word',
                }}
              >
                {m.text}
              </Box>
            </Box>
          ))
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1.5,
          borderTop: `1px solid ${slate[800]}`,
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
          placeholder="Send a message..."
          sx={{
            flex: 1,
            minWidth: 0,
            bgcolor: slate[800],
            border: `1px solid ${slate[700]}`,
            borderRadius: 2,
            px: 1.5,
            py: 1,
            fontSize: 13,
            color: slate[100],
            outline: 'none',
            '&::placeholder': { color: slate[400] },
            '&:focus': { borderColor: alpha(accent.brand, 0.6) },
          }}
        />
        <IconButton
          onClick={send}
          disabled={!draft.trim()}
          sx={{
            bgcolor: accent.brand,
            color: '#fff',
            '&:hover': { bgcolor: alpha(accent.brand, 0.85) },
            '&.Mui-disabled': { bgcolor: slate[800], color: slate[700] },
          }}
        >
          <Send size={16} />
        </IconButton>
      </Box>
    </Box>
  );
};

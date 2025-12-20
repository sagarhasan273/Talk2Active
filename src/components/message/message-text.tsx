import type { Message } from 'src/types/type-room';

import { Box, Paper, Typography } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { MessageMention } from './message-mention';

export function MessageText({ message }: { message: Message }) {
  return (
    <Paper
      sx={{
        maxWidth: '100%',
        p: 1.25,
        pb: 0.75,
        backgroundColor: (theme) =>
          message.sender === 'me'
            ? varAlpha(theme.vars.palette.background.paperChannel, 1)
            : varAlpha(theme.vars.palette.background.paperChannel, 0.5),
        borderRadius: message.sender === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 8px',
        boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
        position: 'relative',
        border: message.isPrivate
          ? (theme) => `1px dashed ${varAlpha(theme.vars.palette.error.mainChannel, 1)}`
          : message.type === 'system'
            ? (theme) => `1px solid ${varAlpha(theme.vars.palette.info.mainChannel, 1)}`
            : 'none',
      }}
    >
      <GetTextFromMessage message={message} />

      <MessageMention message={message} />

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
        {message.sender === 'them' && (
          <Typography
            variant="caption"
            className="message-time"
            sx={{
              color: (theme) =>
                varAlpha(
                  theme.vars.palette.primary[
                    theme.palette.mode === 'dark' ? 'lightChannel' : 'mainChannel'
                  ],
                  message.isUnread && message.sender === 'them' ? 1 : 0.8
                ),
              fontWeight: message.isUnread && message.sender === 'them' ? 'bold' : 'normal',
              mr: 'auto',
            }}
          >
            {message.type === 'system' ? (
              <Box component="span" sx={{ color: 'info.main' }}>
                Talk2Active System
              </Box>
            ) : (
              message.userInfo.name
            )}
          </Typography>
        )}

        <Typography
          variant="caption"
          className="message-time"
          sx={{
            color: 'text.primary',
            fontSize: '0.5rem',
            opacity: message.isUnread && message.sender === 'them' ? 1 : 0.5,
            transition: 'opacity 0.2s',
          }}
        >
          {message.time}
        </Typography>

        {message.sender === 'me' && (
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
  );
}

function GetTextFromMessage({ message }: { message: Message }) {
  if (message.type === 'system') {
    if (message.systemMessageType === 'user-joined') {
      return (
        <Box sx={{ typography: 'body2' }}>
          <Box component="span" sx={{ color: 'primary.main' }}>
            {message?.userInfo.name}
          </Box>{' '}
          has joined in the voice room.
        </Box>
      );
    }
    if (message.systemMessageType === 'user-left') {
      return (
        <Box sx={{ typography: 'body2' }}>
          <Box component="span" sx={{ color: 'primary.main' }}>
            {message?.userInfo.name}
          </Box>{' '}
          has left the chat.
        </Box>
      );
    }
  }

  return (
    <Typography
      variant="body2"
      sx={{
        wordBreak: 'break-word',
        lineHeight: 1.4,
        whiteSpace: 'pre-wrap',
      }}
    >
      {message.text}
    </Typography>
  );
}

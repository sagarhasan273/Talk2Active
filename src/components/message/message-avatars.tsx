import { Box, Avatar, Typography } from '@mui/material';

import { fUsername } from 'src/utils/helper';

import { varAlpha } from 'src/theme/styles';

import type { MessageAvatarsProps } from './type';

export function MessageAvatars({ message }: MessageAvatarsProps) {
  return (
    <>
      {message.sender === 'them' && (
        <Avatar
          src={message.type === 'system' ? undefined : message.senderInfo.avatar}
          sx={{
            mr: 0.5,
            borderRadius: 1,
            width: 32,
            height: 32,
            fontSize: '0.875rem',
            border:
              message.type === 'system'
                ? (theme) => `1px solid ${varAlpha(theme.vars.palette.info.mainChannel, 1)}`
                : 'none',
          }}
        >
          {message.type === 'system' ? 'TS' : fUsername(message.senderInfo.name)}
        </Avatar>
      )}

      {message.sender === 'me' && message.isPrivate && (
        <Avatar
          src={message?.targetUserInfo?.avatar || ''}
          sx={{
            ml: 0.5,
            borderRadius: 1,
            width: 32,
            height: 32,
            fontSize: '0.875rem',
            border: (theme) => `1px dashed ${varAlpha(theme.vars.palette.error.mainChannel, 1)}`,
          }}
        >
          {fUsername(message?.targetUserInfo?.name || '')}
        </Avatar>
      )}

      {/* UNREAD INDICATOR */}
      {message.isUnread && message.sender === 'them' && (
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
      {message.isPrivate && message.sender === 'them' && (
        <Box
          sx={{
            position: 'absolute',
            left: 4,
            top: -2,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              borderRadius: 0.5,
              px: 0.5,
              py: 0.1,
              border: message.isPrivate
                ? (theme) => `1px dashed ${varAlpha(theme.vars.palette.error.mainChannel, 1)}`
                : 'none',
              color: 'error.main',
            }}
          >
            PM
          </Typography>
        </Box>
      )}

      {message.isPrivate && message.sender === 'me' && (
        <Box
          sx={{
            position: 'absolute',
            right: 4,
            top: -2,
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
    </>
  );
}

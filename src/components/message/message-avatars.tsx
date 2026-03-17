import { Box, Avatar, Typography } from '@mui/material';

import { fUsername } from 'src/utils/helper';

import { varAlpha } from 'src/theme/styles';

import type { MessageAvatarsProps } from './type';

export function MessageAvatars({ message }: MessageAvatarsProps) {
  const isSystem = message.type === 'system';
  const isVerified = message?.senderInfo?.verified ?? false;

  const avatarBaseSx = {
    borderRadius: 1,
    width: 32,
    height: 32,
    fontSize: '0.875rem',
  } as const;

  // ── Avatars ──────────────────────────────────────────────────────────────────

  const theirAvatar = message.sender === 'them' && (
    <Avatar
      src={isSystem ? undefined : isVerified ? message.senderInfo?.profilePhoto : undefined}
      alt={isSystem ? 'TS' : fUsername(message.senderInfo?.name)}
      sx={{
        ...avatarBaseSx,
        mr: 0.5,
        border: isSystem
          ? (theme) => `1px solid ${varAlpha(theme.vars.palette.info.mainChannel, 1)}`
          : 'none',
      }}
    >
      {isSystem ? 'TS' : fUsername(message.senderInfo?.name)}
    </Avatar>
  );

  const myPrivateAvatar = message.sender === 'me' && message.isPrivate && (
    <Avatar
      src={isVerified ? message.receiverInfo?.profilePhoto || '' : undefined}
      alt={fUsername(message.receiverInfo?.name)}
      sx={{
        ...avatarBaseSx,
        ml: 0.5,
        border: (theme) => `1px dashed ${varAlpha(theme.vars.palette.error.mainChannel, 1)}`,
      }}
    >
      {fUsername(message.receiverInfo?.name || '')}
    </Avatar>
  );

  return (
    <>
      {theirAvatar}
      {myPrivateAvatar}

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

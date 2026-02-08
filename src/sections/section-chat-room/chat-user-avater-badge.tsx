import React from 'react';

import { MicOff as MicOffIcon } from '@mui/icons-material';
import { Box, Badge, Avatar, useTheme, Typography } from '@mui/material';

import { fUsername } from 'src/utils/helper';

import { STATUS_OPTIONS } from './chat-status-button';

import type { ChatUserCardProps } from './chat-user-card';

// Status configurations
const statusConfig = {
  online: STATUS_OPTIONS[0],
  offline: STATUS_OPTIONS[5],
  busy: STATUS_OPTIONS[1],
  brb: STATUS_OPTIONS[2],
  afk: STATUS_OPTIONS[3],
  zzz: STATUS_OPTIONS[4],
};

export function ChatUserAvatarBadge({
  avatar,
  user,
}: {
  avatar: string;
  user: ChatUserCardProps['user'];
}) {
  const theme = useTheme();

  // Safely resolve palette tokens like 'success.mainChannel' to a concrete value
  const palette = theme.vars.palette as unknown as Record<string, any>;

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

  const statusColor = bgColorValue(statusConfig[user.status]?.color || 'primary.main');

  return (
    <Badge
      overlap="circular"
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      badgeContent={
        <Box
          sx={{
            borderRadius: 1,
            px: 1,
            background:
              theme.palette.mode === 'light'
                ? `${theme.palette.grey[500]}`
                : theme.palette.grey[500],
            color: 'common.white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...(user.userType === 'Host' && {
              background:
                theme.palette.mode === 'light'
                  ? `${theme.palette.primary.main}`
                  : theme.palette.primary.dark,
            }),
          }}
        >
          <Typography variant="caption">{user.userType}</Typography>
        </Box>
      }
    >
      <Badge
        overlap="circular"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        badgeContent={
          user.isMuted ? (
            <MicOffIcon
              fontSize="small"
              sx={{
                color: 'error.main',
                bgcolor: 'background.paper',
                borderRadius: '50%',
                p: 0.25,
              }}
            />
          ) : (
            <Box
              sx={{
                borderRadius: '50%',
                background: `${theme.palette.background.paper}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {(() => {
                const Icon = statusConfig[user.status].icon;
                return (
                  <Icon
                    style={{
                      color: statusColor,
                      width: 18,
                      height: 18,
                    }}
                  />
                );
              })()}
            </Box>
          )
        }
      >
        <Avatar
          src={user.verified ? avatar : undefined}
          sx={{
            width: 92,
            height: 92,
            mb: 1,
            border: `2px solid ${statusColor}`,
            background: 'linear-gradient(135deg, #333, #555)',
            fontSize: 24,
          }}
        >
          {fUsername(user.name)}
        </Avatar>
      </Badge>
    </Badge>
  );
}

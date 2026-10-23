import { alpha, Box, useTheme } from '@mui/material';
import React from 'react';

import { useSocialStorage } from '@/core/contexts';
import type { SocialChatProps } from '@/types/type-social';
import { SocialChatDirectory } from './social-chat-directory';
import { SocialChatConversation } from './social-conversation';

export const SocialMain: React.FC<SocialChatProps> = ({
  friends = [],
  following = [],
  isLoading = false,
  onClose,
  onUnfollow,
  onJoinRoom,
}) => {
  const theme = useTheme();
  const { activeFriend } = useSocialStorage();

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        '& *::-webkit-scrollbar': { width: 5 },
        '& *::-webkit-scrollbar-thumb': {
          bgcolor: alpha(theme.palette.divider, 0.5),
          borderRadius: 0.5,
        },
      }}
    >
      {activeFriend ? (
        <SocialChatConversation onClose={onClose} onJoinRoom={onJoinRoom} />
      ) : (
        <SocialChatDirectory
          friends={friends}
          following={following}
          isLoading={isLoading}
          onClose={onClose}
          onUnfollow={onUnfollow}
          onJoinRoom={onJoinRoom}
        />
      )}
    </Box>
  );
};

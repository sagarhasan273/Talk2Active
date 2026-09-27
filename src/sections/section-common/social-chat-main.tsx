import { alpha, Box, useTheme } from '@mui/material';
import React from 'react';

import { useSocialChat } from '@/core/contexts/context-social-chat';
import type { SocialChatProps } from '@/types/type-social';
import { SocialChatConversation } from './social-chat-conversation';
import { SocialChatDirectory } from './social-chat-directory';

export const SocialChatMain: React.FC<SocialChatProps> = ({
  friends = [],
  followers = [],
  following = [],
  isLoading = false,
  onClose,
  onUnfollow,
  onJoinRoom,
}) => {
  const theme = useTheme();
  const { activeFriend } = useSocialChat();

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
          borderRadius: 1,
        },
      }}
    >
      {activeFriend ? (
        <SocialChatConversation onClose={onClose} onJoinRoom={onJoinRoom} />
      ) : (
        <SocialChatDirectory
          friends={friends}
          followers={followers}
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

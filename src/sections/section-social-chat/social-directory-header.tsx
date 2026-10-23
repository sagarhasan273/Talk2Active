import { Sparkles, X } from 'lucide-react';
import React from 'react';

import { alpha, Box, Button, IconButton, Stack, Typography, useTheme } from '@mui/material';

import type { SocialChatTabKey } from '@/types/type-social';

interface DirectoryHeaderProps {
  unreadFriendsCount: number;
  tab: SocialChatTabKey;
  setTab: (tab: SocialChatTabKey) => void;
  isSearchOpen: boolean;
  setSearchQuery: (q: string) => void;
  setIsSearchOpen: (open: boolean) => void;
  onClose?: () => void;
}

export const DirectoryHeader: React.FC<DirectoryHeaderProps> = ({
  unreadFriendsCount,
  tab,
  setTab,
  isSearchOpen,
  setSearchQuery,
  setIsSearchOpen,
  onClose,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={1}
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
        bgcolor: isDark ? 'transparent' : '#f8fafc',
        flexShrink: 0,
      }}
    >
      {/* LEFT SIDE: Title & Unread Badge (Animated Vertical Shift) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, height: 36 }}>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
            color: isDark ? 'text.primary' : '#0f172a',
            whiteSpace: 'nowrap',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Social Directory
        </Typography>

        <Box
          sx={{
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            maxHeight: unreadFriendsCount > 0 ? 24 : 0,
            opacity: unreadFriendsCount > 0 ? 1 : 0,
            mt: unreadFriendsCount > 0 ? 0.5 : 0,
          }}
        >
          <Box
            sx={{
              display: 'inline-block',
              px: 0.85,
              py: 0.25,
              borderRadius: 0.5,
              fontSize: 10.5,
              fontWeight: 800,
              bgcolor: alpha(theme.palette.error.main, 0.12),
              color: 'error.main',
              whiteSpace: 'nowrap',
            }}
          >
            {unreadFriendsCount} {unreadFriendsCount === 1 ? 'friend' : 'friends'} unread
          </Box>
        </Box>
      </Box>

      {/* RIGHT SIDE: Action Buttons */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <Button
          size="small"
          color="warning"
          variant={tab === 'followers' ? 'contained' : 'outlined'}
          onClick={() => {
            setTab('followers');
            if (isSearchOpen) {
              setSearchQuery('');
              setIsSearchOpen(false);
            }
          }}
          startIcon={<Sparkles size={13} strokeWidth={2.5} />}
          sx={{
            borderRadius: 0.5,
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: 0.5,
          }}
        >
          Followers
        </Button>

        {onClose && (
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              borderRadius: 0.5,
              border: '1px solid',
              borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
              color: 'text.secondary',
            }}
          >
            <X size={16} />
          </IconButton>
        )}
      </Stack>
    </Stack>
  );
};

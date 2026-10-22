import { Search, X } from 'lucide-react';
import React from 'react';

import { alpha, Box, IconButton, InputBase, useTheme } from '@mui/material';

import type { SocialChatTabKey } from '@/types/type-social';

interface DirectoryTabsProps {
  tab: SocialChatTabKey;
  setTab: (tab: SocialChatTabKey) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  unreadFriendsCount: number;
  friendsCount: number;
  followingCount: number;
}

export const DirectoryTabs: React.FC<DirectoryTabsProps> = ({
  tab,
  setTab,
  isSearchOpen,
  setIsSearchOpen,
  searchQuery,
  setSearchQuery,
  unreadFriendsCount,
  friendsCount,
  followingCount,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const counts: Record<string, number> = {
    friends: friendsCount,
    following: followingCount,
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 0.75,
        gap: 0.5,
        bgcolor: isDark ? alpha('#fff', 0.02) : '#f8fafc',
        borderBottom: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
        flexShrink: 0,
      }}
    >
      {/* Animated Search Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flex: isSearchOpen ? 1 : '0 0 auto',
          width: isSearchOpen ? 'auto' : '32px',
          height: 32,
          bgcolor: isSearchOpen ? (isDark ? alpha('#fff', 0.04) : '#ffffff') : 'transparent',
          borderRadius: 1,
          border: '1px solid',
          borderColor: isSearchOpen ? (isDark ? alpha('#fff', 0.08) : '#e2e8f0') : 'transparent',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
        }}
      >
        <IconButton
          size="small"
          onClick={() => {
            if (isSearchOpen) setSearchQuery('');
            setIsSearchOpen(!isSearchOpen);
          }}
          sx={{
            minWidth: 32,
            height: 32,
            borderRadius: 1,
            color: isSearchOpen
              ? isDark ? 'text.primary' : '#0f172a'
              : isDark ? 'text.secondary' : '#64748b',
            '&:hover': {
              color: isDark ? 'text.primary' : '#0f172a',
              bgcolor: isSearchOpen ? 'transparent' : alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          {isSearchOpen ? <X size={16} /> : <Search size={16} />}
        </IconButton>
        <InputBase
          autoFocus={isSearchOpen}
          placeholder={`Search ${tab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setSearchQuery('');
              setIsSearchOpen(false);
            }
          }}
          sx={{
            flex: 1,
            fontSize: 12,
            opacity: isSearchOpen ? 1 : 0,
            pointerEvents: isSearchOpen ? 'auto' : 'none',
            transition: 'opacity 0.2s ease',
            ml: 0.5,
          }}
        />
      </Box>

      {/* Navigation Tabs */}
      <Box
        sx={{
          display: 'flex',
          flex: isSearchOpen ? '0 0 0px' : 1,
          opacity: isSearchOpen ? 0 : 1,
          overflow: 'hidden',
          gap: 0.5,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {(['friends', 'following'] as SocialChatTabKey[]).map((key) => {
          const active = tab === key;
          const showUnreadBadge = key === 'friends' && unreadFriendsCount > 0;

          return (
            <Box
              key={key}
              onClick={() => {
                setTab(key);
                if (isSearchOpen) {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }
              }}
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                py: 0.75,
                borderRadius: 1,
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                minWidth: 80,
                bgcolor: active
                  ? isDark
                    ? alpha(theme.palette.primary.main, 0.16)
                    : alpha(theme.palette.primary.main, 0.1)
                  : 'transparent',
                color: active ? 'primary.main' : isDark ? 'text.secondary' : '#64748b',
                border: '1px solid',
                borderColor: active ? alpha(theme.palette.primary.main, 0.3) : 'transparent',
                transition: 'all 0.18s ease',
                textTransform: 'capitalize',
              }}
            >
              <span>{key}</span>
              <Box
                component="span"
                sx={{
                  px: 0.5,
                  py: 0.1,
                  borderRadius: 0.75,
                  fontSize: 10,
                  fontWeight: 800,
                  bgcolor: showUnreadBadge
                    ? 'error.main'
                    : active
                      ? alpha(theme.palette.primary.main, 0.2)
                      : isDark
                        ? alpha('#fff', 0.06)
                        : '#e2e8f0',
                  color: showUnreadBadge ? '#fff' : 'inherit',
                }}
              >
                {showUnreadBadge ? unreadFriendsCount : counts[key]}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

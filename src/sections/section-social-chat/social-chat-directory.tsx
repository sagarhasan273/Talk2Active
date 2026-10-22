import { alpha, Box, CircularProgress, Stack, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useSocialSetting, useSocialStorage } from '@/core/contexts';
import type { AllRelationsType, SocialChatTabKey } from '@/types/type-social';


import { useGetFollowersQuery } from '@/core/apis';
import { useCredentials } from '@/core/slices';
import { DirectoryHeader } from './social-directory-header';
import { DirectoryListItem } from './social-directory-list-item';
import { DirectoryTabs } from './social-directory-tabs';

interface SocialChatDirectoryProps {
  friends?: AllRelationsType[];
  following?: AllRelationsType[];
  isLoading?: boolean;
  onClose?: () => void;
  onUnfollow?: (targetUserId: string, person: AllRelationsType) => Promise<void> | void;
  onJoinRoom?: (roomId: string) => void;
}

export const SocialChatDirectory: React.FC<SocialChatDirectoryProps> = ({
  friends = [],
  following = [],
  isLoading = false,
  onClose,
  onUnfollow,
  onJoinRoom,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { currentUserId } = useCredentials();

  const { unreadCounts, unreadFriendsCount, onlineStatusMap } = useSocialStorage();
  const { tab, setTab, openChat } = useSocialSetting();

  const [unfollowedIds, setUnfollowedIds] = useState<Set<string>>(new Set());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      if (tab === 'followers') {
        setPage(1);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery, tab]);

  const { data: followersApiData, isFetching: isFetchingFollowers } = useGetFollowersQuery(
    { userId: currentUserId, page, search: debouncedSearch },
    { skip: !currentUserId || tab !== 'followers' }
  );

  const apiFollowersList = useMemo(() => {
    if (!followersApiData) return [];
    return Array.isArray(followersApiData) ? followersApiData : followersApiData?.data ?? [];
  }, [followersApiData]);

  const friendIds = useMemo(() => new Set(friends.map((f) => f.accountDetails.userId)), [friends]);

  const visibleFollowing = useMemo(
    () => following.filter((item) => !unfollowedIds.has(item.accountDetails.userId)),
    [following, unfollowedIds]
  );

  // 4. Group data by tab
  const rawDataByTab: Record<SocialChatTabKey, AllRelationsType[]> = {
    friends,
    followers: apiFollowersList,
    following: visibleFollowing,
  };

  const dataByTab = useMemo(() => {
    let list = rawDataByTab[tab] || [];

    // Client-side search for friends/following (Followers are searched server-side)
    if (searchQuery.trim() && tab !== 'followers') {
      const query = searchQuery.toLowerCase();
      list = list.filter((item) => item.accountDetails?.name?.toLowerCase().includes(query));
    }

    return [...list].sort((a, b) => {
      const timeA = new Date(a.latestMessage?.createdAt || a.accountDetails?.lastActive || 0).getTime();
      const timeB = new Date(b.latestMessage?.createdAt || b.accountDetails?.lastActive || 0).getTime();
      return timeB - timeA;
    });
  }, [rawDataByTab, tab, searchQuery]);

  const handleUnfollowClick = async (e: React.MouseEvent, item: AllRelationsType) => {
    e.stopPropagation();
    const targetId = item.accountDetails.userId;
    if (!targetId) return;

    try {
      await onUnfollow?.(targetId, item);
      setUnfollowedIds((prev) => new Set(prev).add(targetId));
    } catch (err) {
      console.error('Failed to unfollow user:', err);
    }
  };

  const handleOpenChat = (item: AllRelationsType) => {
    openChat(item);
    if (tab === 'followers') {
      setTab('friends');
    }
  };

  // 5. Infinite Scroll Trigger
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

      const isBottom = scrollHeight - scrollTop <= clientHeight + 50;

      // Determine if there are more items to fetch.
      // Replace this with `followersApiData?.meta?.hasNextPage` if your API provides it.
      const hasMore = apiFollowersList.length > 0 && apiFollowersList.length % 20 === 0;

      if (isBottom && tab === 'followers' && hasMore && !isFetchingFollowers) {
        setPage((prev) => prev + 1);
      }
    },
    [tab, isFetchingFollowers, apiFollowersList.length]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, bgcolor: isDark ? '#181c26' : '#ffffff' }}>

      <DirectoryHeader
        unreadFriendsCount={unreadFriendsCount}
        tab={tab}
        setTab={setTab}
        isSearchOpen={isSearchOpen}
        setSearchQuery={setSearchQuery}
        setIsSearchOpen={setIsSearchOpen}
        onClose={onClose}
      />

      <DirectoryTabs
        tab={tab}
        setTab={setTab}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        unreadFriendsCount={unreadFriendsCount}
        friendsCount={rawDataByTab.friends.length}
        followingCount={rawDataByTab.following.length}
      />

      <Box sx={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>

        {tab === 'followers' && isFetchingFollowers && page === 1 && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.25,
              borderRadius: 4,
              bgcolor: 'background.default',
              boxShadow: isDark
                ? '0 4px 12px rgba(0, 0, 0, 0.6)'
                : '0 4px 12px rgba(15, 23, 42, 0.12)',
              border: '1px solid',
              borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05),
              animation: 'fadeInDown 0.2s ease-out forwards',
              '@keyframes fadeInDown': {
                '0%': { opacity: 0, transform: 'translate(-50%, -10px)' },
                '100%': { opacity: 1, transform: 'translate(-50%, 0)' },
              },
            }}
          >
            <CircularProgress size={14} thickness={5} />
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.primary' }}>
              Searching...
            </Typography>
          </Box>
        )}

        <Box
          onScroll={handleScroll}
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 1,
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': { width: 5 },
            '&::-webkit-scrollbar-thumb': { bgcolor: alpha(theme.palette.divider, 0.4), borderRadius: 1 },
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : dataByTab.length === 0 && !isFetchingFollowers ? (
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'text.secondary', mt: 4 }}>
              {searchQuery ? `No results found for "${searchQuery}"` : `No ${tab} found.`}
            </Typography>
          ) : (
            <Stack spacing={0.5}>
              {dataByTab.map((item) => {
                const person = item.accountDetails;
                return (
                  <DirectoryListItem
                    key={person.userId}
                    item={item}
                    tab={tab}
                    canChat={friendIds.has(person.userId)}
                    unreadCount={unreadCounts[person.userId] || 0}
                    roomId={onlineStatusMap[person.userId] || false}
                    onOpenChat={handleOpenChat}
                    onJoinRoom={onJoinRoom}
                    onUnfollow={handleUnfollowClick}
                  />
                );
              })}

              {/* Bottom Pagination Loading Spinner */}
              {tab === 'followers' && isFetchingFollowers && page > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={16} />
                </Box>
              )}
            </Stack>
          )}
        </Box>
      </Box>

      {/* Footer Info Box */}
      {tab !== 'friends' && (
        <Box
          sx={{
            px: 2,
            py: 1,
            borderTop: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
            bgcolor: isDark ? alpha('#fff', 0.02) : '#f8fafc',
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontSize: 10.5, color: isDark ? 'text.secondary' : '#64748b', lineHeight: 1.4 }}>
            Direct chat is reserved for mutual friends. Follow each other back to connect.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(SocialChatDirectory);

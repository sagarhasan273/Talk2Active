// src/sections/section-common/social-chat-directory.tsx

import { Lock, MessageCircle, Mic, PhoneCall, Search, Sparkles, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import {
  alpha,
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputBase,
  Stack,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';

import { ButtonUnfollowIcon } from '@/components/buttons';
import { useSocialSetting, useSocialStorage } from '@/core/contexts';
import type { AllRelationsType, SocialChatTabKey } from '@/types/type-social';
import { fToNow } from '@/utils/format-time';
import { getInitials } from '@/utils/social-chat-helper';

interface SocialChatDirectoryProps {
  friends?: AllRelationsType[];
  followers?: AllRelationsType[];
  following?: AllRelationsType[];
  isLoading?: boolean;
  onClose?: () => void;
  onUnfollow?: (targetUserId: string, person: AllRelationsType) => Promise<void> | void;
  onJoinRoom?: (roomId: string) => void;
}

export const SocialChatDirectory: React.FC<SocialChatDirectoryProps> = ({
  friends = [],
  followers = [],
  following = [],
  isLoading = false,
  onClose,
  onUnfollow,
  onJoinRoom,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { unreadCounts, unreadFriendsCount, onlineStatusMap } = useSocialStorage();
  const { tab, setTab, openChat } = useSocialSetting();

  const [unfollowedIds, setUnfollowedIds] = useState<Set<string>>(new Set());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const friendIds = useMemo(() => new Set(friends.map((f) => f.accountDetails.userId)), [friends]);

  const visibleFollowing = useMemo(
    () => following.filter((item) => !unfollowedIds.has(item.accountDetails.userId)),
    [following, unfollowedIds]
  );

  const rawDataByTab: Record<SocialChatTabKey, AllRelationsType[]> = {
    friends,
    followers,
    following: visibleFollowing,
  };

  const dataByTab = useMemo(() => {
    let list = rawDataByTab[tab] || [];

    // Filter by search term if active
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter((item) =>
        item.accountDetails?.name?.toLowerCase().includes(query)
      );
    }

    return [...list].sort((a, b) => {
      const timeA = new Date(
        a.latestMessage?.createdAt || a.accountDetails?.lastActive || 0
      ).getTime();
      const timeB = new Date(
        b.latestMessage?.createdAt || b.accountDetails?.lastActive || 0
      ).getTime();
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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        bgcolor: isDark ? '#181c26' : '#ffffff',
      }}
    >
      {/* Directory Header */}
      {/* You will need to import Zoom, Chip, and Button from '@mui/material' if not already imported */}

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
        {/* LEFT SIDE: Title & Unread Badge */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
              color: isDark ? 'text.primary' : '#0f172a',
              whiteSpace: 'nowrap',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Smoothly animates the title's movement
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
            }}
          >
            <Box
              sx={{
                display: 'inline-block',
                px: 0.85,
                py: 0.25,
                borderRadius: 1,
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
              borderRadius: 1,
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
                borderRadius: 1,
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

      {/* Navigation Tabs & Search */}
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
        {/* Animated Search Bar (Expands Left to Right) */}
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

        {/* Tabs Container */}
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
            const count = rawDataByTab[key]?.length || 0;
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
                  minWidth: 80, // Prevent text wrapping during transition
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
                  {showUnreadBadge ? unreadFriendsCount : count}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Directory List */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          p: 1,
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: 5 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: alpha(theme.palette.divider, 0.4),
            borderRadius: 1,
          },
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : dataByTab.length === 0 ? (
          <Typography
            variant="caption"
            sx={{ display: 'block', textAlign: 'center', color: 'text.secondary', mt: 4 }}
          >
            {searchQuery ? `No results found for "${searchQuery}"` : `No ${tab} found.`}
          </Typography>
        ) : (
          <Stack spacing={0.5}>
            {dataByTab.map((item) => {
              const person = item.accountDetails;
              const canChat = friendIds.has(person.userId);
              const unreadCount = unreadCounts[person.userId] || 0;

              const roomId = onlineStatusMap[person.userId] || false;
              const isInRoom = Boolean(roomId);

              const latestText =
                item.latestMessage?.text || `Last seen: ${fToNow(person.lastActive)} ago`;

              return (
                <Box
                  key={person.userId}
                  onClick={() => {
                    if (canChat) {
                      openChat(item);
                    }
                    if (tab === 'followers') {
                      setTab('friends');
                    }
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    px: 1.25,
                    py: 0.9,
                    borderRadius: 1,
                    cursor: canChat ? 'pointer' : 'default',
                    transition: 'background-color 0.15s ease, transform 0.12s ease',
                    '&:hover': canChat
                      ? {
                        bgcolor: isDark ? alpha('#fff', 0.04) : '#f8fafc',
                      }
                      : undefined,
                  }}
                >
                  {/* Avatar + Unread Badge + Room Indicator Dot */}
                  <Box sx={{ position: 'relative', flexShrink: 0 }}>
                    <Badge
                      color="error"
                      badgeContent={unreadCount}
                      invisible={unreadCount === 0}
                      overlap="circular"
                    >
                      <Avatar
                        src={person.profilePhoto}
                        sx={{
                          width: 38,
                          height: 38,
                          fontSize: 13,
                          fontWeight: 800,
                          bgcolor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.1),
                          color: 'primary.main',
                          border: '1px solid',
                          borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
                        }}
                      >
                        {getInitials(person.name)}
                      </Avatar>
                    </Badge>
                    {isInRoom && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: -2,
                          right: -2,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          bgcolor: 'success.main',
                          border: `2px solid ${isDark ? '#181c26' : '#ffffff'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
                          '@keyframes voicePulse': {
                            '0%': {
                              transform: 'scale(0.95)',
                              boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)',
                            },
                            '70%': {
                              transform: 'scale(1)',
                              boxShadow: '0 0 0 6px rgba(16, 185, 129, 0)',
                            },
                            '100%': {
                              transform: 'scale(0.95)',
                              boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)',
                            },
                          },
                          animation: 'voicePulse 2s infinite ease-in-out',
                        }}
                      >
                        <Mic size={9} strokeWidth={3} />
                      </Box>
                    )}
                  </Box>

                  {/* Name & Latest Message / Bio */}
                  <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                    <Typography
                      sx={{
                        fontSize: 12.5,
                        fontWeight: unreadCount > 0 ? 800 : 700,
                        lineHeight: 1.2,
                        color: canChat ? 'primary.main' : 'text.primary',
                      }}
                      noWrap
                    >
                      {person.name}
                    </Typography>
                    {(canChat || (!canChat && isInRoom)) && (
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontSize: 11,
                          color:
                            unreadCount > 0
                              ? 'text.primary'
                              : isInRoom
                                ? 'success.main'
                                : isDark
                                  ? 'text.secondary'
                                  : '#64748b',
                          fontWeight: unreadCount > 0 ? 700 : 500,
                          mt: 0.2,
                        }}
                        noWrap
                      >
                        {unreadCount > 0
                          ? `${unreadCount} unread messages`
                          : isInRoom
                            ? '🎙️ In a voice room'
                            : latestText}
                      </Typography>
                    )}
                  </Box>

                  {/* Right Action Buttons */}
                  <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
                    {isInRoom && (
                      <Tooltip title={`Join ${person.name}'s room`} arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (roomId) onJoinRoom?.(roomId);
                          }}
                          sx={{
                            color: '#fff',
                            bgcolor: 'success.main',
                            borderRadius: 1,
                            width: 30,
                            height: 30,
                            boxShadow: `0 3px 10px ${alpha(theme.palette.success.main, 0.35)}`,
                            '&:hover': { bgcolor: 'success.dark' },
                          }}
                        >
                          <PhoneCall size={14} />
                        </IconButton>
                      </Tooltip>
                    )}

                    {tab === 'following' && (
                      <ButtonUnfollowIcon
                        targetUserId={item.accountDetails.userId}
                        onSuccess={(e) => handleUnfollowClick(e, item)}
                        sx={{
                          height: 30,
                          borderRadius: 1,
                          px: 1.25,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'none',
                          minWidth: 'auto',
                          border: '1px solid',
                          borderColor: alpha(theme.palette.error.main, 0.25),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.error.main, isDark ? 0.14 : 0.08),
                          },
                        }}
                      />
                    )}

                    {canChat ? (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          openChat(item);
                        }}
                        sx={{
                          color: 'primary.main',
                          bgcolor: alpha(theme.palette.primary.main, isDark ? 0.14 : 0.08),
                          borderRadius: 1,
                          width: 30,
                          height: 30,
                          border: '1px solid',
                          borderColor: alpha(theme.palette.primary.main, 0.25),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, isDark ? 0.14 : 0.08),
                          },
                        }}
                        title={`Message ${person.name}`}
                      >
                        <MessageCircle size={15} />
                      </IconButton>
                    ) : (
                      tab !== 'following' && (
                        <Tooltip title="Mutual follow required to chat" arrow>
                          <Box
                            sx={{
                              color: isDark ? 'text.disabled' : '#94a3b8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 30, // Matches button sizes
                              height: 30, // Matches button sizes
                            }}
                          >
                            <Lock size={14} />
                          </Box>
                        </Tooltip>
                      )
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>

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
          <Typography
            sx={{ fontSize: 10.5, color: isDark ? 'text.secondary' : '#64748b', lineHeight: 1.4 }}
          >
            Direct chat is reserved for mutual friends. Follow each other back to connect.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(SocialChatDirectory);

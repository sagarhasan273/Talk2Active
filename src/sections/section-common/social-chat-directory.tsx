import {
  Lock,
  MessageCircle,
  PhoneCall,
  UserMinus,
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import {
  alpha,
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

import type { AllRelationsType, SocialChatTabKey } from '@/types/type-social';

import { useSocialChat } from '@/core/contexts/context-social-chat';
import { getActiveRoomId, getInitials, isOnline } from '@/utils/social-chat-helper';

interface SocialChatDirectoryProps {
  friends?: AllRelationsType[];
  followers?: AllRelationsType[];
  following?: AllRelationsType[];
  isLoading?: boolean;
  onClose?: () => void;
  onUnfollow?: (targetUserId: string, person: AllRelationsType) => Promise<void> | void;
  onJoinRoom?: (roomId: string, person: AllRelationsType) => void;
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

  const {
    tab,
    setTab,
    openChat,
    unreadCounts,
    unreadFriendsCount,
    syncFriendsUnreadState,
  } = useSocialChat();

  const [unfollowedIds, setUnfollowedIds] = useState<Set<string>>(new Set());
  const [loadingUnfollowId, setLoadingUnfollowId] = useState<string | null>(null);

  useEffect(() => {
    if (friends.length > 0) {
      syncFriendsUnreadState(friends);
    }
  }, [friends, syncFriendsUnreadState]);

  const friendIds = useMemo(
    () => new Set(friends.map((f) => f.accountDetails.userId)),
    [friends]
  );

  const visibleFollowing = useMemo(
    () => following.filter((item) => !unfollowedIds.has(item.accountDetails.userId)),
    [following, unfollowedIds]
  );

  const dataByTab: Record<SocialChatTabKey, AllRelationsType[]> = {
    friends,
    followers,
    following: visibleFollowing,
  };

  const handleUnfollowClick = async (e: React.MouseEvent, item: AllRelationsType) => {
    e.stopPropagation();
    const targetId = item.accountDetails.userId;
    if (!targetId) return;

    try {
      setLoadingUnfollowId(targetId);
      await onUnfollow?.(targetId, item);
      setUnfollowedIds((prev) => new Set(prev).add(targetId));
    } catch (err) {
      console.error('Failed to unfollow user:', err);
    } finally {
      setLoadingUnfollowId(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Directory Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em' }}>
            Social Directory
          </Typography>

          {unreadFriendsCount > 0 && (
            <Box
              sx={{
                px: 0.85,
                py: 0.15,
                borderRadius: 999,
                fontSize: 10.5,
                fontWeight: 800,
                bgcolor: alpha(theme.palette.error.main, 0.12),
                color: 'error.main',
              }}
            >
              {unreadFriendsCount} {unreadFriendsCount === 1 ? 'friend' : 'friends'} unread
            </Box>
          )}
        </Stack>

        {onClose && (
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              borderRadius: 1.25,
              '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08), color: 'error.main' },
            }}
          >
            <X size={16} />
          </IconButton>
        )}
      </Box>

      {/* Navigation Tabs Pill Style */}
      <Box
        sx={{
          display: 'flex',
          p: 0.75,
          gap: 0.5,
          bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        {(['friends', 'followers', 'following'] as SocialChatTabKey[]).map((key) => {
          const count = dataByTab[key]?.length || 0;
          const active = tab === key;
          const showUnreadBadge = key === 'friends' && unreadFriendsCount > 0;

          return (
            <Box
              key={key}
              onClick={() => setTab(key)}
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                py: 0.75,
                borderRadius: 1.5,
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                bgcolor: active ? 'background.paper' : 'transparent',
                color: active ? 'primary.main' : 'text.secondary',
                boxShadow: active ? theme.shadows[1] : 'none',
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
                  borderRadius: 1,
                  fontSize: 10,
                  fontWeight: 800,
                  bgcolor: showUnreadBadge
                    ? 'error.main'
                    : active
                      ? alpha(theme.palette.primary.main, 0.12)
                      : alpha(theme.palette.text.secondary, 0.08),
                  color: showUnreadBadge ? '#fff' : 'inherit',
                }}
              >
                {showUnreadBadge ? unreadFriendsCount : count}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Directory List */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 1 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : dataByTab[tab].length === 0 ? (
          <Typography
            variant="caption"
            sx={{ display: 'block', textAlign: 'center', color: 'text.secondary', mt: 4 }}
          >
            No {tab} found.
          </Typography>
        ) : (
          <Stack spacing={0.5}>
            {dataByTab[tab]?.map((item) => {
              const person = item.accountDetails;
              const canChat = friendIds.has(person.userId);
              const unreadCount = unreadCounts[person.userId] || 0;
              const activeRoomId = getActiveRoomId(item);
              const online = isOnline(person.lastActive);
              const latestText = item.latestMessage?.text;

              return (
                <Box
                  key={person.userId}
                  onClick={() => canChat && openChat(item)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    px: 1.25,
                    py: 0.9,
                    borderRadius: 2,
                    cursor: canChat ? 'pointer' : 'default',
                    transition: 'background-color 0.15s ease, transform 0.12s ease',
                    '&:hover': canChat
                      ? {
                        bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.035),
                        transform: 'translateX(2px)',
                      }
                      : undefined,
                  }}
                >
                  {/* Avatar + Unread Badge + Online Dot */}
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
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          color: 'primary.main',
                        }}
                      >
                        {getInitials(person.name)}
                      </Avatar>
                    </Badge>
                    {(online || activeRoomId) && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: '#10B981',
                          border: `2px solid ${theme.palette.background.paper}`,
                        }}
                      />
                    )}
                  </Box>

                  {/* Name & Latest Message / Bio */}
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: 12.5,
                        fontWeight: unreadCount > 0 ? 800 : 700,
                        lineHeight: 1.2,
                      }}
                      noWrap
                    >
                      {person.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: activeRoomId
                          ? 'success.main'
                          : unreadCount > 0
                            ? 'text.primary'
                            : 'text.secondary',
                        fontWeight: activeRoomId || unreadCount > 0 ? 700 : 400,
                        mt: 0.2,
                      }}
                      noWrap
                    >
                      {activeRoomId
                        ? '🎙️ In a voice room'
                        : unreadCount > 1
                          ? `${unreadCount} unread messages`
                          : latestText || person.bio || `@${person.username}`}
                    </Typography>
                  </Box>

                  {/* Right Action Buttons */}
                  <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
                    {/* 1. Call / Join Room Button if User is in a Room */}
                    {activeRoomId && (
                      <Tooltip title={`Join ${person.name}'s room`}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onJoinRoom?.(activeRoomId, item);
                          }}
                          sx={{
                            color: '#fff',
                            bgcolor: 'success.main',
                            borderRadius: 1.5,
                            width: 30,
                            height: 30,
                            boxShadow: `0 3px 10px ${alpha(theme.palette.success.main, 0.35)}`,
                            '@keyframes callPulse': {
                              '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.success.main, 0.5)}` },
                              '70%': { boxShadow: `0 0 0 6px ${alpha(theme.palette.success.main, 0)}` },
                              '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.success.main, 0)}` },
                            },
                            animation: 'callPulse 2s infinite',
                            '&:hover': { bgcolor: 'success.dark' },
                          }}
                        >
                          <PhoneCall size={14} />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* 2. Following Tab: Unfollow Button */}
                    {tab === 'following' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={loadingUnfollowId === person.userId}
                        startIcon={<UserMinus size={12} />}
                        onClick={(e) => handleUnfollowClick(e, item)}
                        sx={{
                          borderRadius: 1.5,
                          px: 1,
                          py: 0.35,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'none',
                          minWidth: 'auto',
                        }}
                      >
                        Unfollow
                      </Button>
                    )}

                    {/* 3. Chat Button (or Mutual Lock) */}
                    {canChat ? (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          openChat(item);
                        }}
                        sx={{
                          color: 'primary.main',
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          borderRadius: 1.25,
                          width: 30,
                          height: 30,
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.18) },
                        }}
                        title={`Message ${person.name}`}
                      >
                        <MessageCircle size={15} />
                      </IconButton>
                    ) : (
                      tab !== 'following' && (
                        <Tooltip title="Mutual follow required to chat">
                          <Box
                            sx={{
                              color: 'text.disabled',
                              display: 'flex',
                              p: 0.5,
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
            borderColor: 'divider',
            bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontSize: 10.5, color: 'text.secondary', lineHeight: 1.4 }}>
            Direct chat is reserved for mutual friends. Follow each other back to connect.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(SocialChatDirectory);

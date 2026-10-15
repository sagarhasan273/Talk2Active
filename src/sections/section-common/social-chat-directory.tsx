// src/sections/section-common/social-chat-directory.tsx

import {
  Lock,
  MessageCircle,
  Mic,
  PhoneCall,
  UserMinus,
  X
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

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

import { useSocialChat } from '@/core/contexts/context-social-chat';
import type { AllRelationsType, SocialChatTabKey } from '@/types/type-social';
import { fDateTime } from '@/utils/format-time';
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

  const {
    tab,
    setTab,
    openChat,
    unreadCounts,
    unreadFriendsCount,
    onlineStatusMap,
  } = useSocialChat();

  const [unfollowedIds, setUnfollowedIds] = useState<Set<string>>(new Set());
  const [loadingUnfollowId, setLoadingUnfollowId] = useState<string | null>(null);

  const friendIds = useMemo(
    () => new Set(friends.map((f) => f.accountDetails.userId)),
    [friends]
  );

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
    const list = rawDataByTab[tab] || [];
    return [...list].sort((a, b) => {
      const timeA = new Date(a.latestMessage?.createdAt || a.accountDetails?.lastActive || 0).getTime();
      const timeB = new Date(b.latestMessage?.createdAt || b.accountDetails?.lastActive || 0).getTime();
      return timeB - timeA;
    });
  }, [rawDataByTab, tab]);

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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
          bgcolor: isDark ? 'transparent' : '#f8fafc',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: '-0.01em',
              color: isDark ? 'text.primary' : '#0f172a',
            }}
          >
            Social Directory
          </Typography>

          {unreadFriendsCount > 0 && (
            <Box
              sx={{
                px: 0.85,
                py: 0.15,
                borderRadius: 1,
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
              borderRadius: 1,
              bgcolor: isDark ? alpha('#fff', 0.04) : '#ffffff',
              border: '1px solid',
              borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
              color: 'text.secondary',
              '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08), color: 'error.main' },
            }}
          >
            <X size={16} />
          </IconButton>
        )}
      </Box>

      {/* Navigation Tabs */}
      <Box
        sx={{
          display: 'flex',
          p: 0.75,
          gap: 0.5,
          bgcolor: isDark ? alpha('#fff', 0.02) : '#f8fafc',
          borderBottom: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
          flexShrink: 0,
        }}
      >
        {(['friends', 'followers', 'following'] as SocialChatTabKey[]).map((key) => {
          const count = rawDataByTab[key]?.length || 0;
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
                borderRadius: 1,
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                bgcolor: active
                  ? isDark
                    ? alpha(theme.palette.primary.main, 0.16)
                    : alpha(theme.palette.primary.main, 0.1)
                  : 'transparent',
                color: active ? 'primary.main' : isDark ? 'text.secondary' : '#64748b',
                border: '1px solid',
                borderColor: active
                  ? alpha(theme.palette.primary.main, 0.3)
                  : 'transparent',
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
            No {tab} found.
          </Typography>
        ) : (
          <Stack spacing={0.5}>
            {dataByTab.map((item) => {
              const person = item.accountDetails;
              const canChat = friendIds.has(person.userId);
              const unreadCount = unreadCounts[person.userId] || 0;

              const roomId = onlineStatusMap[person.userId] || false;
              const isInRoom = Boolean(roomId);

              const latestText = item.latestMessage?.text || `Last seen: ${fDateTime(person.lastActive)}`;

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
                            '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)' },
                            '70%': { transform: 'scale(1)', boxShadow: '0 0 0 6px rgba(16, 185, 129, 0)' },
                            '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
                          },
                          animation: 'voicePulse 2s infinite ease-in-out',
                        }}
                      >
                        <Mic size={9} strokeWidth={3} />
                      </Box>
                    )}
                  </Box>

                  {/* Name & Latest Message / Bio */}
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: 12.5,
                        fontWeight: unreadCount > 0 ? 800 : 700,
                        lineHeight: 1.2,
                        color: isDark ? 'text.primary' : '#0f172a',
                      }}
                      noWrap
                    >
                      {person.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: 11,
                        color: isInRoom && tab !== 'friends'
                          ? 'success.main'
                          : unreadCount > 0
                            ? isDark ? 'text.primary' : '#0f172a'
                            : isDark ? 'text.secondary' : '#64748b',
                        fontWeight: isInRoom || unreadCount > 0 ? 700 : 500,
                        mt: 0.2,
                      }}
                      noWrap
                    >
                      {tab === 'friends' ? unreadCount > 0
                        ? `${unreadCount} unread messages`
                        : latestText : isInRoom
                        ? '🎙️ In a voice room'
                        : `Last seen: ${fDateTime(person.lastActive)}`}
                    </Typography>
                  </Box>

                  {/* Right Action Buttons */}
                  <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
                    {isInRoom && (
                      <Tooltip title={`Join ${person.name}'s room`} arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (roomId)
                              onJoinRoom?.(roomId);
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
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={loadingUnfollowId === person.userId}
                        startIcon={<UserMinus size={12} />}
                        onClick={(e) => handleUnfollowClick(e, item)}
                        sx={{
                          borderRadius: 1,
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
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, isDark ? 0.14 : 0.08) },
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

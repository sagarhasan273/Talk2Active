// src/sections/section-common/social-chat-conversation.tsx

import {
  ArrowDown,
  ArrowLeft,
  PhoneCall,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  alpha,
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  Fade,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';


import { useSocialChat } from '@/core/contexts/context-social-chat';
import { getInitials, isOnline } from '@/utils/social-chat-helper';
import { SocialMessageBubble } from './social-chat-message-bubble';

interface SocialChatConversationProps {
  onClose?: () => void;
  onJoinRoom?: (roomId: string) => void;
}

export const SocialChatConversation: React.FC<SocialChatConversationProps> = ({
  onClose,
  onJoinRoom,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const {
    activeFriend,
    closeActiveChat,
    messages,
    messageMap,
    fetchingHistory,
    replyingTo,
    setReplyingTo,
    activeChatUnreadCount,
    setIsAtBottom,
    markFriendAsRead,
    sendMessage,
    editMessage,
    reactMessage,
    onlineStatusMap,
  } = useSocialChat();

  const [draft, setDraft] = useState('');

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const localIsAtBottomRef = useRef<boolean>(true);

  const friendDetails = activeFriend?.accountDetails;
  const roomId = friendDetails?.userId ? onlineStatusMap[friendDetails.userId] : null;
  const isInRoom = Boolean(roomId);

  useEffect(() => {
    const sentinel = messagesEndRef.current;
    const container = scrollContainerRef.current;
    if (!sentinel || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        localIsAtBottomRef.current = entry.isIntersecting;
        setIsAtBottom(entry.isIntersecting);
      },
      {
        root: container,
        threshold: 0.1,
        rootMargin: '0px 0px 60px 0px',
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [setIsAtBottom]);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'smooth', shouldMarkRead = false) => {
      messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
      if (shouldMarkRead && friendDetails?.userId) {
        markFriendAsRead(friendDetails.userId);
      }
    },
    [friendDetails?.userId, markFriendAsRead]
  );

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    if (localIsAtBottomRef.current || lastMsg?.isSelf) {
      requestAnimationFrame(() => {
        scrollToBottom('smooth', false);
      });
    }
  }, [messages.length, scrollToBottom]);

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft('');
  };

  if (!activeFriend || !friendDetails) return null;

  const isSocketOnline = onlineStatusMap[friendDetails.userId];
  const online = isSocketOnline !== undefined ? isSocketOnline : isOnline(friendDetails.lastActive);

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
      {/* Active Chat Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 1.25,
          borderBottom: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
          backdropFilter: 'blur(12px)',
          bgcolor: isDark ? alpha('#181c26', 0.9) : alpha('#f8fafc', 0.95),
          flexShrink: 0,
          zIndex: 15,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <IconButton
            size="small"
            onClick={closeActiveChat}
            sx={{
              color: 'text.secondary',
              borderRadius: 1,
              bgcolor: isDark ? alpha('#fff', 0.04) : '#ffffff',
              border: '1px solid',
              borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
            }}
          >
            <ArrowLeft size={16} />
          </IconButton>

          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            sx={{
              '& .MuiBadge-badge': {
                bgcolor: online ? '#10B981' : 'text.disabled',
                border: `2px solid ${isDark ? '#181c26' : '#ffffff'}`,
                width: 10,
                height: 10,
                borderRadius: '50%',
              },
            }}
          >
            <Avatar
              src={friendDetails.profilePhoto}
              sx={{
                width: 34,
                height: 34,
                fontSize: 12,
                fontWeight: 800,
                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.1),
                color: 'primary.main',
                border: '1px solid',
                borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
              }}
            >
              {getInitials(friendDetails.name)}
            </Avatar>
          </Badge>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 800,
                lineHeight: 1.2,
                color: isDark ? 'text.primary' : '#0f172a',
              }}
              noWrap
            >
              {friendDetails.name}
            </Typography>
            <Typography
              sx={{
                fontSize: 10.5,
                fontWeight: 700,
                color: isInRoom ? 'success.main' : online ? '#10B981' : 'text.secondary',
              }}
              noWrap
            >
              {isInRoom ? 'In a voice room' : online ? 'Active now' : 'Offline'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {isInRoom && (
            <Tooltip title="Join active voice room" arrow>
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<PhoneCall size={13} />}
                onClick={() => { if (roomId) onJoinRoom?.(roomId) }}
                sx={{
                  borderRadius: 1,
                  px: 1.25,
                  py: 0.35,
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'none',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.35)}`,
                }}
              >
                Join
              </Button>
            </Tooltip>
          )}

          {onClose && (
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                color: 'text.secondary',
                borderRadius: 1,
                bgcolor: isDark ? alpha('#fff', 0.04) : '#ffffff',
                border: '1px solid',
                borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.08),
                  color: 'error.main',
                },
              }}
            >
              <X size={16} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Chat Messages Feed */}
      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          ref={scrollContainerRef}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            px: 1.75,
            py: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.25,
            bgcolor: isDark ? '#181c26' : '#f8fafc',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': { width: 5 },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: alpha(theme.palette.divider, 0.4),
              borderRadius: 1,
            },
          }}
        >
          {fetchingHistory && messages.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 'auto' }}>
              <CircularProgress size={24} />
            </Box>
          ) : messages.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                my: 'auto',
                p: 3,
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: 'primary.main',
                  mb: 1,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.25),
                }}
              >
                <Sparkles size={20} />
              </Box>
              <Typography sx={{ fontSize: 13, fontWeight: 800, mb: 0.25, color: isDark ? 'text.primary' : '#0f172a' }}>
                No messages yet
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? 'text.secondary' : '#64748b', maxWidth: 200 }}>
                Say hello to {friendDetails.name?.split(' ')[0] ?? 'there'} and start the conversation!
              </Typography>
            </Box>
          ) : (
            messages.map((m) => (
              <SocialMessageBubble
                key={m.id}
                message={m}
                friendDetails={friendDetails}
                replyTo={m.replyToId ? messageMap[m.replyToId] : undefined}
                onReply={setReplyingTo}
                onEdit={editMessage}
                onReact={reactMessage}
              />
            ))
          )}
          <div ref={messagesEndRef} style={{ height: 1, width: '100%', flexShrink: 0 }} />
        </Box>

        {/* Floating Unread Pill */}
        <Fade in={activeChatUnreadCount > 0} unmountOnExit>
          <Button
            variant="contained"
            size="small"
            onClick={() => scrollToBottom('smooth', true)}
            endIcon={<ArrowDown size={13} />}
            sx={{
              position: 'absolute',
              bottom: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 20,
              borderRadius: 1,
              px: 1.5,
              py: 0.4,
              fontSize: 11.5,
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: theme.shadows[6],
            }}
          >
            {activeChatUnreadCount === 1
              ? '1 new message'
              : `${activeChatUnreadCount} new messages`}
          </Button>
        </Fade>
      </Box>

      {/* Replying Context Bar */}
      {replyingTo && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.5,
            py: 0.75,
            bgcolor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.08),
            borderLeft: `3px solid ${theme.palette.primary.main}`,
            flexShrink: 0,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: 'primary.main' }}>
              Replying to {replyingTo.authorName || friendDetails.name}
            </Typography>
            <Typography noWrap sx={{ fontSize: 11.5, color: isDark ? 'text.secondary' : '#475569', maxWidth: 240 }}>
              {replyingTo.text}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setReplyingTo(null)} sx={{ color: 'text.secondary' }}>
            <X size={13} />
          </IconButton>
        </Box>
      )}

      {/* Input Dock */}
      <Box
        sx={{
          p: 1.25,
          borderTop: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
          bgcolor: isDark ? '#181c26' : '#ffffff',
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            bgcolor: isDark ? alpha('#fff', 0.035) : '#f8fafc',
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
            borderRadius: 1,
            px: 1.25,
            py: 0.5,
            transition: 'border-color 0.18s ease',
            '&:focus-within': {
              borderColor: 'primary.main',
            },
          }}
        >
          <Box
            component="input"
            value={draft}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder={
              replyingTo ? `Reply to ${replyingTo.authorName || friendDetails.name}...` : 'Write a message...'
            }
            sx={{
              flex: 1,
              minWidth: 0,
              bgcolor: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 12.5,
              color: isDark ? 'text.primary' : '#0f172a',
              '&::placeholder': { color: isDark ? 'text.disabled' : '#94a3b8' },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!draft.trim()}
            size="small"
            sx={{
              bgcolor: draft.trim() ? 'primary.main' : 'transparent',
              color: draft.trim() ? '#fff' : isDark ? 'text.disabled' : '#cbd5e1',
              borderRadius: 1,
              width: 30,
              height: 30,
              transition: 'all 0.18s ease',
              '&:hover': {
                bgcolor: draft.trim() ? 'primary.dark' : 'transparent',
                transform: draft.trim() ? 'translateY(-1px)' : 'none',
              },
            }}
          >
            <Send size={13} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(SocialChatConversation);

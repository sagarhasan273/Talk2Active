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

import type { AllRelationsType } from '@/types/type-social';

import { useSocialChat } from '@/core/contexts/context-social-chat';
import { getActiveRoomId, getInitials, isOnline } from '@/utils/social-chat-helper';
import { SocialMessageBubble } from './social-chat-message-bubble';

interface SocialChatConversationProps {
  onClose?: () => void;
  onJoinRoom?: (roomId: string, person: AllRelationsType) => void;
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
  } = useSocialChat();

  const [draft, setDraft] = useState('');

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const localIsAtBottomRef = useRef<boolean>(true);

  const friendDetails = activeFriend?.accountDetails;
  const activeRoomId = getActiveRoomId(activeFriend);

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

  // Auto-scroll on new messages without firing redundant markFriendAsRead API calls
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    if (localIsAtBottomRef.current || lastMsg?.isSelf) {
      requestAnimationFrame(() => {
        scrollToBottom('smooth', false);
      });
    }
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    if (localIsAtBottomRef.current || lastMsg?.isSelf) {
      requestAnimationFrame(() => {
        scrollToBottom('smooth');
      });
    }
  }, [messages.length, scrollToBottom]);

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft('');
  };

  if (!activeFriend || !friendDetails) return null;

  const online = isOnline(friendDetails.lastActive);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Active Chat Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 1.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(12px)',
          bgcolor: isDark ? alpha(theme.palette.background.paper, 0.85) : alpha('#fff', 0.9),
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
              borderRadius: 1.25,
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
                border: `2px solid ${theme.palette.background.paper}`,
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
                bgcolor: alpha(theme.palette.primary.main, 0.15),
                color: 'primary.main',
              }}
            >
              {getInitials(friendDetails.name)}
            </Avatar>
          </Badge>

          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, lineHeight: 1.2 }} noWrap>
              {friendDetails.name}
            </Typography>
            <Typography
              sx={{
                fontSize: 10.5,
                fontWeight: 600,
                color: activeRoomId ? 'success.main' : online ? '#10B981' : 'text.secondary',
              }}
              noWrap
            >
              {activeRoomId ? 'In a voice room' : online ? 'Active now' : 'Offline'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {activeRoomId && (
            <Tooltip title="Join active voice room">
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<PhoneCall size={13} />}
                onClick={() => onJoinRoom?.(activeRoomId, activeFriend)}
                sx={{
                  borderRadius: 999,
                  px: 1.25,
                  py: 0.35,
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'none',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.35)}`,
                }}
              >
                Join Call
              </Button>
            </Tooltip>
          )}

          {onClose && (
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                color: 'text.secondary',
                borderRadius: 1.25,
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
            bgcolor: isDark ? alpha('#000', 0.15) : alpha('#F8FAFC', 0.6),
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
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  mb: 1,
                }}
              >
                <Sparkles size={20} />
              </Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.25 }}>
                No messages yet
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', maxWidth: 200 }}>
                Say hello to {friendDetails.name?.split(' ')[0] ?? 'there'} and start the
                conversation!
              </Typography>
            </Box>
          ) : (
            messages.map((m) => (
              <SocialMessageBubble
                key={m.id}
                message={m}
                replyTo={m.replyToId ? messageMap[m.replyToId] : undefined}
                onReply={setReplyingTo}
                onEdit={editMessage}
                onReact={reactMessage}
              />
            ))
          )}
          <div ref={messagesEndRef} style={{ height: 1, width: '100%', flexShrink: 0 }} />
        </Box>

        {/* Floating Unread Pill when Scrolled Up */}
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
              borderRadius: 999,
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
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            borderLeft: `3px solid ${theme.palette.primary.main}`,
            flexShrink: 0,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: 'primary.main' }}>
              Replying to {replyingTo.authorName}
            </Typography>
            <Typography noWrap sx={{ fontSize: 11.5, color: 'text.secondary', maxWidth: 240 }}>
              {replyingTo.text}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setReplyingTo(null)}>
            <X size={13} />
          </IconButton>
        </Box>
      )}

      {/* Input Dock */}
      <Box
        sx={{
          p: 1.25,
          borderTop: replyingTo ? 'none' : '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.035),
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2.5,
            px: 1.25,
            py: 0.5,
            transition: 'border-color 0.18s ease',
            '&:focus-within': {
              borderColor: 'primary.main',
              bgcolor: 'transparent',
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
              replyingTo ? `Reply to ${replyingTo.authorName}...` : 'Write a message...'
            }
            sx={{
              flex: 1,
              minWidth: 0,
              bgcolor: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 12.5,
              color: 'text.primary',
              '&::placeholder': { color: 'text.disabled' },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!draft.trim()}
            size="small"
            sx={{
              bgcolor: draft.trim() ? 'primary.main' : 'transparent',
              color: draft.trim() ? '#fff' : 'text.disabled',
              width: 28,
              height: 28,
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

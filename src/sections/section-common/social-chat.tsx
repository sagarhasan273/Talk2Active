import type { Theme } from '@mui/material/styles';

import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Info,
  Lock,
  MessageCircle,
  Pencil,
  Reply,
  Send,
  Smile,
  Sparkles,
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';

import {
  useGetHistoryQuery,
  useReadMessagesMutation,
  useSaveMessageMutation,
  useToggleReactionMutation,
  useUpdateMessageMutation,
} from '@/core/apis';
import type { AllRelationsType } from '@/types/type-social';
import {
  alpha,
  Avatar,
  Badge,
  Box,
  CircularProgress,
  IconButton,
  Popover,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type SystemType = 'info' | 'success' | 'warning' | 'error';
type TabKey = 'friends' | 'followers' | 'following';

export interface Reaction {
  emoji: string;
  count: number;
  reactedBySelf: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  isSelf?: boolean;
  isSystem?: boolean;
  systemType?: SystemType;
  authorId?: string;
  authorName?: string;
  editedAt?: number;
  reactions?: Reaction[];
  replyToId?: string;
  createdAt?: string;
}

export interface SocialChatProps {
  socket?: Socket | null;
  friends?: AllRelationsType[];
  followers?: AllRelationsType[];
  following?: AllRelationsType[];
  currentUserId: string;
  currentUserName?: string;
  isLoading?: boolean;
  onClose?: () => void;
}

const QUICK_REACTIONS: string[] = ['👍', '🎉', '❤️', '😂', '🔥', '👀'];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const getInitials = (name?: string): string => {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const isOnline = (lastActive?: Date | string): boolean => {
  if (!lastActive) return false;
  return Date.now() - new Date(lastActive).getTime() < 5 * 60 * 1000;
};

const formatMessageTime = (isoString?: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const systemColorMap = (t: Theme): Record<SystemType, string> => ({
  info: t.palette.info.main,
  success: '#10B981',
  warning: t.palette.warning.main,
  error: t.palette.error.main,
});

/* ------------------------------------------------------------------ */
/* Message Bubble Subcomponent                                        */
/* ------------------------------------------------------------------ */

const MessageBubble = ({
  message,
  replyTo,
  onReply,
  onEdit,
  onReact,
}: {
  message: ChatMessage;
  replyTo?: ChatMessage;
  onReply?: (message: ChatMessage) => void;
  onEdit?: (id: string, text: string) => void;
  onReact?: (id: string, emoji: string) => void;
}) => {
  const t = useTheme();
  const isDark = t.palette.mode === 'dark';
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.text);
  const [reactAnchor, setReactAnchor] = useState<HTMLElement | null>(null);

  if (message.isSystem) {
    const sysColor = systemColorMap(t)[message.systemType || 'info'];
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', my: 0.75 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 0.5,
            borderRadius: 3,
            bgcolor: alpha(sysColor, 0.08),
            border: `1px solid ${alpha(sysColor, 0.22)}`,
            color: sysColor,
            maxWidth: '85%',
          }}
        >
          {message.systemType === 'success' && <CheckCircle size={13} />}
          {message.systemType === 'warning' && <AlertTriangle size={13} />}
          {message.systemType === 'error' && <AlertCircle size={13} />}
          {(!message.systemType || message.systemType === 'info') && <Info size={13} />}
          <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{message.text}</Typography>
        </Box>
      </Box>
    );
  }

  const handleSave = () => {
    if (draft.trim() && draft !== message.text) {
      onEdit?.(message.id, draft.trim());
    }
    setEditing(false);
  };

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: message.isSelf ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        alignSelf: message.isSelf ? 'flex-end' : 'flex-start',
      }}
    >
      {!message.isSelf && (
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 700,
            color: 'text.secondary',
            ml: 1,
            mb: 0.25,
            letterSpacing: '0.01em',
          }}
        >
          {message.authorName}
        </Typography>
      )}

      <Box sx={{ position: 'relative', maxWidth: '100%' }}>
        {/* Floating Quick Actions on Hover */}
        {hovered && !editing && (
          <Box
            sx={{
              position: 'absolute',
              top: -12,
              ...(message.isSelf ? { left: -10 } : { right: -10 }),
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 0.25,
              px: 0.5,
              py: 0.25,
              bgcolor: isDark ? alpha('#1E293B', 0.95) : '#ffffff',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${t.palette.divider}`,
              borderRadius: 2,
              boxShadow: t.shadows[4],
              zIndex: 10,
            }}
          >
            {!message.isSelf && (
              <IconButton
                size="small"
                onClick={(e) => setReactAnchor(e.currentTarget)}
                sx={{ p: 0.4, color: 'text.secondary', '&:hover': { color: 'warning.main' } }}
                title="React"
              >
                <Smile size={13} />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={() => onReply?.(message)}
              sx={{ p: 0.4, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
              title="Reply"
            >
              <Reply size={13} />
            </IconButton>
            {message.isSelf && (
              <IconButton
                size="small"
                onClick={() => setEditing(true)}
                sx={{ p: 0.4, color: 'text.secondary', '&:hover': { color: 'info.main' } }}
                title="Edit"
              >
                <Pencil size={13} />
              </IconButton>
            )}
          </Box>
        )}

        {/* Message Bubble Shell */}
        <Box
          sx={{
            position: 'relative',
            px: 1.5,
            py: 1,
            borderRadius: 2,
            borderTopLeftRadius: !message.isSelf ? 0.5 : 2,
            borderTopRightRadius: message.isSelf ? 0.5 : 2,
            fontSize: 12.5,
            lineHeight: 1.45,
            wordBreak: 'break-word',
            ...(message.isSelf
              ? {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                boxShadow: `0 3px 12px ${alpha(t.palette.primary.main, 0.28)}`,
              }
              : {
                bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.035),
                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06)}`,
                color: 'text.primary',
              }),
          }}
        >
          {/* Reply Preview */}
          {replyTo && (
            <Box
              sx={{
                mb: 0.75,
                pl: 1,
                py: 0.25,
                borderLeft: `2.5px solid ${message.isSelf ? 'rgba(255,255,255,0.7)' : t.palette.primary.main
                  }`,
                bgcolor: message.isSelf
                  ? 'rgba(0,0,0,0.14)'
                  : alpha(t.palette.primary.main, 0.07),
                borderRadius: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: message.isSelf ? '#fff' : 'primary.main',
                }}
              >
                {replyTo.authorName}
              </Typography>
              <Typography
                noWrap
                sx={{
                  fontSize: 11,
                  maxWidth: 220,
                  color: message.isSelf ? 'rgba(255,255,255,0.85)' : 'text.secondary',
                }}
              >
                {replyTo.text}
              </Typography>
            </Box>
          )}

          {/* Inline Edit Input or Text */}
          {editing ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, minWidth: 170 }}>
              <Box
                component="input"
                autoFocus
                value={draft}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') setEditing(false);
                }}
                sx={{
                  bgcolor: 'rgba(0,0,0,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                  fontSize: 12.5,
                  color: '#fff',
                  outline: 'none',
                }}
              />
              <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                <Typography
                  onClick={() => setEditing(false)}
                  sx={{ fontSize: 11, cursor: 'pointer', opacity: 0.8, color: '#fff' }}
                >
                  Cancel
                </Typography>
                <Typography
                  onClick={handleSave}
                  sx={{ fontSize: 11, fontWeight: 800, cursor: 'pointer', color: '#fff' }}
                >
                  Save
                </Typography>
              </Stack>
            </Box>
          ) : (
            <Box sx={{ display: 'inline' }}>
              {message.text}
              {message.editedAt && (
                <Box component="span" sx={{ ml: 0.6, fontSize: 9.5, opacity: 0.65 }}>
                  (edited)
                </Box>
              )}
            </Box>
          )}

          {/* Time indicator */}
          {message.createdAt && (
            <Typography
              component="span"
              sx={{
                display: 'block',
                textAlign: 'right',
                fontSize: 9,
                fontWeight: 600,
                opacity: 0.65,
                mt: 0.35,
                color: 'inherit',
              }}
            >
              {formatMessageTime(message.createdAt)}
            </Typography>
          )}
        </Box>

        {/* Reactions Row */}
        {!!message.reactions?.length && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.4,
              mt: 0.4,
              justifyContent: message.isSelf ? 'flex-end' : 'flex-start',
            }}
          >
            {message.reactions.map((r) => (
              <Box
                key={r.emoji}
                component="button"
                onClick={() => onReact?.(message.id, r.emoji)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.35,
                  px: 0.65,
                  py: 0.15,
                  fontSize: 10.5,
                  borderRadius: 4,
                  cursor: 'pointer',
                  border: '1px solid',
                  bgcolor: r.reactedBySelf
                    ? alpha(t.palette.primary.main, 0.14)
                    : isDark
                      ? alpha('#fff', 0.05)
                      : alpha('#000', 0.04),
                  borderColor: r.reactedBySelf
                    ? alpha(t.palette.primary.main, 0.45)
                    : t.palette.divider,
                  color: r.reactedBySelf ? t.palette.primary.main : t.palette.text.secondary,
                  transition: 'transform 0.12s ease',
                  '&:hover': { transform: 'scale(1.08)' },
                }}
              >
                <span>{r.emoji}</span>
                <span style={{ fontWeight: 700 }}>{r.count}</span>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Quick Reaction Popover */}
      <Popover
        open={Boolean(reactAnchor)}
        anchorEl={reactAnchor}
        onClose={() => setReactAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: {
              border: `1px solid ${t.palette.divider}`,
              borderRadius: 3,
              boxShadow: t.shadows[8],
              p: 0.35,
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', gap: 0.3 }}>
          {QUICK_REACTIONS.map((emoji) => (
            <IconButton
              key={emoji}
              size="small"
              onClick={() => {
                onReact?.(message.id, emoji);
                setReactAnchor(null);
              }}
              sx={{
                fontSize: 16,
                p: 0.6,
                transition: 'transform 0.12s ease',
                '&:hover': { transform: 'scale(1.2)' },
              }}
            >
              {emoji}
            </IconButton>
          ))}
        </Box>
      </Popover>
    </Box>
  );
};

/* ------------------------------------------------------------------ */
/* Main SocialChat Component                                          */
/* ------------------------------------------------------------------ */

export const SocialChat = ({
  socket,
  friends = [],
  followers = [],
  following = [],
  currentUserId,
  currentUserName = 'You',
  isLoading = false,
  onClose,
}: SocialChatProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [tab, setTab] = useState<TabKey>('friends');
  const [activeFriend, setActiveFriend] = useState<AllRelationsType | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const friendId = activeFriend?.accountDetails?.userId || '';

  // RTK Query hooks
  const { data: historyResponse, isFetching: fetchingHistory } = useGetHistoryQuery(friendId, {
    skip: !friendId,
    refetchOnMountOrArgChange: true,
  });
  const [saveMessage] = useSaveMessageMutation();
  const [updateMessage] = useUpdateMessageMutation();
  const [toggleReaction] = useToggleReactionMutation();
  const [readMessages] = useReadMessagesMutation();

  const friendIds = useMemo(
    () => new Set(friends.map((f) => f.accountDetails.userId)),
    [friends]
  );

  const dataByTab: Record<TabKey, AllRelationsType[]> = {
    friends,
    followers,
    following,
  };

  const messageMap = useMemo(() => {
    const map: Record<string, ChatMessage> = {};
    messages.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load history into local state
  useEffect(() => {
    if (!activeFriend) {
      setMessages([]);
    } else if (!fetchingHistory && historyResponse?.data) {
      const fetched = historyResponse.data as ChatMessage[];
      setMessages((prev) => {
        if (prev.length === 0 || prev[0]?.id !== fetched[0]?.id) return fetched;
        return prev.length > fetched.length ? prev : fetched;
      });
    }
  }, [historyResponse, activeFriend, fetchingHistory]);

  /* ------------------------------------------------------------------ */
  /* Real-Time Socket.io Listeners                                      */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (incomingMsg: ChatMessage) => {
      const senderId = incomingMsg.authorId;
      if (!senderId) return;

      const isFromSelf = senderId === currentUserId;
      const isCurrentlyActive =
        activeFriend &&
        (senderId === activeFriend.accountDetails.userId ||
          (incomingMsg as any).recipientId === activeFriend.accountDetails.userId);

      if (isCurrentlyActive) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === incomingMsg.id)) return prev;
          return [...prev, { ...incomingMsg, isSelf: isFromSelf }];
        });

        if (!isFromSelf) {
          readMessages({ userId1: currentUserId, userId2: senderId }).catch(console.error);
        }
      } else if (!isFromSelf) {
        setUnreadCounts((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }
    };

    const handleMessageEdited = (editedMsg: ChatMessage) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === editedMsg.id
            ? { ...m, text: editedMsg.text, editedAt: editedMsg.editedAt }
            : m
        )
      );
    };

    const handleReactionToggled = (reactionData: { messageId: string; reactions: Reaction[] }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === reactionData.messageId ? { ...m, reactions: reactionData.reactions } : m
        )
      );
    };

    socket.on('receive_new_message', handleNewMessage);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_reaction', handleReactionToggled);

    return () => {
      socket.off('receive_new_message', handleNewMessage);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_reaction', handleReactionToggled);
    };
  }, [socket, activeFriend, currentUserId, readMessages]);

  /* ------------------------------------------------------------------ */
  /* Actions                                                            */
  /* ------------------------------------------------------------------ */

  const handleOpenChat = (item: AllRelationsType) => {
    setActiveFriend(item);
    const targetUserId = item.accountDetails.userId;

    if (unreadCounts[targetUserId]) {
      setUnreadCounts((prev) => {
        const next = { ...prev };
        delete next[targetUserId];
        return next;
      });
    }

    readMessages({ userId1: currentUserId, userId2: targetUserId }).catch(console.error);
  };

  const handleSend = async () => {
    if (!draft.trim() || !activeFriend) return;

    const clientGeneratedId = `msg_${Date.now()}`;
    const newMsg: ChatMessage = {
      id: clientGeneratedId,
      text: draft.trim(),
      isSelf: true,
      authorId: currentUserId,
      authorName: currentUserName,
      replyToId: replyingTo?.id,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setDraft('');
    setReplyingTo(null);

    saveMessage({
      userId: currentUserId,
      recipientId: friendId,
      text: newMsg.text,
      replyToId: newMsg.replyToId,
    }).catch((err) => console.error('Failed to save message:', err));
  };

  const handleEdit = (id: string, text: string) => {
    const editedAt = Date.now();
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, text, editedAt } : m))
    );

    updateMessage({ messageId: id, text }).catch((err) =>
      console.error('Failed to update message:', err)
    );
  };

  const handleReact = (id: string, emoji: string) => {
    let updatedReactions: Reaction[] = [];

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const current = m.reactions || [];
        const existing = current.find((r) => r.emoji === emoji);

        updatedReactions = existing
          ? current
            .map((r) =>
              r.emoji === emoji
                ? {
                  ...r,
                  count: r.count + (r.reactedBySelf ? -1 : 1),
                  reactedBySelf: !r.reactedBySelf,
                }
                : r
            )
            .filter((r) => r.count > 0)
          : [...current, { emoji, count: 1, reactedBySelf: true }];

        return { ...m, reactions: updatedReactions };
      })
    );

    toggleReaction({ messageId: id, emoji }).catch((err) =>
      console.error('Failed to toggle reaction:', err)
    );
  };

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
                onClick={() => setActiveFriend(null)}
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
                    bgcolor: isOnline(activeFriend.accountDetails.lastActive)
                      ? '#10B981'
                      : 'text.disabled',
                    border: `2px solid ${theme.palette.background.paper}`,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                  },
                }}
              >
                <Avatar
                  src={activeFriend.accountDetails.profilePhoto}
                  sx={{
                    width: 34,
                    height: 34,
                    fontSize: 12,
                    fontWeight: 800,
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                    color: 'primary.main',
                  }}
                >
                  {getInitials(activeFriend.accountDetails.name)}
                </Avatar>
              </Badge>

              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 800, lineHeight: 1.2 }} noWrap>
                  {activeFriend.accountDetails.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: isOnline(activeFriend.accountDetails.lastActive)
                      ? '#10B981'
                      : 'text.secondary',
                  }}
                >
                  {isOnline(activeFriend.accountDetails.lastActive) ? 'Active now' : 'Offline'}
                </Typography>
              </Box>
            </Box>

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
          </Box>

          {/* Chat Messages Feed */}
          <Box
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
                  Say hello to {activeFriend.accountDetails.name?.split(' ')[0] ?? 'there'} and start
                  the conversation!
                </Typography>
              </Box>
            ) : (
              messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  replyTo={m.replyToId ? messageMap[m.replyToId] : undefined}
                  onReply={setReplyingTo}
                  onEdit={handleEdit}
                  onReact={handleReact}
                />
              ))
            )}
            <div ref={messagesEndRef} />
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
                  replyingTo
                    ? `Reply to ${replyingTo.authorName}...`
                    : 'Write a message...'
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
      ) : (
        /* Contact Directory */
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
            </Stack>
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
            {(['friends', 'followers', 'following'] as TabKey[]).map((key) => {
              const count = dataByTab[key]?.length || 0;
              const active = tab === key;
              return (
                <Box
                  key={key}
                  onClick={() => setTab(key)}
                  sx={{
                    flex: 1,
                    textAlign: 'center',
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
                  {key}
                  <Box
                    component="span"
                    sx={{
                      ml: 0.5,
                      px: 0.5,
                      py: 0.1,
                      borderRadius: 1,
                      fontSize: 10,
                      fontWeight: 800,
                      bgcolor: active
                        ? alpha(theme.palette.primary.main, 0.12)
                        : alpha(theme.palette.text.secondary, 0.08),
                    }}
                  >
                    {count}
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

                  return (
                    <Box
                      key={person.userId}
                      onClick={() => canChat && handleOpenChat(item)}
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
                        {isOnline(person.lastActive) && (
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
                            color: unreadCount > 0 ? 'text.primary' : 'text.secondary',
                            fontWeight: unreadCount > 0 ? 600 : 400,
                            mt: 0.2,
                          }}
                          noWrap
                        >
                          {person.bio || `@${person.username}`}
                        </Typography>
                      </Box>

                      {canChat ? (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenChat(item);
                          }}
                          sx={{
                            color: 'primary.main',
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            borderRadius: 1.25,
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.18) },
                          }}
                          title={`Message ${person.name}`}
                        >
                          <MessageCircle size={15} />
                        </IconButton>
                      ) : (
                        <Tooltip title="Mutual follow required to chat">
                          <Box
                            sx={{
                              color: 'text.disabled',
                              display: 'flex',
                              p: 0.5,
                              flexShrink: 0,
                            }}
                          >
                            <Lock size={14} />
                          </Box>
                        </Tooltip>
                      )}
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
      )}
    </Box>
  );
};

export default SocialChat;

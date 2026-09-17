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
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

import {
  useGetHistoryQuery,
  useSaveMessageMutation,
  useToggleReactionMutation,
  useUpdateMessageMutation,
} from '@/core/apis';
import { AllRelationsType } from '@/types/type-social';
import {
  alpha,
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Popover,
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

const QUICK_REACTIONS: string[] = ['👍', '🎉', '❤️', '😂', '👀'];

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

const isOnline = (lastActive?: Date): boolean => {
  if (!lastActive) return false;
  return Date.now() - new Date(lastActive).getTime() < 5 * 60 * 1000;
};

const systemColorMap = (t: Theme): Record<SystemType, string> => ({
  info: t.palette.info.main,
  success: '#2E9E5B',
  warning: t.palette.warning.main,
  error: '#D64545',
});

/* ------------------------------------------------------------------ */
/* Message Bubble Component                                           */
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
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.text);
  const [reactAnchor, setReactAnchor] = useState<HTMLElement | null>(null);

  if (message.isSystem) {
    const sysColor = systemColorMap(t)[message.systemType || 'info'];
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', my: 0.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            bgcolor: alpha(sysColor, 0.08),
            border: `1px solid ${alpha(sysColor, 0.2)}`,
            color: sysColor,
            width: 'fit-content',
            minWidth: "35%",
            maxWidth: '85%',
          }}
        >
          {message.systemType === 'success' && <CheckCircle size={14} />}
          {message.systemType === 'warning' && <AlertTriangle size={14} />}
          {message.systemType === 'error' && <AlertCircle size={14} />}
          {(!message.systemType || message.systemType === 'info') && <Info size={14} />}
          <Typography sx={{ fontSize: 11.5, fontWeight: 500 }}>{message.text}</Typography>
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
        alignSelf: message.isSelf ? 'flex-end' : 'flex-start',
        minWidth: '35%',
        maxWidth: '82%',
      }}
    >
      {!message.isSelf && (
        <Typography
          sx={{ fontSize: 11, fontWeight: 600, color: 'text.primary', ml: 0.5, mb: 0.25 }}
        >
          {message.authorName}
        </Typography>
      )}

      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
        {hovered && !editing && (
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              ...(message.isSelf ? { left: 0 } : { right: 0 }),
              display: 'flex',
              alignItems: 'center',
              gap: 0.25,
              bgcolor: 'background.paper',
              border: `1px solid ${t.palette.divider}`,
              borderRadius: 1,
              boxShadow: t.shadows[3],
              zIndex: 10,
              transform: 'translateY(-50%)',
            }}
          >
            {!message.isSelf && (
              <IconButton
                size="small"
                onClick={(e) => setReactAnchor(e.currentTarget)}
                sx={{ p: 0.5 }}
                title="React"
              >
                <Smile size={14} />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={() => onReply?.(message)}
              sx={{ p: 0.5 }}
              title="Reply"
            >
              <Reply size={14} />
            </IconButton>
            {message.isSelf && (
              <IconButton
                size="small"
                onClick={() => setEditing(true)}
                sx={{ p: 0.5 }}
                title="Edit"
              >
                <Pencil size={14} />
              </IconButton>
            )}
          </Box>
        )}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              px: 1.25,
              py: 0.85,
              borderRadius: 1,
              fontSize: 12.5,
              lineHeight: 1.4,
              color: message.isSelf ? '#fff' : 'text.primary',
              bgcolor: message.isSelf ? 'primary.main' : 'background.neutral',
              border: message.isSelf ? 'none' : `1px solid ${alpha(t.palette.divider, 0.6)}`,
              wordBreak: 'break-word',
            }}
          >
            {replyTo && (
              <Box
                sx={{
                  mb: 0.6,
                  pl: 1,
                  borderLeft: `2px solid ${alpha(
                    message.isSelf ? '#fff' : t.palette.text.primary,
                    0.35
                  )}`,
                  backgroundColor: message.isSelf
                    ? alpha(t.palette.primary.dark, 0.5)
                    : alpha('#8A93A3', 0.15),
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: message.isSelf ? alpha('#fff', 0.9) : 'text.secondary',
                  }}
                >
                  {replyTo.authorName}
                </Typography>
                <Typography
                  noWrap
                  sx={{
                    fontSize: 11.5,
                    maxWidth: 200,
                    color: message.isSelf ? alpha('#fff', 0.8) : 'text.secondary',
                  }}
                >
                  {replyTo.text}
                </Typography>
              </Box>
            )}

            {editing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
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
                    bgcolor: alpha('#000', 0.06),
                    border: `1px solid ${alpha(t.palette.divider, 0.6)}`,
                    borderRadius: 1,
                    px: 1,
                    py: 0.4,
                    fontSize: 12.5,
                    color: 'inherit',
                    outline: 'none',
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography
                    onClick={handleSave}
                    sx={{ fontSize: 11, fontWeight: 700, cursor: 'pointer', color: 'inherit' }}
                  >
                    Save
                  </Typography>
                  <Typography
                    onClick={() => setEditing(false)}
                    sx={{ fontSize: 11, cursor: 'pointer', opacity: 0.75, color: 'inherit' }}
                  >
                    Cancel
                  </Typography>
                </Box>
              </Box>
            ) : (
              <>
                {message.text}
                {message.editedAt && (
                  <Box component="span" sx={{ ml: 0.6, fontSize: 9.5, opacity: 0.65 }}>
                    (edited)
                  </Box>
                )}
              </>
            )}
          </Box>

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
                    gap: 0.3,
                    px: 0.6,
                    py: 0.15,
                    fontSize: 10.5,
                    borderRadius: 5,
                    cursor: 'pointer',
                    bgcolor: r.reactedBySelf
                      ? alpha(t.palette.primary.main, 0.12)
                      : (t.palette.background as any).neutral,
                    border: `1px solid ${r.reactedBySelf
                      ? alpha(t.palette.primary.main, 0.3)
                      : alpha(t.palette.divider, 0.4)
                      }`,
                    color: r.reactedBySelf ? t.palette.primary.main : t.palette.text.secondary,
                  }}
                >
                  <span>{r.emoji}</span>
                  <span>{r.count}</span>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <Popover
        open={Boolean(reactAnchor)}
        anchorEl={reactAnchor}
        onClose={() => setReactAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slotProps={{ paper: { sx: { border: `1px solid ${t.palette.divider}`, borderRadius: 3 } } }}
      >
        <Box sx={{ display: 'flex', gap: 0.25, p: 0.25 }}>
          {QUICK_REACTIONS.map((emoji) => (
            <IconButton
              key={emoji}
              size="small"
              onClick={() => {
                onReact?.(message.id, emoji);
                setReactAnchor(null);
              }}
              sx={{ fontSize: 16 }}
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
  const [tab, setTab] = useState<TabKey>('friends');
  const [activeFriend, setActiveFriend] = useState<AllRelationsType | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const friendId = activeFriend?.accountDetails?.userId || '';

  // RTK Query
  const { data: historyResponse, isFetching: fetchingHistory } = useGetHistoryQuery(friendId, {
    skip: !friendId,
    refetchOnMountOrArgChange: true,
  });
  const [saveMessage] = useSaveMessageMutation();
  const [updateMessage] = useUpdateMessageMutation();
  const [toggleReaction] = useToggleReactionMutation();

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
      setMessages(historyResponse.data as ChatMessage[]);
    }
  }, [historyResponse, activeFriend, fetchingHistory]);

  /* ------------------------------------------------------------------ */
  /* Real-Time Socket.io Listeners                                      */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (incomingMsg: ChatMessage) => {
      if (
        activeFriend &&
        (incomingMsg.authorId === activeFriend.accountDetails.userId ||
          (incomingMsg as any).recipientId === activeFriend.accountDetails.userId)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === incomingMsg.id)) return prev;
          return [
            ...prev,
            { ...incomingMsg, isSelf: incomingMsg.authorId === currentUserId },
          ];
        });
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
  }, [socket, activeFriend, currentUserId]);

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

    // 1. Instant local screen update
    setMessages((prev) => [...prev, newMsg]);
    setDraft('');
    setReplyingTo(null);

    // 2. Persist to MongoDB (Backend handles socket emission to recipient)
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

    updateMessage({
      messageId: id,
      text,
    }).catch((err) => console.error('Failed to update message:', err));
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

    toggleReaction({
      messageId: id,
      emoji,
    }).catch((err) => console.error('Failed to toggle reaction:', err));
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
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
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
              <IconButton size="small" onClick={() => setActiveFriend(null)} title="Back">
                <ArrowLeft size={16} />
              </IconButton>
              <Avatar
                src={activeFriend.accountDetails.profilePhoto}
                sx={{ width: 32, height: 32, fontSize: 12, bgcolor: 'primary.main' }}
              >
                {getInitials(activeFriend.accountDetails.name)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }} noWrap>
                  {activeFriend.accountDetails.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 10.5,
                    color: isOnline(activeFriend.accountDetails.lastActive)
                      ? '#2E9E5B'
                      : 'text.secondary',
                  }}
                >
                  {isOnline(activeFriend.accountDetails.lastActive) ? 'Online' : 'Offline'}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={onClose} title="Close">
              <X size={16} />
            </IconButton>
          </Box>

          {/* Chat Messages Feed */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              px: 1.5,
              py: 1.25,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {fetchingHistory && messages.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 'auto' }}>
                <CircularProgress size={24} />
              </Box>
            ) : messages.length === 0 ? (
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', textAlign: 'center', mt: 3 }}
              >
                No messages yet. Say hello to {activeFriend.accountDetails.name?.split(' ')[0] ?? 'there'}!
              </Typography>
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
                borderTop: (t: Theme) => `1px solid ${t.palette.primary.main}`,
                bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.08),
                flexShrink: 0,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: 'primary.main' }}>
                  Replying to {replyingTo.authorName}
                </Typography>
                <Typography noWrap sx={{ fontSize: 11.5, color: 'text.secondary', maxWidth: 220 }}>
                  {replyingTo.text}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setReplyingTo(null)}>
                <X size={13} />
              </IconButton>
            </Box>
          )}

          {/* Input Bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.25,
              borderTop: replyingTo ? 'none' : '1px solid',
              borderColor: 'divider',
              flexShrink: 0,
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
                bgcolor: 'background.neutral',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                px: 1.25,
                py: 0.85,
                fontSize: 12.5,
                color: 'text.primary',
                outline: 'none',
              }}
            />
            <IconButton
              onClick={handleSend}
              disabled={!draft.trim()}
              size="small"
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                '&.Mui-disabled': { bgcolor: 'background.neutral', color: 'text.secondary' },
              }}
            >
              <Send size={14} />
            </IconButton>
          </Box>
        </Box>
      ) : (
        /* Contact Directory */
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
        }}>
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
            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Social</Typography>
            <IconButton size="small" onClick={onClose}>
              <X size={16} />
            </IconButton>
          </Box>

          {/* Navigation Tabs */}
          <Box
            sx={{
              display: 'flex',
              borderBottom: '1px solid',
              borderColor: 'divider',
              flexShrink: 0,
            }}
          >
            {(['friends', 'followers', 'following'] as TabKey[]).map((key) => {
              const count = dataByTab[key]?.length || 0;
              return (
                <Box
                  key={key}
                  onClick={() => setTab(key)}
                  sx={{
                    flex: 1,
                    textAlign: 'center',
                    py: 1,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: tab === key ? 'primary.main' : 'text.secondary',
                    borderBottom: tab === key ? '2px solid' : '2px solid transparent',
                    borderColor: tab === key ? 'primary.main' : 'transparent',
                    textTransform: 'capitalize',
                  }}
                >
                  {key}
                  <Box component="span" sx={{ ml: 0.5, opacity: 0.6 }}>
                    ({count})
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Directory List */}
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', py: 0.5 }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : dataByTab[tab].length === 0 ? (
              <Typography
                variant="caption"
                sx={{ display: 'block', textAlign: 'center', color: 'text.secondary', mt: 3 }}
              >
                No {tab} found.
              </Typography>
            ) : (
              dataByTab[tab]?.map((item) => {
                const person = item.accountDetails;
                const canChat = friendIds.has(person.userId);

                return (
                  <Box
                    key={person.userId}
                    onClick={() => canChat && setActiveFriend(item)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.25,
                      px: 1.5,
                      py: 1,
                      cursor: canChat ? 'pointer' : 'default',
                      borderRadius: 1.5,
                      transition: 'background-color 0.12s ease',
                      '&:hover': canChat ? { bgcolor: 'background.neutral' } : undefined,
                    }}
                  >
                    <Box sx={{ position: 'relative', flexShrink: 0 }}>
                      <Avatar
                        src={person.profilePhoto}
                        sx={{ width: 36, height: 36, fontSize: 13, bgcolor: 'primary.main' }}
                      >
                        {getInitials(person.name)}
                      </Avatar>
                      {isOnline(person.lastActive) && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: -1,
                            right: -1,
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            bgcolor: '#2E9E5B',
                            border: (t) => `2px solid ${t.palette.background.paper}`,
                          }}
                        />
                      )}
                    </Box>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>
                        {person.name}
                      </Typography>
                      <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }} noWrap>
                        {person.bio || `@${person.username}`}
                      </Typography>
                    </Box>

                    {canChat ? (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveFriend(item);
                        }}
                        sx={{ color: 'primary.main' }}
                        title={`Message ${person.name}`}
                      >
                        <MessageCircle size={16} />
                      </IconButton>
                    ) : (
                      <Tooltip title="Chat is only available with mutual friends">
                        <Box
                          sx={{
                            color: 'text.secondary',
                            opacity: 0.4,
                            display: 'flex',
                            flexShrink: 0,
                          }}
                        >
                          <Lock size={14} />
                        </Box>
                      </Tooltip>
                    )}
                  </Box>
                );
              })
            )}
          </Box>

          {tab !== 'friends' && (
            <Box
              sx={{
                px: 2,
                py: 1,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.neutral',
                flexShrink: 0,
              }}
            >
              <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>
                Chat is enabled only for mutual friends. Follow each other back to unlock conversations.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SocialChat;
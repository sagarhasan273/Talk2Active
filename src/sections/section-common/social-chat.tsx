import type { Theme } from '@mui/material/styles';

import React, { useMemo, useState } from 'react';
import {
  X,
  Lock,
  Send,
  Info,
  Reply,
  Smile,
  Pencil,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  AlertTriangle,
} from 'lucide-react';

import {
  Box,
  alpha,
  Avatar,
  Popover,
  Tooltip,
  useTheme,
  Typography,
  IconButton,
} from '@mui/material';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type SystemType = 'info' | 'success' | 'warning' | 'error';
type TabKey = 'friends' | 'followers' | 'following';

interface Person {
  id: string;
  name: string;
  headline: string;
  online: boolean;
}

interface Reaction {
  emoji: string;
  count: number;
  reactedBySelf: boolean;
}

interface ChatMessage {
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
}

type ConversationMap = Record<string, ChatMessage[]>;

/* ------------------------------------------------------------------ */
/*  Mock data                                                         */
/* ------------------------------------------------------------------ */

const ME = 'me';

const FRIENDS: Person[] = [
  { id: 'u1', name: 'Ariana Cole', headline: 'Product Design Lead', online: true },
  { id: 'u2', name: 'Marcus Webb', headline: 'Backend Engineer', online: false },
  { id: 'u3', name: 'Priya Nandan', headline: 'Growth Marketing', online: true },
];

const FOLLOWERS: Person[] = [
  ...FRIENDS,
  { id: 'u4', name: 'Diego Alvarez', headline: 'Founder, Loopwork', online: false },
  { id: 'u5', name: 'Hana Kobayashi', headline: 'UX Researcher', online: true },
];

const FOLLOWING: Person[] = [
  FRIENDS[0],
  FRIENDS[2],
  { id: 'u6', name: 'Tomasz Nowak', headline: 'DevRel, Fluxbase', online: false },
];

const QUICK_REACTIONS: string[] = ['👍', '🎉', '❤️', '😂', '👀'];

const SEED_MESSAGES: ConversationMap = {
  u1: [
    {
      id: 'm0',
      isSystem: true,
      systemType: 'success',
      text: 'You and Ariana Cole are now connected.',
    },
    {
      id: 'm1',
      authorId: 'u1',
      authorName: 'Ariana Cole',
      text: 'Hey! Did you get a chance to look at the new nav mocks?',
      isSelf: false,
    },
    {
      id: 'm2',
      authorId: ME,
      authorName: 'You',
      text: 'Just opened them — the sidebar collapse feels much cleaner now.',
      isSelf: true,
      reactions: [{ emoji: '👍', count: 1, reactedBySelf: false }],
    },
  ],
  u2: [
    {
      id: 'm1',
      authorId: 'u2',
      authorName: 'Marcus Webb',
      text: 'Deploy is green ✅ — shipping to staging now.',
      isSelf: false,
    },
  ],
  u3: [
    {
      id: 'm1',
      authorId: ME,
      authorName: 'You',
      text: 'Loved the campaign numbers this week.',
      isSelf: true,
    },
    {
      id: 'm2',
      authorId: 'u3',
      authorName: 'Priya Nandan',
      text: 'Thank you! CTR is up 18% since the subject-line test.',
      isSelf: false,
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const initials = (name: string): string =>
  name
    .split(' ')
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

const systemColorMap = (t: Theme): Record<SystemType, string> => ({
  info: t.palette.info.main,
  success: '#2E9E5B',
  warning: t.palette.warning.main,
  error: '#D64545',
});

const getSystemMessageBg = (t: Theme, type: SystemType = 'info'): string =>
  alpha(systemColorMap(t)[type], 0.08);

const getSystemMessageBorder = (t: Theme, type: SystemType = 'info'): string =>
  alpha(systemColorMap(t)[type], 0.2);

const getSystemMessageColor = (t: Theme, type: SystemType = 'info'): string =>
  systemColorMap(t)[type];

const getSystemIcon = (type?: SystemType) => {
  const p = { size: 14 };
  if (type === 'success') return <CheckCircle {...p} />;
  if (type === 'warning') return <AlertTriangle {...p} />;
  if (type === 'error') return <AlertCircle {...p} />;
  return <Info {...p} />;
};

const linkButtonSx = {
  border: 'none',
  bgcolor: 'transparent',
  cursor: 'pointer',
  fontWeight: 700,
  p: 0,
  fontSize: 11,
  transition: 'all 0.15s ease',
  '&:hover': { opacity: 1, textDecoration: 'underline' },
} as const;

/* ------------------------------------------------------------------ */
/*  Message bubble                                                    */
/* ------------------------------------------------------------------ */

interface MessageBubbleProps {
  message: ChatMessage;
  replyTo?: ChatMessage;
  onReply?: (message: ChatMessage) => void;
  onEdit?: (id: string, text: string) => void;
  onReact?: (id: string, emoji: string) => void;
}

const MessageBubble = ({ message, replyTo, onReply, onEdit, onReact }: MessageBubbleProps) => {
  const t = useTheme();
  const [hovered, setHovered] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [draft, setDraft] = useState<string>(message.text);
  const [reactAnchor, setReactAnchor] = useState<HTMLElement | null>(null);

  if (message.isSystem) {
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
            bgcolor: getSystemMessageBg(t, message.systemType),
            border: `1px solid ${getSystemMessageBorder(t, message.systemType)}`,
            color: getSystemMessageColor(t, message.systemType),
            maxWidth: '85%',
          }}
        >
          {getSystemIcon(message.systemType)}
          <Typography sx={{ fontSize: 11.5, fontWeight: 500 }}>{message.text}</Typography>
        </Box>
      </Box>
    );
  }

  const saveEdit = (): void => {
    const text = draft.trim();
    if (text && text !== message.text) onEdit?.(message.id, text);
    setEditing(false);
  };

  const cancelEdit = (): void => {
    setDraft(message.text);
    setEditing(false);
  };

  const pickReaction = (emoji: string): void => {
    onReact?.(message.id, emoji);
    setReactAnchor(null);
  };

  const toolbarPositionSx = message.isSelf ? { left: 0 } : { right: 0 };

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: 'relative',
        alignSelf: message.isSelf ? 'flex-end' : 'flex-start',
        maxWidth: '82%',
        width: '100%',
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
              ...toolbarPositionSx,
              display: 'flex',
              alignItems: 'center',
              gap: 0.25,
              bgcolor: 'background.paper',
              border: `1px solid ${t.palette.divider}`,
              borderRadius: 2,
              boxShadow: t.shadows[3],
              zIndex: 10,
              transform: 'translateY(-50%)',
            }}
          >
            <IconButton
              size="small"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => setReactAnchor(e.currentTarget)}
              sx={{ p: 0.5 }}
              title="React"
            >
              <Smile size={14} />
            </IconButton>
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
              borderRadius: 2,
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
                    if (e.key === 'Enter') saveEdit();
                    if (e.key === 'Escape') cancelEdit();
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
                  <Box
                    component="button"
                    onClick={saveEdit}
                    sx={{ ...linkButtonSx, color: 'inherit' }}
                  >
                    Save
                  </Box>
                  <Box
                    component="button"
                    onClick={cancelEdit}
                    sx={{ ...linkButtonSx, color: 'inherit', opacity: 0.75 }}
                  >
                    Cancel
                  </Box>
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
              {message.reactions!.map((r) => (
                <Box
                  key={r.emoji}
                  component="button"
                  onClick={() => pickReaction(r.emoji)}
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
                    border: `1px solid ${
                      r.reactedBySelf
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
              onClick={() => pickReaction(emoji)}
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
/*  Chat panel for a single friend                                    */
/* ------------------------------------------------------------------ */

interface FriendChatPanelProps {
  friend: Person;
  messages: ChatMessage[];
  onSend: (text: string, replyToId?: string) => void;
  onEdit: (id: string, text: string) => void;
  onReact: (id: string, emoji: string) => void;
  onBack: () => void;
  onClose: () => void;
}

const FriendChatPanel = ({
  friend,
  messages,
  onSend,
  onEdit,
  onReact,
  onBack,
  onClose,
}: FriendChatPanelProps) => {
  const [draft, setDraft] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  const byId = useMemo<Record<string, ChatMessage>>(() => {
    const map: Record<string, ChatMessage> = {};
    messages.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [messages]);

  const send = (): void => {
    const text = draft.trim();
    if (!text) return;
    onSend(text, replyingTo?.id);
    setDraft('');
    setReplyingTo(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
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
          <IconButton size="small" onClick={onBack} sx={{ color: 'text.secondary' }} title="Back">
            <ArrowLeft size={16} />
          </IconButton>
          <Avatar sx={{ width: 30, height: 30, fontSize: 12, bgcolor: 'primary.main' }}>
            {initials(friend.name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }} noWrap>
              {friend.name}
            </Typography>
            <Typography
              sx={{ fontSize: 10.5, color: friend.online ? '#2E9E5B' : 'text.secondary' }}
            >
              {friend.online ? 'Online' : 'Offline'}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }} title="Close">
          <X size={16} />
        </IconButton>
      </Box>

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
        {messages.length === 0 ? (
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', textAlign: 'center', mt: 2 }}
          >
            No messages yet — say hello to {friend.name.split(' ')[0]}!
          </Typography>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              replyTo={m.replyToId ? byId[m.replyToId] : undefined}
              onReply={setReplyingTo}
              onEdit={onEdit}
              onReact={onReact}
            />
          ))
        )}
      </Box>

      {replyingTo && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            px: 1.5,
            py: 0.75,
            borderTop: (t: Theme) => `1px solid ${t.palette.primary.main}`,
            bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.08),
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
          <IconButton
            size="small"
            onClick={() => setReplyingTo(null)}
            sx={{ color: 'text.secondary' }}
          >
            <X size={13} />
          </IconButton>
        </Box>
      )}

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
            if (e.key === 'Enter') send();
          }}
          placeholder={replyingTo ? `Reply to ${replyingTo.authorName}...` : 'Write a message...'}
          sx={{
            flex: 1,
            mt: 'auto',
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
          onClick={send}
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
  );
};

/* ------------------------------------------------------------------ */
/*  Contact row                                                       */
/* ------------------------------------------------------------------ */

interface ContactRowProps {
  person: Person;
  canChat: boolean;
  onChat: () => void;
}

const ContactRow = ({ person, canChat, onChat }: ContactRowProps) => {
  const t = useTheme();
  return (
    <Box
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
      onClick={canChat ? onChat : undefined}
    >
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <Avatar sx={{ width: 36, height: 36, fontSize: 13, bgcolor: 'primary.main' }}>
          {initials(person.name)}
        </Avatar>
        {person.online && (
          <Box
            sx={{
              position: 'absolute',
              bottom: -1,
              right: -1,
              width: 9,
              height: 9,
              borderRadius: '50%',
              bgcolor: '#2E9E5B',
              border: `2px solid ${t.palette.background.paper}`,
            }}
          />
        )}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }} noWrap>
          {person.name}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }} noWrap>
          {person.headline}
        </Typography>
      </Box>

      {canChat ? (
        <IconButton
          size="small"
          onClick={onChat}
          sx={{ color: 'primary.main', flexShrink: 0 }}
          title={`Message ${person.name}`}
        >
          <MessageCircle size={16} />
        </IconButton>
      ) : (
        <Tooltip title="You can only chat with friends">
          <Box sx={{ color: 'text.secondary', opacity: 0.4, display: 'flex', flexShrink: 0 }}>
            <Lock size={14} />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

/* ------------------------------------------------------------------ */
/*  Main widget                                                       */
/* ------------------------------------------------------------------ */

const TABS: { key: TabKey; label: string }[] = [
  { key: 'friends', label: 'Friends' },
  { key: 'followers', label: 'Followers' },
  { key: 'following', label: 'Following' },
];

const DATA_BY_TAB: Record<TabKey, Person[]> = {
  friends: FRIENDS,
  followers: FOLLOWERS,
  following: FOLLOWING,
};

const SocialChat = ({ onClose }: { onClose?: () => void }) => {
  const [tab, setTab] = useState<TabKey>('friends');
  const [activeFriendId, setActiveFriendId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationMap>(SEED_MESSAGES);

  const friendIds = useMemo<Set<string>>(() => new Set(FRIENDS.map((f) => f.id)), []);
  const activeFriend: Person | undefined = activeFriendId
    ? FRIENDS.find((f) => f.id === activeFriendId)
    : undefined;

  const openChat = (friend: Person): void => {
    setActiveFriendId(friend.id);
    setConversations((prev) => (prev[friend.id] ? prev : { ...prev, [friend.id]: [] }));
  };

  const handleClosePanel = (): void => {
    setActiveFriendId(null);
    onClose?.();
  };

  const handleSend = (text: string, replyToId?: string): void => {
    if (!activeFriendId) return;
    setConversations((prev) => ({
      ...prev,
      [activeFriendId]: [
        ...(prev[activeFriendId] || []),
        {
          id: `m${Date.now()}`,
          authorId: ME,
          authorName: 'You',
          text,
          isSelf: true,
          replyToId,
        },
      ],
    }));
  };

  const handleEdit = (id: string, text: string): void => {
    if (!activeFriendId) return;
    setConversations((prev) => ({
      ...prev,
      [activeFriendId]: (prev[activeFriendId] || []).map((m) =>
        m.id === id ? { ...m, text, editedAt: Date.now() } : m
      ),
    }));
  };

  const handleReact = (id: string, emoji: string): void => {
    if (!activeFriendId) return;
    setConversations((prev) => ({
      ...prev,
      [activeFriendId]: (prev[activeFriendId] || []).map((m) => {
        if (m.id !== id) return m;
        const existing: Reaction[] = m.reactions || [];
        const found = existing.find((r) => r.emoji === emoji);
        const reactions: Reaction[] = found
          ? existing
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
          : [...existing, { emoji, count: 1, reactedBySelf: true }];
        return { ...m, reactions };
      }),
    }));
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        height: 1,
        width: 1,
        borderRadius: 1,
      }}
    >
      {activeFriend ? (
        <FriendChatPanel
          friend={activeFriend}
          messages={conversations[activeFriend.id] || []}
          onSend={handleSend}
          onEdit={handleEdit}
          onReact={handleReact}
          onBack={() => setActiveFriendId(null)}
          onClose={handleClosePanel}
        />
      ) : (
        <>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary' }}>
              Social
            </Typography>
            <IconButton
              size="small"
              onClick={handleClosePanel}
              sx={{ color: 'text.secondary' }}
              title="Close"
            >
              <X size={16} />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: 'flex',
              borderBottom: '1px solid',
              borderColor: 'divider',
              flexShrink: 0,
            }}
          >
            {TABS.map(({ key, label }) => (
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
                }}
              >
                {label}
                <Box component="span" sx={{ ml: 0.5, opacity: 0.6 }}>
                  ({DATA_BY_TAB[key].length})
                </Box>
              </Box>
            ))}
          </Box>

          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', py: 0.5 }}>
            {DATA_BY_TAB[tab].map((person) => (
              <ContactRow
                key={person.id}
                person={person}
                canChat={friendIds.has(person.id)}
                onChat={() => openChat(person)}
              />
            ))}
          </Box>

          {tab !== 'friends' && (
            <Box
              sx={{
                px: 2,
                py: 1,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.neutral',
              }}
            >
              <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>
                Chat is only available with friends. Connect with someone to start a conversation.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default SocialChat;

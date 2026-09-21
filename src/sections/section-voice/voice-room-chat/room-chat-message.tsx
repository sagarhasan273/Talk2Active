import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Lock,
  Pencil,
  Reply,
  Smile,
} from 'lucide-react';
import React, { useState } from 'react';

import {
  alpha,
  Avatar,
  Box,
  Button,
  IconButton,
  Popover,
  Typography,
  useTheme,
} from '@mui/material';

import { QUICK_REACTIONS } from '../@mock_/messages-data';
import type { ChatMessage } from '../voice-room-header/types';

type RoomChatMessageProps = {
  message: ChatMessage;
  replyTo?: ChatMessage;
  onReply?: (message: ChatMessage) => void;
  onEdit?: (id: string, text: string) => void;
  onReact?: (id: string, emoji: string) => void;
};

export const RoomChatMessage = ({
  message,
  replyTo,
  onReply,
  onEdit,
  onReact,
}: RoomChatMessageProps) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.text);
  const [reactAnchor, setReactAnchor] = useState<HTMLElement | null>(null);

  const isPrivate = Boolean(message.privateTo);
  const privateLabel = isPrivate
    ? message.isSelf
      ? `Private to ${message.privateTo!.name}`
      : `Private to you`
    : null;

  if (message.isSystem) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', my: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 0.75,
            borderRadius: 2,
            bgcolor: getSystemMessageBg(theme, message.systemType),
            border: `1px solid ${getSystemMessageBorder(theme, message.systemType)}`,
            color: getSystemMessageColor(theme, message.systemType),
            maxWidth: '85%',
          }}
        >
          {getSystemIcon(message.systemType)}
          <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 600 }}>
            {message.text}
          </Typography>
        </Box>
      </Box>
    );
  }

  const saveEdit = () => {
    const text = draft.trim();
    if (text && text !== message.text) onEdit?.(message.id, text);
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft(message.text);
    setEditing(false);
  };

  const pickReaction = (emoji: string) => {
    onReact?.(message.id, emoji);
    setReactAnchor(null);
  };

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: 'relative',
        alignSelf: message.isSelf ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          ml: message.isSelf ? 'auto' : 0.5,
          mr: message.isSelf ? 0.5 : 'auto',
          mb: 0.25,
        }}
      >
        {!message.isSelf && (
          <>
            <Avatar
              src={message.avatarUrl}
              alt={message.authorName}
              sx={{
                width: 22,
                height: 22,
                fontSize: 11,
                bgcolor: theme.palette.primary.main,
              }}
            >
              {message.authorName.charAt(0)}
            </Avatar>
            <Typography
              variant="caption"
              sx={{ color: 'text.primary', fontWeight: 700, fontSize: 11 }}
            >
              {message.authorName}
            </Typography>
          </>
        )}
        {message.isSelf && (
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 11 }}
          >
            You
          </Typography>
        )}
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10 }}>
          {message.timestamp || ''}
        </Typography>
      </Box>

      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
        {hovered && !editing && (
          <Box
            sx={{
              position: 'absolute',
              top: -12,
              [!message.isSelf ? 'right' : 'left']: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              bgcolor: 'background.paper',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1.5,
              boxShadow: theme.shadows[3],
              zIndex: 10,
              p: 0.25,
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => setReactAnchor(e.currentTarget)}
              sx={{ p: 0.5, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
              <Smile size={14} />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => onReply?.(message)}
              sx={{ p: 0.5, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
              <Reply size={14} />
            </IconButton>

            {message.isSelf && (
              <IconButton
                size="small"
                onClick={() => setEditing(true)}
                sx={{ p: 0.5, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
              >
                <Pencil size={14} />
              </IconButton>
            )}
          </Box>
        )}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              px: 1.5,
              py: 1,
              borderRadius: 2,
              fontSize: 13,
              lineHeight: 1.45,
              color: message.isSelf ? '#fff' : 'text.primary',
              bgcolor: message.isSelf ? theme.palette.primary.main : 'background.neutral',
              border: message.isSelf ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.4)}`,
              boxShadow: message.isSelf
                ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                : 'none',
              wordBreak: 'break-word',
              ...(isPrivate && {
                bgcolor: message.isSelf
                  ? alpha(theme.palette.warning.main, 0.9)
                  : alpha(theme.palette.warning.main, 0.12),
                border: `1px dashed ${alpha(theme.palette.warning.main, 0.5)}`,
                color: message.isSelf ? theme.palette.common.black : theme.palette.warning.dark,
              }),
            }}
          >
            {isPrivate && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mb: 0.5,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 0.3,
                  opacity: 0.9,
                }}
              >
                <Lock size={11} />
                {privateLabel}
              </Box>
            )}

            {replyTo && (
              <Box
                sx={{
                  mb: 0.75,
                  pl: 1,
                  borderLeft: `2px solid ${alpha(message.isSelf ? '#fff' : theme.palette.primary.main, 0.6)}`,
                  bgcolor: message.isSelf
                    ? alpha(theme.palette.common.black, 0.15)
                    : alpha(theme.palette.primary.main, 0.06),
                  borderRadius: '0 4px 4px 0',
                  py: 0.25,
                }}
              >
                <Typography sx={{ fontSize: 11, fontWeight: 700 }}>{replyTo.authorName}</Typography>
                <Typography noWrap sx={{ fontSize: 12, opacity: 0.85, maxWidth: 220 }}>
                  {replyTo.text}
                </Typography>
              </Box>
            )}

            {/* Display Image Upload If Present */}
            {message.imageUrl && (
              <Box
                component="img"
                src={message.imageUrl}
                alt="Shared Image"
                onClick={() => window.open(message.imageUrl, '_blank')}
                sx={{
                  maxWidth: '100%',
                  maxHeight: 250,
                  borderRadius: 1.5,
                  mb: message.text ? 1 : 0,
                  display: 'block',
                  cursor: 'pointer',
                  objectFit: 'cover',
                  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              />
            )}

            {editing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                    bgcolor: alpha(theme.palette.common.black, 0.08),
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                    fontSize: 13,
                    color: 'inherit',
                    outline: 'none',
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={saveEdit}
                    sx={{ py: 0.2, fontSize: 11 }}
                  >
                    Save
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    onClick={cancelEdit}
                    sx={{ py: 0.2, fontSize: 11, color: 'inherit' }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              message.text && (
                <>
                  {message.text}
                  {message.editedAt && (
                    <Box component="span" sx={{ ml: 0.75, fontSize: 10, opacity: 0.7 }}>
                      (edited)
                    </Box>
                  )}
                </>
              )
            )}
          </Box>

          {!!message.reactions?.length && (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5,
                mt: 0.5,
                justifyContent: message.isSelf ? 'flex-end' : 'flex-start',
              }}
            >
              {message.reactions.map((r) => (
                <Box
                  key={r.emoji}
                  component="button"
                  onClick={() => pickReaction(r.emoji)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.4,
                    px: 0.75,
                    py: 0.2,
                    fontSize: 11,
                    borderRadius: 5,
                    cursor: 'pointer',
                    bgcolor: r.reactedBySelf
                      ? alpha(theme.palette.primary.main, 0.15)
                      : 'background.paper',
                    border: `1px solid ${r.reactedBySelf
                      ? theme.palette.primary.main
                      : alpha(theme.palette.divider, 0.3)
                      }`,
                    color: r.reactedBySelf
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      transform: 'scale(1.08)',
                    },
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
        slotProps={{
          paper: {
            sx: {
              p: 0.5,
              borderRadius: 3,
              boxShadow: theme.shadows[6],
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {QUICK_REACTIONS.map((emoji: string) => (
            <IconButton
              key={emoji}
              size="small"
              onClick={() => pickReaction(emoji)}
              sx={{
                fontSize: 16,
                borderRadius: 2,
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

const getSystemMessageBg = (theme: any, type?: string) => {
  switch (type) {
    case 'info':
      return alpha(theme.palette.info.main, 0.1);
    case 'success':
      return alpha(theme.palette.success.main, 0.1);
    case 'warning':
      return alpha(theme.palette.warning.main, 0.1);
    case 'error':
      return alpha(theme.palette.error.main, 0.1);
    default:
      return alpha(theme.palette.grey[500], 0.1);
  }
};

const getSystemMessageBorder = (theme: any, type?: string) => {
  switch (type) {
    case 'info':
      return alpha(theme.palette.info.main, 0.25);
    case 'success':
      return alpha(theme.palette.success.main, 0.25);
    case 'warning':
      return alpha(theme.palette.warning.main, 0.25);
    case 'error':
      return alpha(theme.palette.error.main, 0.25);
    default:
      return alpha(theme.palette.grey[500], 0.25);
  }
};

const getSystemMessageColor = (theme: any, type?: string) => {
  switch (type) {
    case 'info':
      return theme.palette.info.main;
    case 'success':
      return theme.palette.success.main;
    case 'warning':
      return theme.palette.warning.main;
    case 'error':
      return theme.palette.error.main;
    default:
      return theme.palette.text.secondary;
  }
};

const getSystemIcon = (type?: string) => {
  const props = { size: 14 };
  switch (type) {
    case 'info':
      return <Info {...props} />;
    case 'success':
      return <CheckCircle {...props} />;
    case 'warning':
      return <AlertTriangle {...props} />;
    case 'error':
      return <AlertCircle {...props} />;
    default:
      return <Info {...props} />;
  }
};

import React, { useState } from 'react';
import { Lock, Reply, Smile, Pencil } from 'lucide-react';

import { Box, alpha, Popover, useTheme, Typography, IconButton } from '@mui/material';

import { QUICK_REACTIONS } from './messages-data';

import type { ChatMessage } from './types';

type RoomMessageBubbleProps = {
  message: ChatMessage;
  /** The message this one is replying to, already resolved by id. */
  replyTo?: ChatMessage;
  onReply?: (message: ChatMessage) => void;
  onEdit?: (id: string, text: string) => void;
  onReact?: (id: string, emoji: string) => void;
};

export const RoomMessageBubble = ({
  message,
  replyTo,
  onReply,
  onEdit,
  onReact,
}: RoomMessageBubbleProps) => {
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
        maxWidth: '75%',
        width: '100%',
      }}
    >
      {!message.isSelf && (
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.primary,
            ml: 0.5,
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          {message.authorName}
        </Typography>
      )}

      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 0.5,
          mt: 0.25,
        }}
      >
        {/* Hover toolbar - improved positioning */}
        {hovered && !editing && (
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              [!message.isSelf ? 'right' : 'left']: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              bgcolor: 'background.neutral',
              border: `2px solid ${theme.palette.divider}`,
              borderRadius: 2,
              boxShadow: theme.shadows[3],
              zIndex: 10,
              transform: 'translateY(-50%)',
              opacity: 0,
              animation: 'toolbarFadeIn 0.15s ease forwards',
              '@keyframes toolbarFadeIn': {
                to: {
                  opacity: 1,
                },
              },
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => setReactAnchor(e.currentTarget)}
              sx={{
                p: 0.75,
                color: theme.palette.text.secondary,
                borderRadius: 1.5,
                '&:hover': {
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
              title="React"
            >
              <Smile size={16} />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => onReply?.(message)}
              sx={{
                p: 0.75,
                color: theme.palette.text.secondary,
                borderRadius: 1.5,
                '&:hover': {
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
              title="Reply"
            >
              <Reply size={16} />
            </IconButton>

            {message.isSelf && (
              <IconButton
                size="small"
                onClick={() => setEditing(true)}
                sx={{
                  p: 0.75,
                  color: theme.palette.text.secondary,
                  borderRadius: 1.5,
                  '&:hover': {
                    color: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
                title="Edit"
              >
                <Pencil size={16} />
              </IconButton>
            )}
          </Box>
        )}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              px: 1.5,
              py: 1,
              borderRadius: 1,
              fontSize: 13,
              lineHeight: 1.4,
              color: message.isSelf ? '#fff' : theme.palette.text.primary,
              bgcolor: message.isSelf ? theme.palette.primary.main : 'background.neutral',
              border: message.isSelf ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.3)}`,
              boxShadow: message.isSelf
                ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                : `0 1px 4px ${alpha(theme.palette.common.black, 0.04)}`,
              wordBreak: 'break-word',
              ...(isPrivate && {
                bgcolor: message.isSelf
                  ? alpha(theme.palette.warning.main, 0.85)
                  : alpha(theme.palette.warning.main, 0.08),
                border: `1px dashed ${alpha(theme.palette.warning.main, 0.4)}`,
                color: message.isSelf ? theme.palette.common.black : theme.palette.warning.main,
                boxShadow: `0 2px 8px ${alpha(theme.palette.warning.main, 0.15)}`,
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
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  opacity: 0.85,
                  color: message.isSelf ? theme.palette.common.black : theme.palette.warning.main,
                }}
              >
                <Lock size={10} />
                {privateLabel}
              </Box>
            )}

            {replyTo && (
              <Box
                sx={{
                  mb: 0.75,
                  pl: 1,
                  borderLeft: `2px solid ${alpha(
                    message.isSelf ? '#fff' : theme.palette.text.primary,
                    0.35
                  )}`,
                  backgroundColor: message.isSelf
                    ? alpha(theme.palette.primary.dark, 0.55)
                    : alpha(theme.palette.grey[500], 0.3),
                  fontSize: 12,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: message.isSelf ? alpha('#fff', 0.9) : theme.palette.text.secondary,
                  }}
                >
                  {replyTo.authorName}
                </Typography>
                <Typography
                  noWrap
                  sx={{
                    fontSize: 12,
                    maxWidth: 220,
                    color: message.isSelf ? alpha('#fff', 0.8) : theme.palette.text.secondary,
                  }}
                >
                  {replyTo.text}
                </Typography>
              </Box>
            )}

            {editing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
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
                    bgcolor: alpha(theme.palette.common.black, 0.05),
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                    fontSize: 13,
                    color: 'inherit',
                    outline: 'none',
                    '&:focus': {
                      borderColor: theme.palette.primary.main,
                      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
                    },
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1, fontSize: 11 }}>
                  <Box
                    component="button"
                    onClick={saveEdit}
                    sx={{
                      ...linkButtonSx,
                      color: 'white',
                    }}
                  >
                    Save
                  </Box>
                  <Box
                    component="button"
                    onClick={cancelEdit}
                    sx={{
                      ...linkButtonSx,
                      color: theme.palette.text.primary,
                    }}
                  >
                    Cancel
                  </Box>
                </Box>
              </Box>
            ) : (
              <>
                {message.text}
                {message.editedAt && (
                  <Box
                    component="span"
                    sx={{
                      ml: 0.75,
                      fontSize: 10,
                      opacity: 0.65,
                      color: message.isSelf ? alpha('#fff', 0.7) : theme.palette.text.secondary,
                    }}
                  >
                    (edited)
                  </Box>
                )}
              </>
            )}
          </Box>

          {/* Reactions */}
          {!!message.reactions?.length && (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5,
                mt: 0.5,
                ml: message.isSelf ? 'auto' : 0,
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
                    py: 0.25,
                    fontSize: 11,
                    borderRadius: 5,
                    cursor: 'pointer',
                    bgcolor: r.reactedBySelf
                      ? alpha(theme.palette.primary.main, 0.12)
                      : theme.palette.action.hover,
                    border: `1px solid ${
                      r.reactedBySelf
                        ? alpha(theme.palette.primary.main, 0.3)
                        : alpha(theme.palette.divider, 0.2)
                    }`,
                    color: r.reactedBySelf
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      bgcolor: r.reactedBySelf
                        ? alpha(theme.palette.primary.main, 0.18)
                        : theme.palette.action.selected,
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

      {/* Reaction Popover */}
      <Popover
        open={Boolean(reactAnchor)}
        anchorEl={reactAnchor}
        onClose={() => setReactAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: {
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              boxShadow: theme.shadows[8],
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {QUICK_REACTIONS.map((emoji) => (
            <IconButton
              key={emoji}
              size="small"
              onClick={() => pickReaction(emoji)}
              sx={{
                fontSize: 18,
                borderRadius: 3,
                transition: 'all 0.15s ease',
                '&:hover': {
                  transform: 'scale(1.2)',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
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

const linkButtonSx = {
  border: 'none',
  bgcolor: 'transparent',
  cursor: 'pointer',
  fontWeight: 700,
  p: 0,
  fontSize: 11,
  transition: 'all 0.15s ease',
  '&:hover': {
    opacity: 1,
    textDecoration: 'underline',
  },
} as const;

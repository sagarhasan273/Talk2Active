import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle,
  CornerUpLeft,
  Info,
  Pencil,
  Reply,
  Smile,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import {
  alpha,
  Box,
  Fade,
  IconButton,
  Popover,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

import type { SocialChatMessage } from '@/types/type-social';
import {
  formatMessageTime,
  SOCIAL_QUICK_REACTIONS,
  systemColorMap,
} from '@/utils/social-chat-helper';

interface SocialMessageBubbleProps {
  message: SocialChatMessage;
  replyTo?: SocialChatMessage;
  onReply?: (message: SocialChatMessage) => void;
  onEdit?: (id: string, text: string) => void;
  onReact?: (id: string, emoji: string) => void;
}

const entranceAnimationSx = {
  '@keyframes socialMsgAppear': {
    from: { opacity: 0, transform: 'translate3d(0, 6px, 0)' },
    to: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
  },
  animation: 'socialMsgAppear 0.18s cubic-bezier(0.22, 1, 0.36, 1)',
};

const SocialMessageBubbleComponent: React.FC<SocialMessageBubbleProps> = ({
  message,
  replyTo,
  onReply,
  onEdit,
  onReact,
}) => {
  const t = useTheme();
  const isDark = t.palette.mode === 'dark';

  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.text);
  const [reactAnchor, setReactAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setDraft(message.text);
  }, [message.text]);

  // 1. System Notification Pill
  if (message.isSystem) {
    const sysColor = systemColorMap(t)[message.systemType || 'info'];
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          my: 0.75,
          ...entranceAnimationSx,
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 0.5,
            borderRadius: 999,
            bgcolor: alpha(sysColor, isDark ? 0.12 : 0.08),
            border: `1px solid ${alpha(sysColor, 0.24)}`,
            color: sysColor,
            maxWidth: '88%',
            boxShadow: `0 2px 8px ${alpha(sysColor, 0.08)}`,
          }}
        >
          {message.systemType === 'success' && <CheckCircle size={13} />}
          {message.systemType === 'warning' && <AlertTriangle size={13} />}
          {message.systemType === 'error' && <AlertCircle size={13} />}
          {(!message.systemType || message.systemType === 'info') && <Info size={13} />}
          <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.01em' }}>
            {message.text}
          </Typography>
        </Box>
      </Box>
    );
  }

  const isSelf = Boolean(message.isSelf);

  const handleSave = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== message.text) {
      onEdit?.(message.id, trimmed);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(message.text);
    setEditing(false);
  };

  const showActions = (hovered || Boolean(reactAnchor)) && !editing;

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isSelf ? 'flex-end' : 'flex-start',
        alignSelf: isSelf ? 'flex-end' : 'flex-start',
        maxWidth: '82%',
        my: 0.15,
        ...entranceAnimationSx,
      }}
    >
      {/* Author Label (Incoming Messages) */}
      {!isSelf && message.authorName && (
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: 'text.secondary',
            ml: 1,
            mb: 0.35,
            lineHeight: 1.1,
          }}
        >
          {message.authorName}
        </Typography>
      )}

      <Box sx={{ position: 'relative', maxWidth: '100%' }}>
        {/* Floating Quick Actions Pill */}
        <Fade in={showActions} timeout={140}>
          <Box
            sx={{
              position: 'absolute',
              top: -15,
              ...(isSelf ? { right: 6 } : { left: 6 }),
              display: 'flex',
              alignItems: 'center',
              gap: 0.25,
              px: 0.5,
              py: 0.25,
              bgcolor: isDark ? alpha('#0F172A', 0.94) : alpha('#FFFFFF', 0.96),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${isDark ? alpha('#fff', 0.12) : alpha('#000', 0.08)
                }`,
              borderRadius: 999,
              boxShadow: isDark
                ? '0 6px 16px rgba(0,0,0,0.55)'
                : '0 4px 14px rgba(15, 23, 42, 0.12)',
              zIndex: 12,
              pointerEvents: showActions ? 'auto' : 'none',
            }}
          >
            <Tooltip title="React" placement="top" arrow>
              <IconButton
                size="small"
                onClick={(e) => setReactAnchor(e.currentTarget)}
                sx={{
                  p: 0.45,
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'warning.main',
                    bgcolor: alpha(t.palette.warning.main, 0.12),
                  },
                }}
              >
                <Smile size={13} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Reply" placement="top" arrow>
              <IconButton
                size="small"
                onClick={() => onReply?.(message)}
                sx={{
                  p: 0.45,
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: alpha(t.palette.primary.main, 0.12),
                  },
                }}
              >
                <Reply size={13} />
              </IconButton>
            </Tooltip>

            {isSelf && (
              <Tooltip title="Edit" placement="top" arrow>
                <IconButton
                  size="small"
                  onClick={() => setEditing(true)}
                  sx={{
                    p: 0.45,
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'info.main',
                      bgcolor: alpha(t.palette.info.main, 0.12),
                    },
                  }}
                >
                  <Pencil size={13} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Fade>

        {/* Message Bubble Shell */}
        <Box
          sx={{
            position: 'relative',
            px: 1.5,
            py: 0.9,
            borderRadius: isSelf
              ? '16px 16px 4px 16px'
              : '16px 16px 16px 4px',
            fontSize: 13,
            lineHeight: 1.45,
            wordBreak: 'break-word',
            transition: 'box-shadow 0.15s ease',
            ...(isSelf
              ? {
                background: `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.primary.dark} 100%)`,
                color: t.palette.primary.contrastText,
                boxShadow: `0 4px 14px -2px ${alpha(t.palette.primary.main, 0.35)}`,
              }
              : {
                bgcolor: isDark ? alpha('#1E293B', 0.85) : '#FFFFFF',
                border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#0F172A', 0.07)
                  }`,
                color: 'text.primary',
                boxShadow: isDark
                  ? '0 2px 8px rgba(0, 0, 0, 0.25)'
                  : '0 2px 6px rgba(15, 23, 42, 0.04)',
              }),
          }}
        >
          {/* Quoted Reply Block */}
          {replyTo && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                mb: 0.65,
                px: 1,
                py: 0.45,
                borderLeft: `3px solid ${isSelf ? alpha('#fff', 0.85) : t.palette.primary.main
                  }`,
                bgcolor: isSelf
                  ? alpha('#000', 0.18)
                  : isDark
                    ? alpha(t.palette.primary.main, 0.12)
                    : alpha(t.palette.primary.main, 0.06),
                borderRadius: '4px 8px 8px 4px',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.1 }}>
                <CornerUpLeft
                  size={10}
                  style={{
                    opacity: 0.8,
                    color: isSelf ? '#fff' : t.palette.primary.main,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: isSelf ? '#fff' : 'primary.main',
                    lineHeight: 1.2,
                  }}
                  noWrap
                >
                  {replyTo.authorName || 'Message'}
                </Typography>
              </Box>
              <Typography
                noWrap
                sx={{
                  fontSize: 11.5,
                  maxWidth: 220,
                  color: isSelf ? alpha('#fff', 0.85) : 'text.secondary',
                  lineHeight: 1.3,
                }}
              >
                {replyTo.text}
              </Typography>
            </Box>
          )}

          {/* Inline Edit Mode vs. Standard Message Content */}
          {editing ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                minWidth: 190,
              }}
            >
              <Box
                component="input"
                autoFocus
                value={draft}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDraft(e.target.value)
                }
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  bgcolor: alpha('#000', 0.22),
                  border: `1px solid ${alpha('#fff', 0.35)}`,
                  borderRadius: 1.25,
                  px: 1,
                  py: 0.45,
                  fontSize: 12.5,
                  color: '#fff',
                  outline: 'none',
                  '&:focus': {
                    borderColor: '#fff',
                    bgcolor: alpha('#000', 0.3),
                  },
                }}
              />
              <IconButton
                size="small"
                onClick={handleSave}
                sx={{
                  p: 0.45,
                  bgcolor: alpha('#fff', 0.2),
                  color: '#fff',
                  '&:hover': { bgcolor: alpha('#fff', 0.32) },
                }}
                title="Save (Enter)"
              >
                <Check size={13} />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleCancel}
                sx={{
                  p: 0.45,
                  color: alpha('#fff', 0.8),
                  '&:hover': { bgcolor: alpha('#000', 0.2), color: '#fff' },
                }}
                title="Cancel (Esc)"
              >
                <X size={13} />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ position: 'relative' }}>
              <Box component="span" sx={{ whiteSpace: 'pre-wrap' }}>
                {message.text}
              </Box>

              {/* Inline Floating Timestamp & Edited Meta */}
              <Box
                component="span"
                sx={{
                  float: 'right',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.4,
                  ml: 1,
                  mt: 0.45,
                  fontSize: 9.5,
                  fontWeight: 600,
                  lineHeight: 1,
                  opacity: isSelf ? 0.78 : 0.55,
                  userSelect: 'none',
                  color: 'inherit',
                }}
              >
                {message.editedAt && <span>edited</span>}
                {message.createdAt && (
                  <span>{formatMessageTime(message.createdAt)}</span>
                )}
              </Box>
            </Box>
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
              justifyContent: isSelf ? 'flex-end' : 'flex-start',
            }}
          >
            {message.reactions.map((r) => (
              <Box
                key={r.emoji}
                component="button"
                onClick={() => onReact?.(message.id, r.emoji)}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.4,
                  px: 0.75,
                  py: 0.2,
                  fontSize: 11,
                  borderRadius: 999,
                  cursor: 'pointer',
                  border: '1px solid',
                  bgcolor: r.reactedBySelf
                    ? alpha(t.palette.primary.main, isDark ? 0.22 : 0.12)
                    : isDark
                      ? alpha('#1E293B', 0.9)
                      : '#FFFFFF',
                  borderColor: r.reactedBySelf
                    ? alpha(t.palette.primary.main, 0.55)
                    : isDark
                      ? alpha('#fff', 0.1)
                      : alpha('#000', 0.08),
                  color: r.reactedBySelf
                    ? t.palette.primary.main
                    : t.palette.text.secondary,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  transition: 'all 0.14s ease',
                  '&:hover': {
                    transform: 'translateY(-1px) scale(1.05)',
                    borderColor: t.palette.primary.main,
                  },
                }}
              >
                <span style={{ lineHeight: 1 }}>{r.emoji}</span>
                <span style={{ fontWeight: 800, fontSize: 10 }}>{r.count}</span>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Quick Reaction Popover (Elevated Z-Index for Floating Windows) */}
      <Popover
        open={Boolean(reactAnchor)}
        anchorEl={reactAnchor}
        onClose={() => setReactAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        style={{ zIndex: 9999 }}
        slotProps={{
          paper: {
            sx: {
              border: `1px solid ${isDark ? alpha('#fff', 0.12) : alpha('#000', 0.08)
                }`,
              borderRadius: 999,
              bgcolor: isDark ? alpha('#0F172A', 0.95) : alpha('#FFFFFF', 0.98),
              backdropFilter: 'blur(12px)',
              boxShadow: t.shadows[10],
              px: 0.6,
              py: 0.35,
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
          {SOCIAL_QUICK_REACTIONS.map((emoji) => (
            <IconButton
              key={emoji}
              size="small"
              onClick={() => {
                onReact?.(message.id, emoji);
                setReactAnchor(null);
              }}
              sx={{
                fontSize: 16,
                width: 30,
                height: 30,
                borderRadius: '50%',
                transition: 'transform 0.14s cubic-bezier(0.34, 1.56, 0.64, 1)',
                '&:hover': {
                  transform: 'scale(1.28)',
                  bgcolor: alpha(t.palette.primary.main, 0.1),
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

export const SocialMessageBubble = React.memo(SocialMessageBubbleComponent);
export default SocialMessageBubble;

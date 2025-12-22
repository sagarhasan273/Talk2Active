import type { Message, MessageOnReply } from 'src/types/type-room';

import React, { useState } from 'react';

import { Box, Menu, Tooltip, IconButton } from '@mui/material';
import {
  Edit as EditIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon,
  AddReaction as AddReactionIcon,
} from '@mui/icons-material';

import { varAlpha } from 'src/theme/styles';

interface MessageActionsProps {
  message: Message;
  onEdit: any;
  onReply?: (message: MessageOnReply) => void;
  onResend?: any;
  onDelete: any;
  onReaction?: (id: Message['id'], emoji: string) => void;
}

// Important emojis for quick reactions
const IMPORTANT_EMOJIS = ['👍', '👎', '❤️', '😂', '😮', '😢', '🙏'];

export const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  onEdit,
  onReply,
  onResend,
  onDelete,
  onReaction,
}) => {
  const [reactionMenuEl, setReactionMenuEl] = useState<null | HTMLElement>(null);
  const [showActions, setShowActions] = useState(false);

  const handleReactionMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setReactionMenuEl(event.currentTarget);
  };

  const handleReactionMenuClose = () => {
    setReactionMenuEl(null);
  };

  const handleEmojiClick = (emoji: string) => {
    onReaction?.(message.id, emoji);
    handleReactionMenuClose();
  };

  const handleReply = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    onReply?.({ id: message.id, text: message.text, name: message.userInfo.name });
  };

  const handleDelete = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    onDelete(message.id);
  };

  return (
    <>
      {/* Desktop Actions - Visible on hover */}
      <Box
        className="message-actions"
        sx={{
          display: { xs: 'flex', md: 'flex' },
          alignItems: 'center',
          gap: 0.5,
          ml: 1,
          mr: 0.1,
          opacity: showActions ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {message.sender === 'me' ? (
          // Self message actions
          <>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={onEdit}
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 1,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  backgroundColor: (theme) =>
                    varAlpha(theme.vars.palette.background.paperChannel, 1),
                  '&:hover': {
                    backgroundColor: 'active.hover',
                    color: (theme) => `${theme.vars.palette.error.mainChannel} !important`,
                  },
                }}
              >
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={handleDelete}
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 1,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  color: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.8),
                  backgroundColor: (theme) =>
                    varAlpha(theme.vars.palette.background.paperChannel, 1),
                  '&:hover': {
                    backgroundColor: 'active.hover',
                    color: (theme) => `${theme.palette.error.main} !important`,
                  },
                }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          // Them message actions
          <>
            <Tooltip title="Reply">
              <IconButton
                size="small"
                onClick={handleReply}
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 1,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  backgroundColor: (theme) =>
                    varAlpha(theme.vars.palette.background.paperChannel, 0.8),
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    color: (theme) => `${theme.vars.palette.background.paperChannel} !important`,
                  },
                }}
              >
                <ReplyIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>

            {/* Reaction button with emoji menu */}
            <Tooltip title="Add reaction">
              <IconButton
                size="small"
                onClick={handleReactionMenuOpen}
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 1,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  backgroundColor: (theme) =>
                    varAlpha(theme.vars.palette.background.paperChannel, 0.8),
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    color: (theme) => `${theme.vars.palette.background.paperChannel} !important`,
                  },
                }}
              >
                <AddReactionIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      {/* Reaction Emoji Menu */}
      <Menu
        anchorEl={reactionMenuEl}
        open={Boolean(reactionMenuEl)}
        onClose={handleReactionMenuClose}
        PaperProps={{
          sx: {
            p: 1,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            borderRadius: 2,
          },
        }}
      >
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {IMPORTANT_EMOJIS.map((emoji) => (
            <IconButton
              key={emoji}
              size="small"
              onClick={() => handleEmojiClick(emoji)}
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                fontSize: 18,
                '&:hover': {
                  backgroundColor: 'action.hover',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {emoji}
            </IconButton>
          ))}
        </Box>
      </Menu>
    </>
  );
};

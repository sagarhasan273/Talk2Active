import type { Message } from 'src/types/type-room';

import React, { useState } from 'react';

import { Box, Menu, Tooltip, MenuItem, Typography, IconButton } from '@mui/material';
import {
  Edit as EditIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  AddReaction as AddReactionIcon,
} from '@mui/icons-material';

import { varAlpha } from 'src/theme/styles';

interface MessageActionsProps {
  message: Message;
  onEdit: any;
  onReply: any;
  onResend?: any;
  onDelete: any;
  onReaction: (emoji: string) => void;
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [reactionMenuEl, setReactionMenuEl] = useState<null | HTMLElement>(null);
  const [showActions, setShowActions] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleReactionMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setReactionMenuEl(event.currentTarget);
  };

  const handleReactionMenuClose = () => {
    setReactionMenuEl(null);
  };

  const handleEmojiClick = (emoji: string) => {
    onReaction(emoji);
    handleReactionMenuClose();
  };

  // Count reactions by emoji
  const reactionCounts =
    message.reactions?.reduce((acc: Record<string, number>, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    }, {}) || {};

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
                onClick={onDelete}
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
                onClick={onReply}
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

        {/* Display existing reactions with counts */}
        {Object.keys(reactionCounts).length > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              ml: 1,
              backgroundColor: 'background.paper',
              borderRadius: 4,
              px: 1,
              py: 0.5,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <Tooltip key={emoji} title={`${count} reaction${count > 1 ? 's' : ''}`}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.25,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderRadius: 1,
                    },
                  }}
                  onClick={() => handleEmojiClick(emoji)}
                >
                  <Typography sx={{ fontSize: 14 }}>{emoji}</Typography>
                  {count > 1 && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: 10,
                        color: 'text.secondary',
                        fontWeight: 600,
                      }}
                    >
                      {count}
                    </Typography>
                  )}
                </Box>
              </Tooltip>
            ))}
          </Box>
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

      {/* Mobile Actions - Menu Button */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          opacity: showActions ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          sx={{
            width: 28,
            height: 28,
            backgroundColor: 'background.paper',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <MoreVertIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* Mobile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          sx: {
            minWidth: 160,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            borderRadius: 2,
          },
        }}
      >
        {message.sender === 'me' ? (
          <>
            <MenuItem onClick={onEdit}>
              <EditIcon sx={{ fontSize: 18, mr: 1.5 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={onDelete}>
              <DeleteIcon sx={{ fontSize: 18, mr: 1.5 }} />
              Delete
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={onReply}>
              <ReplyIcon sx={{ fontSize: 18, mr: 1.5 }} />
              Reply
            </MenuItem>
            <MenuItem onClick={handleReactionMenuOpen}>
              <AddReactionIcon sx={{ fontSize: 18, mr: 1.5 }} />
              Add Reaction
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

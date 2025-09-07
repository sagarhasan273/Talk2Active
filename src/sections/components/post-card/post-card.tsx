import type { Post as PostType } from 'src/types/post';

import React, { useState } from 'react';
import { Heart, Repeat2, MessageCircle } from 'lucide-react';

import { Box, Card, Avatar, Button, TextField, Typography } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { InteractionButton } from '../interaction-button';

import type { PostCardProps } from './types';

export const PostCard: React.FC<PostCardProps> = ({ post, onLike, onRepost }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'now';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      setNewComment('');
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        backgroundColor: 'background.neutral',
        border: (theme) => `1px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.18)}`,
        boxShadow: (theme) =>
          `0px 2px 8px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.28)}`,
        transition: 'box-shadow 0.3s ease-in-out',
      }}
    >
      <Box px={2} py={1}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              src={post.authorDetails?.profilePhoto}
              alt={post.authorDetails?.name}
              sx={{
                width: 48,
                height: 48,
                border: (theme) =>
                  `2px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.18)}`,
              }}
            />
            <Box>
              <Typography fontWeight={600}>{post.authorDetails?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                @{post.authorDetails?.username} · {formatTime(new Date(post.createdAt))}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="small"
            sx={{
              background: (theme) =>
                `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              color: 'common.white',
              borderRadius: 6,
              '&:hover': {
                background: (theme) =>
                  `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              },
            }}
          >
            Follow
          </Button>
        </Box>

        {/* Content */}
        <Typography
          variant="h6"
          fontWeight={500}
          color="text.primary"
          sx={{ mb: 2, fontSize: '1.125rem', lineHeight: 1.6 }}
        >
          “{post.media.content}”
        </Typography>

        {/* Interactions */}
        <Box
          display="flex"
          justifyContent="space-between"
          pt={1}
          sx={{
            borderTop: (theme) =>
              `1px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.18)}`,
          }}
        >
          <InteractionButton
            icon={Heart}
            count={post.engagement.likes}
            isActive={post.isLiked}
            onClick={() => onLike(post.id)}
            activeColor="error"
            hoverColor="error"
            label={`${post.isLiked ? 'Unlike' : 'Like'} post`}
          />
          <InteractionButton
            icon={Repeat2}
            count={post.engagement.dislikes}
            isActive={post.isDisliked}
            onClick={() => onRepost(post.id)}
            activeColor="success"
            hoverColor="success"
            label={`${post.isDisliked ? 'Undo dislike' : 'Dislike'} post`}
          />
        </Box>

        {/* Comments */}
        {showComments && (
          <Box
            mt={1}
            pt={2}
            sx={{
              borderTop: (theme) =>
                `1px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.18)}`,
            }}
          >
            {/* Comment Form */}
            <Box
              component="form"
              onSubmit={handleCommentSubmit}
              display="flex"
              gap={2}
              alignItems="center"
              mb={3}
            >
              <Avatar
                src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
                sx={{
                  width: 32,
                  height: 32,
                  border: (theme) =>
                    `2px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.18)}`,
                }}
              />
              <TextField
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                fullWidth
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: 999,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 999,
                  },
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Card>
  );
};

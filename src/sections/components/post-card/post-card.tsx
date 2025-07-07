import type { Post as PostType } from 'src/types/post';

import React, { useState } from 'react';
import { Heart, Repeat2, MessageCircle } from 'lucide-react';

import { Box, Card, Avatar, Button, TextField, Typography } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { InteractionButton } from '../interaction-button';

import type { PostCardProps } from './types';

export const PostCard: React.FC<PostCardProps> = ({ post, onLike, onRepost, onComment }) => {
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
      onComment(post.id, newComment.trim());
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
      }}
    >
      {/* Repost Header */}
      {post.repostedBy && (
        <Box px={3} pt={2} pb={1}>
          <Box display="flex" alignItems="center" gap={1} fontSize={13} color="text.secondary">
            <Repeat2 size={16} color="#22c55e" />
            <Typography variant="body2" fontWeight={500} color="success.main">
              {post.repostedBy.name}
            </Typography>
            <Typography variant="body2">
              reposted · {formatTime(post.repostedBy.timestamp)}
            </Typography>
          </Box>
        </Box>
      )}

      <Box px={2} py={1}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              src={post.author.avatar}
              alt={post.author.name}
              sx={{
                width: 48,
                height: 48,
                border: (theme) =>
                  `2px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.18)}`,
              }}
            />
            <Box>
              <Typography fontWeight={600}>{post.author.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                @{post.author.username} · {formatTime(post.timestamp)}
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
          “{post.content}”
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
            count={post.likes}
            isActive={post.isLiked}
            onClick={() => onLike(post.id)}
            activeColor="error"
            hoverColor="error"
            label={`${post.isLiked ? 'Unlike' : 'Like'} post`}
          />
          <InteractionButton
            icon={MessageCircle}
            count={post.comments.length}
            isActive={showComments}
            onClick={() => setShowComments(!showComments)}
            activeColor="secondary"
            hoverColor="secondary"
            label="View comments"
          />
          <InteractionButton
            icon={Repeat2}
            count={post.reposts}
            isActive={post.isReposted}
            onClick={() => onRepost(post.id)}
            activeColor="success"
            hoverColor="success"
            label={`${post.isReposted ? 'Unrepost' : 'Repost'} post`}
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

            {/* Comment List */}
            <Box display="flex" flexDirection="column" gap={2}>
              {post.comments.map((comment: PostType['comments'][number]) => (
                <Box key={comment.id} display="flex" gap={2}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'linear-gradient(to bottom right, #a78bfa, #f472b6)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: 14,
                    }}
                  >
                    {comment.author.name[0]}
                  </Box>
                  <Box flex={1}>
                    <Box
                      sx={{
                        backgroundColor: 'background.neutral',
                        borderRadius: 3,
                        px: 2,
                        py: 1.5,
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                          {comment.author.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          @{comment.author.username}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          · {formatTime(comment.timestamp)}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{comment.content}</Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Card>
  );
};

import type { Post as PostType } from 'src/types/post';

import React, { useState } from 'react';
import { Heart, Repeat2, MessageCircle, MoreHorizontal } from 'lucide-react';

import { Box, Paper, Avatar, TextField, IconButton, Typography } from '@mui/material';

import { InteractionButton } from './interaction-button';

interface PostProps {
  post: PostType;
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
}

export const Post: React.FC<PostProps> = ({ post, onLike, onRepost, onComment }) => {
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
    <Paper
      elevation={1}
      sx={{
        borderRadius: 4,
        mb: 3,
        transition: '0.3s',
        border: '1px solid #f3f4f6',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0px 4px 12px rgba(168, 85, 247, 0.15)',
        },
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

      <Box px={3} py={2}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              src={post.author.avatar}
              alt={post.author.name}
              sx={{ width: 48, height: 48, border: '2px solid #e9d5ff' }}
            />
            <Box>
              <Typography fontWeight={600}>{post.author.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                @{post.author.username} · {formatTime(post.timestamp)}
              </Typography>
            </Box>
          </Box>
          <IconButton>
            <MoreHorizontal size={20} color="#9ca3af" />
          </IconButton>
        </Box>

        {/* Content */}
        <Typography
          variant="body1"
          fontWeight={500}
          color="text.primary"
          sx={{ mb: 2, fontSize: '1.125rem', lineHeight: 1.6 }}
        >
          “{post.content}”
        </Typography>

        {/* Interactions */}
        <Box display="flex" justifyContent="space-between" pt={2} borderTop="1px solid #f3f4f6">
          <InteractionButton
            icon={Heart}
            count={post.likes}
            isActive={post.isLiked}
            onClick={() => onLike(post.id)}
            activeColor="#ef4444"
            hoverColor="#f87171"
            label={`${post.isLiked ? 'Unlike' : 'Like'} post`}
          />
          <InteractionButton
            icon={Repeat2}
            count={post.reposts}
            isActive={post.isReposted}
            onClick={() => onRepost(post.id)}
            activeColor="#22c55e"
            hoverColor="#4ade80"
            label={`${post.isReposted ? 'Unrepost' : 'Repost'} post`}
          />
          <InteractionButton
            icon={MessageCircle}
            count={post.comments.length}
            isActive={showComments}
            onClick={() => setShowComments(!showComments)}
            activeColor="#3b82f6"
            hoverColor="#60a5fa"
            label="View comments"
          />
        </Box>

        {/* Comments */}
        {showComments && (
          <Box mt={4} pt={2} borderTop="1px solid #f3f4f6">
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
                sx={{ width: 32, height: 32, border: '2px solid #e9d5ff' }}
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
                        backgroundColor: '#f9fafb',
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
    </Paper>
  );
};

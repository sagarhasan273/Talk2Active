import type { Post as PostType } from 'src/types/post';

import React, { useState } from 'react';
import { Heart, Repeat2, MessageCircle, HeartOff, HeartCrack } from 'lucide-react';

import { Box, Card, Avatar, Button, TextField, Typography, Stack, useTheme } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { InteractionButton } from '../interaction-button';

import type { PostCardProps } from './types';

export const PostCard: React.FC<PostCardProps> = ({ post, onLike, onDislike, onRepost }) => {
  const theme = useTheme();

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'now';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        backgroundColor: 'background.neutral',
        border: `1px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.18)}`,
        boxShadow:
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
                border:
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
              background:
                `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              color: 'common.white',
              borderRadius: 6,
              '&:hover': {
                background:
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
            borderTop:
              `1px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.18)}`,
          }}
        >
          <Stack direction="row" spacing={1}>
            <InteractionButton
              icon='fluent:heart-24-regular'
              activeIcon='fluent:heart-24-filled'
              count={post.engagement.likes}
              isActive={post.isLiked}
              onClick={() => onLike(post.id)}
              activeColor="primary"
              hoverColor="primary"
              label={`${post.isLiked ? 'Unlike' : 'Like'} post`}
            />
            <InteractionButton
              icon='fluent:heart-broken-24-regular'
              activeIcon='fluent:heart-broken-24-filled'
              count={post.engagement.dislikes}
              isActive={post.isDisliked}
              onClick={() => onDislike(post.id)}
              activeColor="error"
              hoverColor="error"
              label={`${post.isDisliked ? 'Unlike' : 'Like'} post`}
            />
          </Stack>
          <InteractionButton
            icon='mdi:repost'
            count={post.engagement.reposts}
            isActive={post.isReposted}
            onClick={() => onRepost(post.id)}
            activeColor="success"
            hoverColor="success"
            label={`${post.isReposted ? 'Undo dislike' : 'Dislike'} post`}
          />
        </Box>
      </Box>
    </Card>
  );
};

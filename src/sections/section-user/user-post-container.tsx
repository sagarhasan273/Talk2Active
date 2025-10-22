import type { PostResponseType } from 'src/types/post';

import { useState, useEffect } from 'react';

import { Box } from '@mui/material';

import { useUserContext } from 'src/routes/route-components';

import {
  useGetPostsQuery,
  useUpdatePostEngagementPinMutation,
  useUpdatePostEngagementLikeMutation,
  useUpdatePostEngagementDisikeMutation,
} from 'src/core/apis';

import { PostCard } from '../section-components/post-card';

export function UserPostContainer() {
  const { user } = useUserContext();

  const [posts, setPosts] = useState<PostResponseType[]>([]);

  const { data, isLoading, isError } = useGetPostsQuery({ userId: user?.id || '' });

  const [updatePostLike] = useUpdatePostEngagementLikeMutation();
  const [updatePostDislike] = useUpdatePostEngagementDisikeMutation();
  const [updatePinpost] = useUpdatePostEngagementPinMutation();

  const handleLike = async (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              isDisliked: false,

              engagement: {
                ...post.engagement,
                likes: post.isLiked ? post.engagement.likes - 1 : post.engagement.likes + 1,
                dislikes: post.isDisliked ? post.engagement.dislikes - 1 : post.engagement.dislikes,
              },
            }
          : post
      )
    );
    try {
      await updatePostLike({
        postId,
        userId: user?.id,
      }).unwrap();
    } catch (error) {
      console.error('Failed to update like status:', error);
    }
  };

  const handleDislike = async (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: false,
              isDisliked: !post.isDisliked,

              engagement: {
                ...post.engagement,
                likes: post.isLiked ? post.engagement.likes - 1 : post.engagement.likes,
                dislikes: post.isDisliked
                  ? post.engagement.dislikes - 1
                  : post.engagement.dislikes + 1,
              },
            }
          : post
      )
    );
    try {
      await updatePostDislike({
        postId,
        userId: user?.id,
      }).unwrap();
    } catch (error) {
      console.error('Failed to update like status:', error);
    }
  };

  const handlePinpost = async (postId: string) => {
    setPosts((prevPosts) => {
      const postToRepost = prevPosts.find((p) => p.id === postId);
      if (!postToRepost) return prevPosts;

      const updatedPosts = prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isPinned: !post.isPinned,
              engagement: {
                ...post.engagement,
                pins: post.isPinned ? post.engagement.pins - 1 : post.engagement.pins + 1,
              },
            }
          : post
      );

      return updatedPosts;
    });

    try {
      await updatePinpost({
        postId,
        userId: user?.id,
      }).unwrap();
    } catch (error) {
      console.error('Failed to update Pin status:', error);
    }
  };

  useEffect(() => {
    if (data && !isLoading && !isError) {
      setPosts(data.data);
    }
  }, [data, isLoading, isError]);

  return (
    <Box display="flex" flexDirection="column" sx={{ p: 0.5 }} gap={2}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={handleLike}
          onDislike={handleDislike}
          onRepost={handlePinpost}
        />
      ))}
    </Box>
  );
}

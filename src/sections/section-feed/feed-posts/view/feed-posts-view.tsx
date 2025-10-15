import type { PostResponseType } from 'src/types/post';

import React, { useState, useEffect } from 'react';

import { Box, Container } from '@mui/material';

import { useUserContext } from 'src/routes/route-components';

import { useResponsive } from 'src/hooks/use-responsive';

import {
  useGetPostsQuery,
  useUpdatePostEngagementPinMutation,
  useUpdatePostEngagementLikeMutation,
  useUpdatePostEngagementDisikeMutation,
} from 'src/core/apis/api-post';

import { PostCard } from 'src/sections/section-components/post-card';
import { CreatePost } from 'src/sections/section-components/create-post';

import { FeedPostsHeader } from '../feed-posts-header';
import { DiscoveryPanel } from '../../feed-discovery-panal';
import { CategorySidebarView } from '../../feed-catagory-sidebar';

export function FeedPostsView() {
  const { user } = useUserContext();

  const mid = useResponsive('down', 'lg');
  const small = useResponsive('down', 'md');

  const [posts, setPosts] = useState<PostResponseType[]>([]);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  const handleCreatePost = (content: string) => {
    setPosts((prevPosts) => [...prevPosts]);
  };

  useEffect(() => {
    if (data && !isLoading && !isError) {
      setPosts(data.data);
    }
  }, [data, isLoading, isError]);

  return (
    <>
      {/* Main Content */}
      <Container
        maxWidth="lg"
        sx={{ px: 0, pb: 0, height: 'calc(100vh - 65px)', overflowY: 'hidden' }}
      >
        <Box
          sx={{
            height: '100%',
            mx: 'auto',
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr',
              md: 'auto auto',
              lg: '1fr 550px 1fr',
            },
            px: { xs: 0, sm: 2 },
            gridTemplateRows: 'auto',
            gap: 2,
            overflowY: 'hidden',
          }}
        >
          {!mid && (
            <Box
              sx={{
                py: 2,
                height: '100%',
                overflowY: 'auto',
              }}
            >
              <CategorySidebarView
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />
            </Box>
          )}
          <Box
            sx={{ py: 2, ml: 'auto', height: '100%', overflowY: 'auto', width: 1, maxWidth: 560 }}
          >
            <FeedPostsHeader
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              setIsCreatePostOpen={setIsCreatePostOpen}
            />
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
          </Box>
          {!small && (
            <Box sx={{ py: 2, height: '100%', overflowY: 'auto', maxWidth: 320 }}>
              <DiscoveryPanel />
            </Box>
          )}
        </Box>
      </Container>

      {/* Create Post Modal */}
      <CreatePost
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSubmit={handleCreatePost}
      />
    </>
  );
}

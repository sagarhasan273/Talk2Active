import type { PostResponseType, Post as PostType } from 'src/types/post';

import React, { useEffect, useState } from 'react';
import { Plus, Quote } from 'lucide-react';

import { Box, Stack, useTheme, Container, Typography, IconButton } from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';

import { useGetPostsQuery } from 'src/services/slices/post-api';

import { PostCard } from '../components/post-card';
import { CreatePost } from '../components/create-post';
import { DiscoveryPanel } from './feed-discovery-panal';
import { CategorySidebarView } from './feed-catagory-sidebar';

import { DiscoveryPanalDrawer } from './feed-discovery-panal/discovery-panal-drawer';
import { CategorySidebarDrawer } from './feed-catagory-sidebar/catagory-sidebar-drawer';

export const FeedPosts: React.FC = () => {
  const theme = useTheme();

  const [posts, setPosts] = useState<PostResponseType[]>([]);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data, isLoading, isError } = useGetPostsQuery();

  const handleLike = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
            ...post,
            isLiked: !post.isLiked,

            engagement: {
              ...post.engagement,
              likes: post.isLiked ? post.engagement.likes - 1 : post.engagement.likes + 1,
            }
          }
          : post
      )
    );
  };

  const handleRepost = (postId: string) => {
    setPosts((prevPosts) => {
      const postToRepost = prevPosts.find((p) => p.id === postId);
      if (!postToRepost) return prevPosts;

      const updatedPosts = prevPosts.map((post) =>
        post.id === postId
          ? {
            ...post,
            isDisliked: !post.isDisliked,
            engagement: {
              ...post.engagement,
              dislikes: post.isDisliked ? post.engagement.dislikes - 1 : post.engagement.dislikes + 1,
            }
          }
          : post
      );

      return updatedPosts;
    });
  };

  const handleCreatePost = (content: string) => {
    setPosts((prevPosts) => [...prevPosts]);
  };

  const mid = useResponsive('down', 'lg');
  const small = useResponsive('down', 'md');

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
              md: '1fr 300px',
              lg: '1fr 550px 1fr',
            },
            px: { xs: 2, sm: 2 },
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
          <Box sx={{ py: 2, ml: 'auto', height: '100%', overflowY: 'auto', width: 1 }}>
            <Box
              sx={{
                m: 'auto',
                pb: 2,
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1,
                width: "100%"
              }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: '50%',
                  background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',

                }}
              >
                <Quote size={24} color="white" />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Wisdom Feed
              </Typography>
              <Stack direction="row" sx={{ ml: 'auto', gap: 1 }}>
                {small && (
                  <DiscoveryPanalDrawer>
                    <DiscoveryPanel />
                  </DiscoveryPanalDrawer>
                )}
                {mid && (
                  <CategorySidebarDrawer>
                    <CategorySidebarView
                      selectedCategory={selectedCategory}
                      onCategorySelect={setSelectedCategory}
                    />
                  </CategorySidebarDrawer>
                )}
                {/* Floating Action Button */}
                <IconButton
                  onClick={() => setIsCreatePostOpen(true)}
                  sx={{
                    p: 1,
                    borderRadius: '50%',
                    color: 'white',
                    background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.light})`,
                    },
                  }}

                >
                  <Plus size={24} />
                </IconButton>
              </Stack>
            </Box>
            <Box display="flex" flexDirection="column" sx={{ p: 0.5 }} gap={3}>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onRepost={handleRepost}
                />
              ))}
            </Box>
          </Box>
          {!small && (
            <Box sx={{ py: 2, height: '100%', overflowY: 'auto' }}>
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
};

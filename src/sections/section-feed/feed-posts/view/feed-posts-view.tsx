import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Fab, Tooltip, useTheme, Container } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { useGetPostsQuery } from 'src/core/apis/api-post';
import { setPosts, selectPosts, useCredentials } from 'src/core/slices';

import { LoginPromptDialog } from 'src/components/custom-dialog';

import { PostCard } from 'src/sections/section-components/post-card';
import { CreatePost } from 'src/sections/section-components/create-post';

import { FeedPostsHeader } from '../feed-posts-header';
import { DiscoveryPanel } from '../../feed-discovery-panal';
import { CategorySidebarView } from '../../feed-catagory-sidebar';

export function FeedPostsView() {
  const theme = useTheme();

  const dispatch = useDispatch();

  const { user, isAuthenticated } = useCredentials();

  const posts = useSelector(selectPosts);

  const isAuthOpen = useBoolean();

  const mid = useResponsive('down', 'lg');
  const small = useResponsive('down', 'md');
  const isMobile = useResponsive('down', 'sm');

  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string[]>(user.tags || ['all']);

  const { data, isLoading, isError } = useGetPostsQuery({ userId: user?.id || '' });

  useEffect(() => {
    if (data && !isLoading && !isError) {
      dispatch(setPosts(data.data));
    }
  }, [data, isLoading, isError, dispatch]);

  const handleCreatePost = () => {
    if (isAuthenticated) {
      setIsCreatePostOpen(true);
    } else {
      isAuthOpen.onTrue();
    }
  };

  return (
    <>
      <Container
        maxWidth="lg"
        sx={{
          px: 0,
          pb: 0,
          height: 'calc(100vh - 54px)',
          overflowY: 'hidden',
        }}
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
            gap: 2,
            overflowY: 'hidden',
          }}
        >
          {/* Left — Category Sidebar */}
          {!mid && (
            <Box sx={{ py: 2, height: '100%', overflowY: 'auto' }}>
              <CategorySidebarView
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />
            </Box>
          )}

          {/* Center — Feed */}
          <Box
            sx={{
              py: 2,
              ml: 'auto',
              height: '100%',
              overflowY: 'auto',
              width: 1,
              maxWidth: 560,
              // hide scrollbar visually but keep scroll
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            <FeedPostsHeader
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              setIsCreatePostOpen={handleCreatePost}
            />

            <Box display="flex" flexDirection="column" sx={{ p: 0.5 }} gap={2}>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </Box>
          </Box>

          {/* Right — Discovery Panel */}
          {isAuthenticated && !small && (
            <Box sx={{ py: 2, height: '100%', overflowY: 'auto', maxWidth: 320 }}>
              <DiscoveryPanel />
            </Box>
          )}
        </Box>
      </Container>

      {/* Mobile FAB — only on small screens */}
      {isMobile && (
        <Tooltip title={isAuthenticated ? 'Create post' : 'Sign in to post'}>
          <Fab
            color="primary"
            onClick={handleCreatePost}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              boxShadow: `0 8px 24px ${theme.palette.primary.main}`,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              },
            }}
          >
            <Add />
          </Fab>
        </Tooltip>
      )}

      {/* Create Post Modal */}
      <CreatePost isOpen={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} />

      {/* Login Prompt */}
      <LoginPromptDialog openBoolean={isAuthOpen} />
    </>
  );
}

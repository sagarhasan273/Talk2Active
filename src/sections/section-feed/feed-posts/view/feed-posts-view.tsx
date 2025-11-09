import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, Container } from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';

import { useGetPostsQuery } from 'src/core/apis/api-post';
import { setPosts, selectPosts, selectAccount } from 'src/core/slices';

import { PostCard } from 'src/sections/section-components/post-card';
import { CreatePost } from 'src/sections/section-components/create-post';

import { FeedPostsHeader } from '../feed-posts-header';
import { DiscoveryPanel } from '../../feed-discovery-panal';
import { CategorySidebarView } from '../../feed-catagory-sidebar';

export function FeedPostsView() {
  const dispatch = useDispatch();

  const user = useSelector(selectAccount);
  const posts = useSelector(selectPosts);

  const mid = useResponsive('down', 'lg');
  const small = useResponsive('down', 'md');

  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string[]>(user.tags || ['all']);

  const { data, isLoading, isError } = useGetPostsQuery({ userId: user?.id || '' });

  useEffect(() => {
    if (data && !isLoading && !isError) {
      dispatch(setPosts(data.data));
    }
  }, [data, isLoading, isError, dispatch]);

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
                <PostCard key={post.id} post={post} />
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
      <CreatePost isOpen={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} />
    </>
  );
}

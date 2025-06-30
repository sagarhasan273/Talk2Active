import type { Post as PostType } from 'src/types/post';

import React, { useState } from 'react';
import { Plus, Quote } from 'lucide-react';

import { Box, Fab, Stack, useTheme, Container, Typography } from '@mui/material';

import { useResponsive } from 'src/hooks/use-responsive';

import { PostCard } from '../components/post-card';
import { initialPosts } from '../../_mock/data/posts';
import { CreatePost } from '../components/create-post';
import { DiscoveryPanel } from './feed-discovery-panal';
import { CategorySidebarView } from './feed-catagory-sidebar';
import { currentUserProfile } from '../../_mock/data/userProfile';
import { DiscoveryPanalDrawer } from './feed-discovery-panal/discovery-panal-drawer';
import { CategorySidebarDrawer } from './feed-catagory-sidebar/catagory-sidebar-drawer';

export const FeedPosts: React.FC = () => {
  const theme = useTheme();

  const [posts, setPosts] = useState<PostType[]>(initialPosts);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [userProfile] = useState(currentUserProfile);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleLike = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
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
              isReposted: !post.isReposted,
              reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1,
            }
          : post
      );

      // If reposting, create a new repost entry
      if (!postToRepost.isReposted) {
        const repost: PostType = {
          ...postToRepost,
          id: `repost-${Date.now()}`,
          repostedBy: {
            name: 'You',
            username: 'youruser',
            timestamp: new Date(),
          },
          isLiked: false,
          isReposted: false,
        };
        return [repost, ...updatedPosts];
      }

      return updatedPosts;
    });
  };

  const handleComment = (postId: string, commentContent: string) => {
    const newComment = {
      id: `c${Date.now()}`,
      content: commentContent,
      author: { name: 'You', username: 'youruser' },
      timestamp: new Date(),
    };

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post
      )
    );
  };

  const handleCreatePost = (content: string) => {
    const newPost: PostType = {
      id: `${Date.now()}`,
      content,
      author: {
        name: userProfile.name,
        username: userProfile.username,
        avatar: userProfile.avatar,
      },
      timestamp: new Date(),
      likes: 0,
      reposts: 0,
      comments: [],
      isLiked: false,
      isReposted: false,
    };

    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const mid = useResponsive('down', 'lg');
  const small = useResponsive('down', 'md');

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
          <Box sx={{ py: 2, ml: 'auto', height: '100%', overflowY: 'auto' }}>
            <Box
              sx={{
                m: 'auto',
                pb: 2,
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1,
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
                <Fab
                  color="secondary"
                  onClick={() => setIsCreatePostOpen(true)}
                  sx={{
                    background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                    color: 'white',
                    '&:hover': {
                      background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.light})`,
                    },
                  }}
                  size="small"
                  aria-label="Create new post"
                >
                  <Plus size={24} />
                </Fab>
              </Stack>
            </Box>
            <Box display="flex" flexDirection="column" sx={{ p: 0.5 }} gap={3}>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onRepost={handleRepost}
                  onComment={handleComment}
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

import type { Post as PostType } from 'src/types/post';

import React, { useState } from 'react';
import { Plus, Quote } from 'lucide-react';

import { Box, Fab, Grid, Container, Typography } from '@mui/material';

import { Post } from './post';
import { CreatePost } from './create-post';
import { initialPosts } from './data/posts';
import { DiscoveryPanel } from './discovery-panal';
import { CategorySidebar } from './catagory-sidebar';
import { currentUserProfile } from './data/userProfile';

export const FeedPosts: React.FC = () => {
  const [posts, setPosts] = useState<PostType[]>(initialPosts);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [userProfile] = useState(currentUserProfile);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <>
      {/* Main Content */}
      <Container
        maxWidth="lg"
        sx={{ px: 0, pb: 0, height: 'calc(100vh - 64px)', overflowY: 'hidden' }}
      >
        <Grid container spacing={3} sx={{ height: '100%', mt: 0 }}>
          {/* Other grid items */}
          <Grid
            item
            xs={12}
            sm={3}
            sx={{ p: '10px !important', height: '100%', overflowY: 'auto' }}
          >
            <CategorySidebar
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            sx={{ p: '10px !important', height: '100%', overflowY: 'auto' }}
          >
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
                  background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
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
                  background: 'linear-gradient(to right, #7c3aed, #db2777)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Wisdom Feed
              </Typography>
              {/* Floating Action Button */}
              <Fab
                color="secondary"
                onClick={() => setIsCreatePostOpen(true)}
                sx={{
                  ml: 'auto',
                  background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(to right, #7c3aed, #db2777)',
                  },
                }}
                size="small"
                aria-label="Create new post"
              >
                <Plus size={24} />
              </Fab>
            </Box>
            <Box display="flex" flexDirection="column" gap={3}>
              {posts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onRepost={handleRepost}
                  onComment={handleComment}
                />
              ))}
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            sm={3}
            sx={{ p: '10px !important', height: '100%', overflowY: 'auto' }}
          >
            <DiscoveryPanel />
          </Grid>
        </Grid>
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

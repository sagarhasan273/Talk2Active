import type { PostResponseType } from 'src/types/post';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';

import { Box, Typography } from '@mui/material';

import { selectAccount } from 'src/core/slices';
import { useGetPostsByUserIdQuery } from 'src/core/apis';

import { Iconify } from 'src/components/iconify';

import { PostCardProfile } from '../section-components/post-card';

export function UserPostContainer() {
  const user = useSelector(selectAccount);

  const [posts, setPosts] = useState<PostResponseType[]>([]);

  const { data, isLoading, isError } = useGetPostsByUserIdQuery({
    userId: user?.id || '',
    type: 'posts',
  });

  useEffect(() => {
    if (data && !isLoading && !isError) {
      setPosts(data.data);
    }
  }, [data, isLoading, isError]);

  return (
    <Box display="flex" flexDirection="column" sx={{ p: 0.5 }} gap={2}>
      {!isLoading && posts.map((post) => <PostCardProfile key={post.id} post={post} />)}
      {isLoading && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Iconify icon="ic:round-post-add" width={48} color="text.secondary" />
          <Typography variant="h6" fontWeight="bold" color="text.secondary" gutterBottom>
            No posts yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Posts will appear here.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

import type { PostResponseType } from 'src/types/post';

import { useState, useEffect } from 'react';

import { Box } from '@mui/material';

import { useUserContext } from 'src/routes/route-components';

import { useGetPostsQuery } from 'src/core/apis';

import { PostCardProfile } from '../section-components/post-card';

export function UserPostContainer() {
  const { user } = useUserContext();

  const [posts, setPosts] = useState<PostResponseType[]>([]);

  const { data, isLoading, isError } = useGetPostsQuery({ userId: user?.id || '' });

  useEffect(() => {
    if (data && !isLoading && !isError) {
      setPosts(data.data);
    }
  }, [data, isLoading, isError]);

  return (
    <Box display="flex" flexDirection="column" sx={{ p: 0.5 }} gap={2}>
      {posts.map((post) => (
        <PostCardProfile key={post.id} post={post} />
      ))}
    </Box>
  );
}

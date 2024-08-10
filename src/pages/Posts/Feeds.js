import { Stack } from '@mui/material';
import React from 'react';
import PostCardForFeed from '../../components/PostCardForFeed';

function Feeds({ feeds }) {
  return (
    <Stack className="custom-scroll-top-post" gap="20px" sx={{ height: '100%', overflowY: 'scroll', pb: '100px' }}>
      {feeds?.map((postItem, index) => (
        <PostCardForFeed key={index} postItem={postItem} />
      ))}
    </Stack>
  );
}

export default Feeds;

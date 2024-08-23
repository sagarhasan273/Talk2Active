import { Stack } from '@mui/material';
import React from 'react';
import PostCardForFeed from '../../components/PostCardForFeed';
import PostCreate from './PostCreate';

function Feeds({ feeds }) {
  return (
    <Stack gap="10px" sx={{ pb: '100px' }}>
      <PostCreate />
      {feeds?.map((postItem, index) => (
        <PostCardForFeed key={index} postItem={postItem} />
      ))}
    </Stack>
  );
}

export default Feeds;

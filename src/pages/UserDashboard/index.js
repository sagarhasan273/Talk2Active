import { Box } from '@mui/material';
import React from 'react';
import { staticPostData } from './helper';
import TopPosts from './TopPosts';

function UserDashboard() {
  return (
    <Box sx={{ p: 2 }}>
      <TopPosts posts={staticPostData} />
    </Box>
  );
}

export default UserDashboard;

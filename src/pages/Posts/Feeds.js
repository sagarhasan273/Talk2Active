import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import NotesIcon from '@mui/icons-material/Notes';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import { Button, Stack, styled, useTheme } from '@mui/material';
import React from 'react';
import PostCardForFeed from '../../components/PostCardForFeed';
import PostQuote from './PostQuote';

const CustomButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.main,
  '&: hover': {
    color: theme.palette.hover.main,
  },
}));

function Feeds({ feeds }) {
  const theme = useTheme();

  return (
    <Stack className="custom-scroll-top-post" gap="20px" sx={{ height: '100%', overflowY: 'scroll', pb: '100px' }}>
      <Stack gap={2} sx={{ p: 1, borderRadius: '10px', background: theme.palette.background.main }}>
        <PostQuote />
        <Stack p={2} direction="row" justifyContent="space-between">
          <CustomButton startIcon={<PermMediaIcon />} disableRipple>
            Media
          </CustomButton>
          <CustomButton startIcon={<FormatQuoteIcon />} disableRipple>
            Quote
          </CustomButton>
          <CustomButton startIcon={<NotesIcon />} disableRipple>
            Write Story
          </CustomButton>
        </Stack>
      </Stack>
      {feeds?.map((postItem, index) => (
        <PostCardForFeed key={index} postItem={postItem} />
      ))}
    </Stack>
  );
}

export default Feeds;

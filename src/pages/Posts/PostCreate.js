import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import NotesIcon from '@mui/icons-material/Notes';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import PublishIcon from '@mui/icons-material/Publish';
import { Box, Button, Stack, styled, useTheme } from '@mui/material';
import React, { useRef, useState } from 'react';
import PostMedia from './PostMedia';
import PostQuote from './PostQuote';
import PostStory from './PostStory';

const CustomButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.main,
  '&: hover': {
    color: theme.palette.hover.main,
  },
}));

function PostCreate() {
  const theme = useTheme();
  const [postType, setPostType] = useState('quote');
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const addPostButtonHandler = (event, type) => {
    event.preventDefault();
    setPostType(type);
    if (type === 'media') fileInputRef.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const publishPost = () => {
    console.log('post pulishing...');
  };

  return (
    <Stack gap={2} sx={{ p: 1, borderRadius: '10px', background: theme.palette.background.main }}>
      {postType === 'media' && <PostMedia />}
      {postType === 'quote' && <PostQuote />}
      {postType === 'story' && <PostStory />}
      {preview && postType === 'media' && (
        <Box>
          <img src={preview} alt="Preview" style={{ width: '100%', height: 'auto' }} />
        </Box>
      )}
      <Stack p={2} direction="row" justifyContent="space-between">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }} // Hide the input element
          onChange={handleImageChange}
        />
        <CustomButton onClick={(e) => addPostButtonHandler(e, 'media')} startIcon={<PermMediaIcon />} disableRipple>
          Media
        </CustomButton>
        <CustomButton onClick={(e) => addPostButtonHandler(e, 'quote')} startIcon={<FormatQuoteIcon />} disableRipple>
          Quote
        </CustomButton>
        <CustomButton onClick={(e) => addPostButtonHandler(e, 'story')} startIcon={<NotesIcon />} disableRipple>
          Write Story
        </CustomButton>
        <Button onClick={publishPost} startIcon={<PublishIcon />} disableRipple>
          Publish
        </Button>
      </Stack>
    </Stack>
  );
}

export default PostCreate;

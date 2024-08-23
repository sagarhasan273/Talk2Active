import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import NotesIcon from '@mui/icons-material/Notes';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import PublishIcon from '@mui/icons-material/Publish';
import { Box, Button, Stack, styled, useTheme } from '@mui/material';
import React, { useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { uploadImageToBackend } from '../../helpers/uploadImage';
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
  const [postData, setPostData] = useState({ postType: 'quote' });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const imageUploadQuery = useMutation(uploadImageToBackend, {
    onSuccess: (data) => {
      console.log(data);
    },
  });

  const addPostButtonHandler = (event, type) => {
    event.preventDefault();

    setPostData((prev) => ({ ...prev, postType: type }));
    if (type === 'media') fileInputRef.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const publishPost = async () => {
    if (imageFile) imageUploadQuery.mutate(imageFile);
    console.log('post pulishing...');
  };

  return (
    <Stack gap={2} sx={{ p: 1, borderRadius: '10px', background: theme.palette.background.main }}>
      {postData?.postType === 'media' && <PostMedia postData={postData} setPostData={setPostData} />}
      {postData?.postType === 'quote' && <PostQuote postData={postData} setPostData={setPostData} />}
      {postData?.postType === 'story' && <PostStory postData={postData} setPostData={setPostData} />}
      {preview && postData?.postType === 'media' && (
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

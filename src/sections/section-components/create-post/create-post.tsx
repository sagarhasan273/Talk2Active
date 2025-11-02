import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { X, Sparkles } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Modal,
  Button,
  useTheme,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';

import { selectAccount } from 'src/core/slices';
import { useCreatePostMutation, useUpdatePostMutation } from 'src/core/apis/api-post';

import { Form } from 'src/components/hook-form';

import PostTypeButtons from './post-type-buttons';
import { PostQuoteCreate } from './post-quote-create';
import { PostCreator } from './post-youtube-video-create';

import type { PostTypeProps, CreatePostProps } from './types';

export function CreatePost({ isOpen, onClose, editData }: CreatePostProps) {
  const theme = useTheme();

  const user = useSelector(selectAccount);

  const [postType, setPostType] = useState<PostTypeProps>('quote');

  const [createPost] = useCreatePostMutation();
  const [updatePost] = useUpdatePostMutation();

  const isEdit = !!editData?.id;

  const currentUser = {
    name: user?.name || 'Anonymous',
    avatar: user?.profilePhoto || 'No profile',
    username: user?.username || 'anonymous',
  };

  const getDefaultValues = (data?: any) => ({
    type: data?.media?.type || '',
    content: data?.media?.content || '',
    authorName: data?.media?.authorName || '',
    tags: (data?.tags as string[]) || [],
    videoUrl: data?.media?.videoUrl || '',
  });

  const methods = useForm({
    defaultValues: getDefaultValues(editData),
  });

  const {
    watch,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const authorId = user?.id;
      if (!authorId) {
        toast.error('User not authenticated. Please log in.');
        return;
      }

      const formData = {
        ...(isEdit && { postId: editData.id }), // Include ID for updates
        media: {
          type: postType as PostTypeProps,
          content: data?.content || '',
          ...(postType === 'quote' && { authorName: data?.authorName || 'Unknown' }),
          ...(postType === 'youtube' && { videoUrl: data?.videoUrl || '' }),
        },
        tags: data?.tags || [],
        author: authorId,
      };

      // Use update or create based on editData
      const response = isEdit
        ? await updatePost(formData).unwrap()
        : await createPost(formData).unwrap();

      if (response.status === true) {
        onClose();
        toast.success(
          response.message || (isEdit ? 'Post updated successfully!' : 'Post created successfully!')
        );
        methods.reset();
      } else {
        toast.error(
          response.data.message ||
            `Failed to ${isEdit ? 'update' : 'create'} post. Please try again.`
        );
      }
    } catch (error) {
      console.error(error);
    }
  });

  // Update form when editData changes
  useEffect(() => {
    if (isEdit) {
      reset(getDefaultValues(editData));
      const rawType = editData?.media?.type;
      setPostType((rawType || 'quote') as PostTypeProps);
    }
  }, [editData, reset, isEdit]);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          mx: 2,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 600,
            bgcolor: 'background.neutral',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            boxShadow: 24,
            p: 2,
          }}
        >
          <Form methods={methods} onSubmit={onSubmit}>
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
                border: '1px solid primary.main',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Sparkles size={24} color={theme.palette.primary.main} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Share Your Thoughts
                </Typography>
              </Box>
              <IconButton onClick={onClose}>
                <X size={20} color="#9ca3af" />
              </IconButton>
            </Box>

            <PostTypeButtons
              onSelectType={(type) => setPostType(type)}
              selectedType={postType}
              enableList={isEdit ? [] : ['quote', 'youtube']}
            />

            {/* Quote selector */}
            {postType === 'quote' && <PostQuoteCreate currentUser={currentUser} />}

            {/* youtube video selector */}
            {postType === 'youtube' && <PostCreator currentUser={currentUser} />}

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={onClose}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  fontWeight: 'bold',
                }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                type="submit"
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  fontWeight: 'bold',
                  background: !isSubmitting
                    ? `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                    : '#e5e7eb',
                  color: !isSubmitting ? 'white' : '#9ca3af',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  '&:hover': {
                    background: !isSubmitting
                      ? `linear-gradient(to right, ${theme.palette.primary.darker}, ${theme.palette.secondary.dark})`
                      : '#e5e7eb',
                  },
                }}
                disabled={isSubmitting || !(values.content.length !== 0 || values.videoUrl)}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={18} thickness={5} sx={{ color: 'white', mr: 1 }} />
                    Sharing...
                  </>
                ) : (
                  'Share'
                )}
              </Button>
            </Box>
          </Form>
        </Box>
      </Box>
    </Modal>
  );
}

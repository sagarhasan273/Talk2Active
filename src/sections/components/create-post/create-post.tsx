import React from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { X, Sparkles } from 'lucide-react';

import {
  Box,
  Chip,
  Modal,
  Button,
  useTheme,
  Typography,
  IconButton,
  capitalize,
  CircularProgress,
} from '@mui/material';

import { useUserContext } from 'src/routes/components';

import { PostTagsEnum } from 'src/enums/post';
import { useCreatePostMutation } from 'src/core/apis/api-post';

import { Form, Field } from 'src/components/hook-form';

import type { CreatePostProps } from './types';

export function CreatePost({ isOpen, onClose }: CreatePostProps) {
  const theme = useTheme();

  const { user } = useUserContext();

  const defaultValues = {
    content: '',
    authorName: '',
    tags: [] as string[],
  };

  const [createPost] = useCreatePostMutation();

  const methods = useForm({
    defaultValues,
  });

  const {
    watch,
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
        media: {
          type: 'quote' as 'quote',
          content: data?.content || '',
          authorName: data?.authorName || 'Unknown',
        },
        tags: data?.tags || [],
        author: authorId,
      };
      const response = await createPost(formData).unwrap();

      if (response.status === true) {
        onClose();
        toast.success(response.message || 'Post created successfully!');
        methods.reset();
      } else {
        toast.error(response.data.message || 'Failed to create post. Please try again.');
      }
    } catch (error) {
      console.error(error);
    }
  });

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
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.primary.main}`,
            borderRadius: 3,
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

            {/* Textarea */}
            <Field.Text
              name="content"
              placeholder="What's inspiring you today? Share a quote, thought, or wisdom..."
              multiline
              rows={5}
              fullWidth
              autoFocus
              inputProps={{ maxLength: 280 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  p: 0,
                  borderRadius: 2,
                },
                '& .MuiOutlinedInput-input': {
                  padding: 2,
                  borderRadius: 2,
                },
              }}
            />

            {/* Word count + helper */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Share something meaningful
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {values.content.length}/280
              </Typography>
            </Box>

            <Field.Text
              name="authorName"
              placeholder="Author Name..."
              fullWidth
              inputProps={{ maxLength: 280 }}
              size="small"
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                you can skip if unknown
              </Typography>
            </Box>

            <Field.Autocomplete
              name="tags"
              placeholder="+ tags"
              multiple
              disableCloseOnSelect
              options={Object.values(PostTagsEnum).map((option) => option)}
              getOptionLabel={(option) => option}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {capitalize(option)}
                </li>
              )}
              size="small"
              renderTags={(selected, getTagProps) =>
                selected.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={capitalize(option)}
                    size="small"
                    color="info"
                    variant="soft"
                  />
                ))
              }
              sx={{ my: 2 }}
            />

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
                disabled={isSubmitting || values.content.length === 0}
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

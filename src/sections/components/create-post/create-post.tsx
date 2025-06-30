import React from 'react';
import { z as zod } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { X, Sparkles } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Box,
  Modal,
  Button,
  useTheme,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';

import { Form, Field } from 'src/components/hook-form';

import type { CreatePostProps } from './types';

export const SignUpSchema = zod.object({
  content: zod.string().min(1, { message: 'First name is required!' }),
});

export const CreatePost: React.FC<CreatePostProps> = ({ isOpen, onClose }) => {
  const theme = useTheme();

  const defaultValues = {
    content: '',
  };

  const methods = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!isSubmitting) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        onClose();
      }
    } catch (error) {
      console.error(error);
      toast(typeof error === 'string' ? error : error.message);
    }
  });

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Form methods={methods} onSubmit={onSubmit}>
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
              borderRadius: 4,
              boxShadow: 24,
              p: 3,
            }}
          >
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Share something meaningful
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {1}/280
              </Typography>
            </Box>

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
                disabled={isSubmitting}
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
          </Box>
        </Box>
      </Form>
    </Modal>
  );
};

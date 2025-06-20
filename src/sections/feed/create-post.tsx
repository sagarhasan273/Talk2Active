import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

import {
  Box,
  Modal,
  Button,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';

interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ isOpen, onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && !isSubmitting) {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate API call
      onSubmit(content.trim());
      setContent('');
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          p: 2,
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 600,
            bgcolor: 'white',
            borderRadius: 4,
            boxShadow: 24,
            p: 4,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3,
              borderBottom: '1px solid #eee',
              pb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Sparkles size={24} color="#a855f7" />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(to right, #7c3aed, #ec4899)',
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
          <TextField
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's inspiring you today? Share a quote, thought, or wisdom..."
            multiline
            rows={5}
            fullWidth
            variant="outlined"
            autoFocus
            inputProps={{ maxLength: 280 }}
            sx={{
              mb: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              },
            }}
          />

          {/* Word count + helper */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Share something meaningful
            </Typography>
            <Typography variant="body2" color="text.disabled">
              {content.length}/280
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
              disabled={!content.trim() || isSubmitting}
              sx={{
                borderRadius: 3,
                py: 1.5,
                fontWeight: 'bold',
                background:
                  content.trim() && !isSubmitting
                    ? 'linear-gradient(to right, #8b5cf6, #ec4899)'
                    : '#e5e7eb',
                color: content.trim() && !isSubmitting ? 'white' : '#9ca3af',
                cursor: !content.trim() || isSubmitting ? 'not-allowed' : 'pointer',
                '&:hover': {
                  background:
                    content.trim() && !isSubmitting
                      ? 'linear-gradient(to right, #7c3aed, #db2777)'
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
    </Modal>
  );
};

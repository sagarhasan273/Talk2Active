'use client';

import {
  Close,
  FavoriteBorder,
  HeartBrokenOutlined,
  Link as LinkIcon
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

// Import your custom Scrollbar component and image upload helper
import { Scrollbar } from 'src/components/scrollbar';
import { uploadImage } from 'src/utils/helper'; // Adjust the import path to match your structure

// Import RTK Query hooks (without the image upload one)
import { ImagesIcon } from 'lucide-react';
import {
  useCreateFeedbackMutation,
  useGetFeedbacksQuery,
  useReactToFeedbackMutation,
} from 'src/core/apis';

export default function FeedbackView() {
  const [page, setPage] = useState(1);
  const [content, setContent] = useState('');
  const [type, setType] = useState('FEATURE');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data, isLoading } = useGetFeedbacksQuery({ page, limit: 10 });
  const [createFeedback, { isLoading: isSubmitting }] = useCreateFeedbackMutation();
  const [reactToFeedback] = useReactToFeedbackMutation();

  const feedbacks = data?.data?.feedbacks || [];
  const totalPages = data?.data?.pagination?.totalPages || 1;

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 3 - uploadedImages.length);
    if (!files.length) return;

    setIsUploading(true);

    try {
      for (const file of files) {
        // Use your custom upload utility
        const response = await uploadImage(file);
        if (response?.imageUrl) {
          setUploadedImages((prev) => [...prev, response.imageUrl]);
        }
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    try {
      await createFeedback({
        type,
        content,
        referenceUrl,
        images: uploadedImages, // Array of URLs successfully uploaded via uploadImage
      }).unwrap();

      setContent('');
      setReferenceUrl('');
      setUploadedImages([]);
      setPage(1);
    } catch (error) {
      console.error('Submission failed', error);
    }
  };

  const handleReaction = async (feedbackId: string, action: 'LIKE' | 'DISLIKE') => {
    try {
      await reactToFeedback({ feedbackId, action }).unwrap();
    } catch (error) {
      console.error('Reaction failed', error);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 800, letterSpacing: '-0.02em' }}>
        Community Feedback
      </Typography>

      {/* INPUT SECTION */}
      <Card
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 0.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
          <Select
            size="small"
            value={type}
            onChange={(e) => setType(e.target.value)}
            sx={{ width: { xs: '100%', sm: 160 }, borderRadius: 0.5 }}
          >
            <MenuItem value="FEATURE">✨ Feature</MenuItem>
            <MenuItem value="BUG">🐛 Bug</MenuItem>
            <MenuItem value="GENERAL">💡 General</MenuItem>
          </Select>
          <TextField
            fullWidth
            size="small"
            placeholder="Optional URL (e.g. screenshot link)"
            value={referenceUrl}
            onChange={(e) => setReferenceUrl(e.target.value)}
            InputProps={{
              startAdornment: <LinkIcon color="action" sx={{ mr: 1, fontSize: 20 }} />,
              sx: { borderRadius: 0.5 },
            }}
          />
        </Stack>

        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Found a bug? Have an idea?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{ sx: { borderRadius: 0.5 } }}
        />

        {/* Image Previews */}
        {uploadedImages.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {uploadedImages.map((url, index) => (
              <Box key={index} sx={{ position: 'relative', width: 72, height: 72 }}>
                <Box
                  component="img"
                  src={url}
                  alt="upload preview"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0.5 }}
                />
                <IconButton
                  size="small"
                  onClick={() => removeImage(index)}
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    '&:hover': { bgcolor: 'error.lighter', color: 'error.main' },
                  }}
                >
                  <Close sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button
            component="label"
            startIcon={isUploading ? <CircularProgress size={16} /> : <ImagesIcon size={18} />}
            color="inherit"
            disabled={isUploading || uploadedImages.length >= 3}
            sx={{ borderRadius: 0.5, textTransform: 'none', fontWeight: 600 }}
          >
            {uploadedImages.length >= 3 ? 'Max 3 Images' : 'Attach Image'}
            <input type="file" hidden accept="image/*" multiple onChange={handleImageFileChange} />
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disableElevation
            disabled={!content.trim() || isSubmitting || isUploading}
            sx={{ borderRadius: 0.5, textTransform: 'none', fontWeight: 600, px: 3 }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </Stack>
      </Card>

      <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

      {/* FEEDBACK LIST WRAPPED IN SCROLLBAR */}
      <Scrollbar sx={{ maxHeight: 600, pr: 1, mb: 4 }}>
        <Stack spacing={1}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress disableShrink />
            </Box>
          ) : (
            feedbacks.map((fb: any) => (
              <Card
                key={fb._id}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 0.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: 'primary.light',
                    boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)',
                  },
                }}
              >
                <Stack direction="row" spacing={2}>
                  <Avatar
                    src={fb.userId?.profilePhoto}
                    alt={fb.userId?.name}
                    sx={{ width: 44, height: 44, borderRadius: 0.5 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {fb.userId?.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={fb.type}
                        color={fb.type === 'BUG' ? 'error' : fb.type === 'FEATURE' ? 'primary' : 'default'}
                        variant="soft"
                        sx={{ borderRadius: 0.5, fontWeight: 700, fontSize: '0.7rem', height: 22 }}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                      {fb.content}
                    </Typography>

                    {/* Render Images if they exist */}
                    {fb.images && fb.images.length > 0 && (
                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        {fb.images.map((img: string, idx: number) => (
                          <Box
                            key={idx}
                            component="img"
                            src={img}
                            alt="feedback attachment"
                            sx={{
                              width: 88,
                              height: 88,
                              objectFit: 'cover',
                              borderRadius: 0.5,
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          />
                        ))}
                      </Stack>
                    )}

                    {/* REACTIONS */}
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleReaction(fb._id, 'LIKE')}
                          sx={{ borderRadius: 0.5, bgcolor: 'error.lighter' }}
                        >
                          <FavoriteBorder fontSize="small" />
                        </IconButton>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                          {fb.likes?.length || 0}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => handleReaction(fb._id, 'DISLIKE')}
                          sx={{ borderRadius: 0.5, bgcolor: 'background.neutral' }}
                        >
                          <HeartBrokenOutlined fontSize="small" />
                        </IconButton>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                          {fb.dislikes?.length || 0}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              </Card>
            ))
          )}
        </Stack>
      </Scrollbar>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" pt={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, val) => setPage(val)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}
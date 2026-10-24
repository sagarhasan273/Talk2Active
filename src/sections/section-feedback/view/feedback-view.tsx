'use client';

import {
  Close,
  EditOutlined,
  Favorite,
  FavoriteBorder,
  HeartBroken,
  HeartBrokenOutlined,
  Link as LinkIcon,
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
  alpha,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

import { ImagesIcon, MessageSquareHeart } from 'lucide-react';
import { Scrollbar } from 'src/components/scrollbar';
import { useCredentials } from 'src/core/slices';
import { uploadImage } from 'src/utils/helper';

import ImageLightbox from '@/sections/section-common/image-lightbox';
import {
  useCreateFeedbackMutation,
  useGetFeedbacksQuery,
  useReactToFeedbackMutation,
  useUpdateFeedbackMutation,
} from 'src/core/apis';

export default function FeedbackView() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { currentUserId } = useCredentials();

  const [page, setPage] = useState(1);
  const [content, setContent] = useState('');
  const [type, setType] = useState('FEATURE');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // State for Image Lightbox
  const [lightboxImage, setLightboxImage] = useState<{ src: string; name: string } | null>(null);

  const { data, isLoading } = useGetFeedbacksQuery({ page, limit: 10 });
  const [createFeedback, { isLoading: isSubmitting }] = useCreateFeedbackMutation();
  const [updateFeedback, { isLoading: isUpdating }] = useUpdateFeedbackMutation();
  const [reactToFeedback] = useReactToFeedbackMutation();

  const feedbacks = data?.data?.feedbacks || [];
  const totalPages = data?.data?.pagination?.totalPages || 1;

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 3 - uploadedImages.length);
    if (!files.length) return;

    setIsUploading(true);

    try {
      for (const file of files) {
        const response = await uploadImage(file);
        if (response?.imageUrl) {
          setUploadedImages((prev) => [...prev, response.imageUrl]);
        }
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleEditClick = (fb: any) => {
    setEditingId(fb._id);
    setContent(fb.content);
    setType(fb.type);
    setReferenceUrl(fb.referenceUrl || '');
    setUploadedImages(fb.images || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setContent('');
    setType('FEATURE');
    setReferenceUrl('');
    setUploadedImages([]);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    try {
      if (editingId) {
        await updateFeedback({
          id: editingId,
          type,
          content,
          referenceUrl,
          images: uploadedImages,
        }).unwrap();
      } else {
        await createFeedback({
          type,
          content,
          referenceUrl,
          images: uploadedImages,
        }).unwrap();
        setPage(1);
      }
      handleCancelEdit();
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
    <>
      <Scrollbar>
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>

          {/* HEADER */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 0.5,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
              }}
            >
              <MessageSquareHeart size={20} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                Community Feedback
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Help us improve by sharing your ideas and reporting bugs.
              </Typography>
            </Box>
          </Stack>

          {/* COMPOSE / EDIT SECTION */}
          <Card
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 0.5,
              border: '1px solid',
              borderColor: editingId ? 'primary.main' : isDark ? alpha('#fff', 0.1) : 'grey.200',
              bgcolor: 'background.paper',
              boxShadow: editingId ? `0 0 0 1px ${theme.palette.primary.main}` : isDark ? 'none' : '0px 4px 24px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.2s ease',
            }}
          >
            {editingId && (
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" color="primary.main" fontWeight={700}>
                  Editing Feedback
                </Typography>
                <IconButton size="small" onClick={handleCancelEdit} sx={{ borderRadius: 0.5 }}>
                  <Close fontSize="small" />
                </IconButton>
              </Stack>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
              <Select
                size="small"
                fullWidth
                value={type}
                onChange={(e) => setType(e.target.value)}
                sx={{
                  width: { xs: '100%', sm: 'fit-content' },
                  borderRadius: 0.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  '& fieldset': { border: 'none' }
                }}
              >
                <MenuItem value="FEATURE">✨ Feature Request</MenuItem>
                <MenuItem value="BUG">🐛 Bug Report</MenuItem>
                <MenuItem value="GENERAL">💡 General Idea</MenuItem>
              </Select>
              <TextField
                fullWidth
                size="small"
                placeholder="Attach a relevant URL (e.g., screenshot link)"
                value={referenceUrl}
                onChange={(e) => setReferenceUrl(e.target.value)}
                InputProps={{
                  startAdornment: <LinkIcon color="action" sx={{ mr: 1, fontSize: 18 }} />,
                  sx: {
                    borderRadius: 0.5,
                    bgcolor: alpha(theme.palette.background.default, 0.6),
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: isDark ? alpha('#fff', 0.2) : 'grey.300' }
                  },
                }}
              />
            </Stack>

            <TextField
              fullWidth
              multiline
              minRows={2}
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              sx={{ mb: 1 }}
              InputProps={{
                sx: {
                  borderRadius: 0.5,
                  p: 2,
                  bgcolor: alpha(theme.palette.background.default, 0.6),
                  '& fieldset': { borderColor: isDark ? alpha('#fff', 0.05) : 'grey.200' },
                  '&:hover fieldset': { borderColor: 'primary.main' },
                }
              }}
            />

            {/* IMAGE PREVIEWS */}
            {uploadedImages.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                {uploadedImages.map((url, index) => (
                  <Box key={index} sx={{ position: 'relative', width: 72, height: 72 }}>
                    <Box
                      component="img"
                      src={url}
                      alt="upload preview"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0.5, border: '1px solid', borderColor: 'divider' }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeImage(index)}
                      sx={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        bgcolor: 'background.paper',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        borderRadius: 0.5,
                        '&:hover': { bgcolor: 'error.lighter', color: 'error.main' },
                      }}
                    >
                      <Close sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
              spacing={1.5}
            >
              {/* 1. Single Attach Media Button */}
              <Button
                component="label"
                startIcon={isUploading ? <CircularProgress size={16} /> : <ImagesIcon size={18} />}
                color="inherit"
                disabled={isUploading || uploadedImages.length >= 3}
                sx={{
                  borderRadius: 0.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  color: 'text.secondary',
                  justifyContent: { xs: 'center', sm: 'flex-start' }, // Center icon on mobile
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' },
                }}
              >
                {uploadedImages.length >= 3 ? 'Max 3 Images' : 'Attach Media'}
                <input type="file" hidden accept="image/*" multiple onChange={handleImageFileChange} />
              </Button>

              {/* 2. Action Buttons (Cancel & Submit) */}
              <Stack
                direction={{ xs: 'column-reverse', sm: 'row' }}
                spacing={1}
              >
                {editingId && (
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleCancelEdit}
                    sx={{ borderRadius: 0.5, textTransform: 'none', fontWeight: 700, px: 2 }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disableElevation
                  disabled={!content.trim() || isSubmitting || isUpdating || isUploading}
                  sx={{
                    borderRadius: 0.5,
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 3,
                    whiteSpace: 'nowrap',
                    minWidth: 'max-content'
                  }}
                >
                  {isSubmitting || isUpdating ? 'Saving...' : editingId ? 'Update Feedback' : 'Post Feedback'}
                </Button>
              </Stack>
            </Stack>
          </Card>

          <Divider sx={{ mb: 2, borderStyle: 'dashed', borderColor: isDark ? alpha('#fff', 0.1) : 'grey.300' }} />

          {/* FEEDBACK LIST */}
          <Stack spacing={1}>
            {isLoading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress disableShrink />
              </Box>
            ) : feedbacks.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary">No feedback yet</Typography>
                <Typography variant="body2" color="text.disabled">Be the first to share your thoughts!</Typography>
              </Box>
            ) : (
              feedbacks.map((fb: any) => {
                const isOwner = currentUserId && (fb.user?.userId === currentUserId || fb.user?.id === currentUserId);
                const isLiked = fb.currentUserReaction === 'LIKE';
                const isDisliked = fb.currentUserReaction === 'DISLIKE';

                return (
                  <Card
                    key={fb.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 0.5,
                      border: '1px solid',
                      borderColor: editingId === fb.id ? 'primary.main' : isDark ? alpha('#fff', 0.08) : 'grey.200',
                      bgcolor: editingId === fb.id ? alpha(theme.palette.primary.main, 0.02) : 'background.paper',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: editingId === fb.id ? 'primary.main' : alpha(theme.palette.primary.main, 0.3),
                        boxShadow: isDark ? 'none' : '0 4px 16px rgba(0,0,0,0.03)',
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1}>
                      <Avatar
                        src={fb.user?.profilePhoto}
                        alt={fb.user?.name}
                        sx={{ width: 44, height: 44, borderRadius: 0.5 }}
                      />
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="subtitle2" fontWeight={700} noWrap>
                              {fb.user?.name || 'Anonymous User'}
                            </Typography>
                            <Chip
                              size="small"
                              label={fb.type}
                              color={fb.type === 'BUG' ? 'error' : fb.type === 'FEATURE' ? 'primary' : 'secondary'}
                              sx={{
                                borderRadius: 0.5,
                                fontWeight: 800,
                                fontSize: '0.65rem',
                                height: 20,
                                letterSpacing: 0.5
                              }}
                            />
                          </Stack>

                          {/* EDIT BUTTON (Only visible if owner) */}
                          {isOwner && (
                            <IconButton
                              size="small"
                              onClick={() => handleEditClick(fb)}
                              sx={{ color: 'text.secondary', borderRadius: 0.5 }}
                            >
                              <EditOutlined fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>

                        <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.6, color: 'text.primary' }}>
                          {fb.content}
                        </Typography>

                        {/* ATTACHED IMAGES */}
                        {fb.images && fb.images.length > 0 && (
                          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            {fb.images.map((img: string, idx: number) => (
                              <Box
                                key={idx}
                                component="img"
                                src={img}
                                alt="attachment"
                                onClick={() => setLightboxImage({ src: img, name: `Attachment by ${fb.user?.name || 'User'}` })}
                                sx={{
                                  width: 88,
                                  height: 88,
                                  objectFit: 'cover',
                                  borderRadius: 0.5,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  cursor: 'pointer',
                                  transition: 'opacity 0.2s',
                                  '&:hover': {
                                    opacity: 0.85,
                                  }
                                }}
                              />
                            ))}
                          </Stack>
                        )}

                        {/* REACTIONS */}
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Button
                            size="small"
                            onClick={() => handleReaction(fb.id, 'LIKE')}
                            startIcon={isLiked ? <Favorite sx={{ fontSize: 18, color: 'error.main' }} /> : <FavoriteBorder sx={{ fontSize: 18 }} />}
                            sx={{
                              borderRadius: 0.5,
                              color: isLiked ? 'error.main' : 'text.secondary',
                              bgcolor: isLiked ? alpha(theme.palette.error.main, 0.12) : alpha(theme.palette.error.main, 0.04),
                              px: 1,
                              minWidth: 48,
                              '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.16) }
                            }}
                          >
                            {fb.likeCount || 0}
                          </Button>

                          <Button
                            size="small"
                            onClick={() => handleReaction(fb.id, 'DISLIKE')}
                            startIcon={isDisliked ? <HeartBroken sx={{ fontSize: 18, color: 'text.primary' }} /> : <HeartBrokenOutlined sx={{ fontSize: 18 }} />}
                            sx={{
                              borderRadius: 0.5,
                              color: isDisliked ? 'text.primary' : 'text.secondary',
                              bgcolor: isDisliked ? alpha(theme.palette.text.primary, 0.12) : isDark ? alpha('#fff', 0.04) : 'grey.100',
                              px: 1,
                              minWidth: 48,
                              '&:hover': { bgcolor: isDark ? alpha('#fff', 0.12) : 'grey.200' }
                            }}
                          >
                            {fb.dislikeCount || 0}
                          </Button>
                        </Stack>

                      </Box>
                    </Stack>
                  </Card>
                );
              })
            )}
          </Stack>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" pt={3} pb={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, val) => setPage(val)}
                color="primary"
                shape="rounded"
                sx={{
                  '& .MuiPaginationItem-root': { borderRadius: 0.5 },
                }}
              />
            </Box>
          )}
        </Box>
      </Scrollbar>

      {/* LIGHTBOX MODAL */}
      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage.src}
          name={lightboxImage.name}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </>
  );
}
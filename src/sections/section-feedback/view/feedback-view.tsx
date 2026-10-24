'use client';

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent, DialogContentText,
  DialogTitle,
  Divider, Pagination, Stack, Typography, alpha, useTheme
} from '@mui/material';
import { MessageSquareHeart } from 'lucide-react';
import { useState } from 'react';

import ImageLightbox from '@/sections/section-common/image-lightbox';
import { Scrollbar } from 'src/components/scrollbar';
import { useCredentials } from 'src/core/slices';
import { uploadImage } from 'src/utils/helper';

import {
  useCreateFeedbackMutation,
  useDeleteFeedbackMutation,
  useGetFeedbacksQuery,
  useReactToFeedbackMutation,
  useUpdateFeedbackMutation,
} from 'src/core/apis';

import FeedbackCard from '../feedback-card';
import FeedbackForm from '../feedback-form';

export default function FeedbackView() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { currentUserId, user } = useCredentials();

  const [page, setPage] = useState(1);
  const [content, setContent] = useState('');
  const [type, setType] = useState('FEATURE');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [lightboxImage, setLightboxImage] = useState<{ src: string; name: string } | null>(null);

  // Custom Delete Modal State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null);

  const { data, isLoading } = useGetFeedbacksQuery({ page, limit: 10 });
  const [createFeedback, { isLoading: isSubmitting }] = useCreateFeedbackMutation();
  const [updateFeedback, { isLoading: isUpdating }] = useUpdateFeedbackMutation();
  const [deleteFeedback, { isLoading: isDeleting }] = useDeleteFeedbackMutation();
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
    setEditingId(fb.id);
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

  // Open the modal instead of window.confirm
  const handleDeleteRequest = (id: string) => {
    setFeedbackToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Execute deletion when confirm is clicked
  const confirmDelete = async () => {
    if (!feedbackToDelete) return;
    try {
      await deleteFeedback(feedbackToDelete).unwrap();
      if (editingId === feedbackToDelete) handleCancelEdit();
    } catch (error) {
      console.error('Failed to delete feedback:', error);
    } finally {
      setDeleteDialogOpen(false);
      setFeedbackToDelete(null);
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

          <FeedbackForm
            type={type}
            setType={setType}
            referenceUrl={referenceUrl}
            setReferenceUrl={setReferenceUrl}
            content={content}
            setContent={setContent}
            uploadedImages={uploadedImages}
            isUploading={isUploading}
            editingId={editingId}
            isSubmitting={isSubmitting}
            isUpdating={isUpdating}
            onImageFileChange={handleImageFileChange}
            onRemoveImage={removeImage}
            onSubmit={handleSubmit}
            onCancelEdit={handleCancelEdit}
            isDark={isDark}
            theme={theme}
          />

          <Divider sx={{ mb: 2, borderStyle: 'dashed', borderColor: isDark ? alpha('#fff', 0.1) : 'grey.300' }} />

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
              feedbacks.map((fb: any) => (
                <FeedbackCard
                  key={fb.id}
                  feedback={fb}
                  currentUserId={currentUserId}
                  editingId={editingId}
                  isDark={isDark}
                  isAdmin ={Boolean(user?.accountType === 'ADMIN')}
                  onEdit={() => handleEditClick(fb)}
                  onDelete={() => handleDeleteRequest(fb.id)}
                  onReact={(action: 'LIKE' | 'DISLIKE') => handleReaction(fb.id, action)}
                  onImageClick={(src: string, name: string) => setLightboxImage({ src, name })}
                />
              ))
            )}
          </Stack>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" pt={3} pb={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, val) => setPage(val)}
                color="primary"
                shape="rounded"
                sx={{ '& .MuiPaginationItem-root': { borderRadius: 0.5 } }}
              />
            </Box>
          )}
        </Box>
      </Scrollbar>

      {/* LIGHTBOX */}
      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage.src}
          name={lightboxImage.name}
          onClose={() => setLightboxImage(null)}
        />
      )}

      {/* CONFIRM DELETE MODAL */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 1 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>Delete Feedback</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this feedback? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            color="inherit"
            sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 0.5 }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disableElevation
            disabled={isDeleting}
            sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 0.5 }}
          >
            {isDeleting ? 'Deleting...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

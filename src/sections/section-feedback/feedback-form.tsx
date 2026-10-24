import { Close, Link as LinkIcon } from '@mui/icons-material';
import { alpha, Box, Button, Card, CircularProgress, IconButton, MenuItem, Select, Stack, TextField, Theme, Typography } from '@mui/material';
import { ImagesIcon } from 'lucide-react';
import React from 'react';

interface FeedbackFormProps {
  type: string;
  setType: (type: string) => void;
  referenceUrl: string;
  setReferenceUrl: (url: string) => void;
  content: string;
  setContent: (content: string) => void;
  uploadedImages: string[];
  isUploading: boolean;
  editingId: string | null;
  isSubmitting: boolean;
  isUpdating: boolean;
  onImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRemoveImage: (index: number) => void;
  onSubmit: () => Promise<void>;
  onCancelEdit: () => void;
  isDark: boolean;
  theme: Theme;
}

export default function FeedbackForm({
  type,
  setType,
  referenceUrl,
  setReferenceUrl,
  content,
  setContent,
  uploadedImages,
  isUploading,
  editingId,
  isSubmitting,
  isUpdating,
  onImageFileChange,
  onRemoveImage,
  onSubmit,
  onCancelEdit,
  isDark,
  theme
}: FeedbackFormProps) {
  return (
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
          <IconButton size="small" onClick={onCancelEdit} sx={{ borderRadius: 0.5 }}>
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

      {uploadedImages.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          {uploadedImages.map((url: string, index: number) => (
            <Box key={index} sx={{ position: 'relative', width: 72, height: 72 }}>
              <Box
                component="img"
                src={url}
                alt="upload preview"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0.5, border: '1px solid', borderColor: 'divider' }}
              />
              <IconButton
                size="small"
                onClick={() => onRemoveImage(index)}
                sx={{
                  position: 'absolute',
                  top: -6, right: -6,
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
        <Button
          component="label"
          startIcon={isUploading ? <CircularProgress size={16} /> : <ImagesIcon size={18} />}
          color="inherit"
          disabled={isUploading || uploadedImages.length >= 3}
          sx={{
            borderRadius: 0.5, textTransform: 'none', fontWeight: 600, color: 'text.secondary',
            justifyContent: { xs: 'center', sm: 'flex-start' },
            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' },
          }}
        >
          {uploadedImages.length >= 3 ? 'Max 3 Images' : 'Attach Media'}
          <input type="file" hidden accept="image/*" multiple onChange={onImageFileChange} />
        </Button>

        <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1}>
          {editingId && (
            <Button
              fullWidth
              variant="outlined"
              onClick={onCancelEdit}
              sx={{ borderRadius: 0.5, textTransform: 'none', fontWeight: 700, px: 2 }}
            >
              Cancel
            </Button>
          )}
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={onSubmit}
            disableElevation
            disabled={!content.trim() || isSubmitting || isUpdating || isUploading}
            sx={{
              borderRadius: 0.5, textTransform: 'none', fontWeight: 700, px: 3,
              whiteSpace: 'nowrap', minWidth: 'max-content'
            }}
          >
            {isSubmitting || isUpdating ? 'Saving...' : editingId ? 'Update Feedback' : 'Post Feedback'}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { Search, PlayArrow } from '@mui/icons-material';
import {
  Box,
  Dialog,
  Button,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { Field } from 'src/components/hook-form';

interface YouTubeSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (youtubeUrl: string) => void;
}

export function YouTubeSelector({ open, onClose, onSelect }: YouTubeSelectorProps) {
  const { watch, setValue } = useFormContext();
  const values = watch();

  const [error, setError] = useState('');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const extractYouTubeId = (inputUrl: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/,
      /youtube\.com\/watch\?.*v=([^&?#]+)/,
      /youtu\.be\/([^&?#]+)/,
      /youtube\.com\/embed\/([^&?#]+)/,
    ];

    const matched = patterns
      .map((pattern) => inputUrl.match(pattern))
      .find((match) => match && match[1]);
    return matched ? matched[1] : null;
  };

  const handlePreview = () => {
    if (!previewId) {
      setError('Please enter a valid YouTube URL');
      return;
    }
    setLoading(true);
    // Simulate API call or validation
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleSelect = () => {
    if (previewId) {
      onSelect(values.videoUrl);
      setValue('videoUrl', values.videoUrl);
      setPreviewId(null);
      onClose();
    }
  };

  useEffect(() => {
    setError('');
    const videoId = extractYouTubeId(values.videoUrl);
    setPreviewId(videoId);
  }, [values.videoUrl]);
  console.log('previewId', previewId);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PlayArrow color="primary" />
          Select YouTube Video
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Field.Text
            fullWidth
            name="videoUrl"
            label="YouTube URL"
            placeholder="Paste YouTube link here..."
            error={!!error}
            helperText={error || 'Supports: youtube.com/watch?v=..., youtu.be/..., etc.'}
            inputProps={{ maxLength: 280 }}
            size="small"
            sx={{
              borderRadius: 1,
              '& .MuiOutlinedInput-input': {
                fontSize: {
                  xs: '0.775rem',
                  sm: '1rem',
                },
                borderRadius: 1,
              },
            }}
          />
        </Box>

        {previewId && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                <CircularProgress />
              </Box>
            ) : (
              <Box
                sx={{
                  position: 'relative',
                  paddingBottom: '56.25%', // 16:9 aspect ratio
                  height: 0,
                  overflow: 'hidden',
                  borderRadius: 1,
                  bgcolor: 'black',
                }}
              >
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${previewId}`}
                  title="YouTube video preview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                  }}
                />
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handlePreview} disabled={!values.videoUrl} startIcon={<Search />}>
          Preview
        </Button>
        <Button onClick={handleSelect} variant="contained" disabled={!previewId || loading}>
          Select Video
        </Button>
      </DialogActions>
    </Dialog>
  );
}

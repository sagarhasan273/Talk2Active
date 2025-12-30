import { useState } from 'react';

import { Link, Search, PlayArrow, VideoLibrary } from '@mui/icons-material';
import {
  Box,
  Tab,
  Tabs,
  Grid,
  Card,
  Alert,
  Dialog,
  Button,
  TextField,
  CardMedia,
  Typography,
  IconButton,
  DialogTitle,
  CardContent,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { extractYouTubeId } from 'src/utils/helper';

import { CONFIG } from 'src/config-global';

interface YouTubeSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (youtubeUrl: string, videoTitle?: string) => void;
}

interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
    description: string;
  };
}

const YOUTUBE_API_KEY = CONFIG.youtubeApiKey;

export function YouTubeSelector({ open, onClose, onSelect }: YouTubeSelectorProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [apiError, setApiError] = useState('');

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setError('');

    const videoId = extractYouTubeId(newUrl);
    setPreviewId(videoId);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setApiError('');
  };

  const searchYouTubeVideos = async (query: string): Promise<YouTubeVideo[]> => {
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_API_KEY_HERE') {
      throw new Error('YouTube API key not configured. Please add your API key to .env file');
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=12&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to search YouTube videos');
    }

    const data = await response.json();
    return data.items;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setApiError('');
    try {
      const videos = await searchYouTubeVideos(searchQuery);
      setSearchResults(videos);
    } catch (err) {
      console.error('Search error:', err);
      setApiError(err instanceof Error ? err.message : 'Failed to search videos');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePreview = () => {
    if (!previewId) {
      setError('Please enter a valid YouTube URL');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleVideoSelect = (video: YouTubeVideo) => {
    const videoUrl = `https://www.m.youtube.com/watch?v=${video.id.videoId}`;
    onSelect(videoUrl, video.snippet.title);
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  const handleUrlSelect = () => {
    if (previewId) {
      onSelect(url);
      setUrl('');
      setPreviewId(null);
      onClose();
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSearchQuery('');
    setSearchResults([]);
    setApiError('');
    setUrl('');
    setPreviewId(null);
    setError('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          backgroundColor: 'background.neutral',
          p: {
            xs: 1,
            sm: 2,
          },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <PlayArrow color="primary" />
          Select YouTube Video
        </Box>
        <Button onClick={onClose}>Close</Button>
      </DialogTitle>

      <DialogContent
        sx={{
          backgroundColor: 'background.neutral',
          p: {
            xs: 1.5,
            sm: 2,
          },
        }}
      >
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab icon={<Link />} label="Paste URL" />
          <Tab icon={<VideoLibrary />} label="Search YouTube" />
        </Tabs>

        {activeTab === 0 && (
          <Box>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="YouTube URL"
                placeholder="Paste YouTube link here..."
                error={!!error}
                helperText={error || 'Supports: youtube.com/watch?v=..., youtu.be/..., etc.'}
                inputProps={{ maxLength: 280 }}
                size="small"
                value={url}
                onChange={handleUrlChange}
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
                      paddingBottom: '56.25%',
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
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            {/* Search Input */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Search YouTube videos..."
                placeholder="Enter keywords, song names, tutorials..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={handleSearch}
                      disabled={searchLoading || !searchQuery.trim()}
                      edge="end"
                    >
                      <Search />
                    </IconButton>
                  ),
                }}
                helperText="Search real YouTube videos using YouTube Data API"
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

            {apiError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {apiError}
              </Alert>
            )}

            {/* Search Results */}
            {searchLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Searching YouTube...</Typography>
              </Box>
            ) : searchResults.length > 0 ? (
              <Grid container spacing={2}>
                {searchResults.map((video) => (
                  <Grid sx={{ xs: 12, sm: 6 }} key={video.id.videoId}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4,
                        },
                        backgroundColor: 'background.paper',
                      }}
                      onClick={() => handleVideoSelect(video)}
                    >
                      <CardMedia
                        component="img"
                        height="140"
                        image={video.snippet.thumbnails.medium.url}
                        alt={video.snippet.title}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 1,
                            lineHeight: 1.3,
                          }}
                        >
                          {video.snippet.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {video.snippet.channelTitle}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mt: 0.5,
                          }}
                        >
                          {video.snippet.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : searchQuery && !searchLoading && !apiError ? (
              <Typography textAlign="center" color="text.secondary" sx={{ py: 4 }}>
                No videos found. Try different keywords.
              </Typography>
            ) : (
              <Typography textAlign="center" color="text.secondary" sx={{ py: 4 }}>
                Enter keywords to search real YouTube videos
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          backgroundColor: 'background.neutral',
          p: {
            xs: 1.5,
            sm: 2,
          },
        }}
      >
        {activeTab === 0 && (
          <>
            <Button onClick={handlePreview} disabled={!url} startIcon={<Search />}>
              Preview
            </Button>
            <Button onClick={handleUrlSelect} variant="contained" disabled={!previewId || loading}>
              Select Video
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

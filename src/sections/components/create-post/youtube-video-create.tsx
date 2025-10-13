import { useState } from 'react';

import { Close, PlayArrow } from '@mui/icons-material';
import { Box, Card, Button, Avatar, TextField, IconButton, CardContent } from '@mui/material';

import { YouTubeSelector } from './youtube-video-selector';

interface PostCreatorProps {
  onPostCreate: (post: any) => void;
  currentUser: {
    name: string;
    avatar: string;
    username: string;
  };
}

export function PostCreator({ onPostCreate, currentUser }: PostCreatorProps) {
  const [caption, setCaption] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [youtubeSelectorOpen, setYoutubeSelectorOpen] = useState(false);

  const handleYouTubeSelect = (youtubeUrl: string) => {
    setSelectedVideo(youtubeUrl);
  };

  const handleRemoveVideo = () => {
    setSelectedVideo(null);
  };

  const handleCreatePost = () => {
    if (!caption.trim() && !selectedVideo) return;

    const newPost = {
      id: Date.now().toString(),
      type: 'youtube',
      author: currentUser,
      timestamp: 'Just now',
      content: {
        caption: caption.trim(),
        youtubeUrl: selectedVideo,
      },
      likes: 0,
      comments: 0,
      isLiked: false,
      isBookmarked: false,
    };

    onPostCreate(newPost);
    setCaption('');
    setSelectedVideo(null);
  };

  const extractVideoId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/
    );
    return match ? match[1] : null;
  };

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="flex-start">
            <Avatar src={currentUser.avatar} alt={currentUser.name} />

            <Box flex={1}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="What's on your mind?"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
              />

              {selectedVideo && (
                <Box sx={{ position: 'relative', mb: 2 }}>
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
                      src={`https://www.youtube.com/embed/${extractVideoId(selectedVideo)}`}
                      title="Selected YouTube video"
                      frameBorder="0"
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
                  <IconButton
                    onClick={handleRemoveVideo}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      },
                    }}
                  >
                    <Close />
                  </IconButton>
                </Box>
              )}

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Button
                  startIcon={<PlayArrow />}
                  onClick={() => setYoutubeSelectorOpen(true)}
                  variant="outlined"
                >
                  Add YouTube Video
                </Button>

                <Button
                  variant="contained"
                  onClick={handleCreatePost}
                  disabled={!caption.trim() && !selectedVideo}
                >
                  Post
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <YouTubeSelector
        open={youtubeSelectorOpen}
        onClose={() => setYoutubeSelectorOpen(false)}
        onSelect={handleYouTubeSelect}
      />
    </>
  );
}

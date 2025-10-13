import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Close, PlayArrow } from '@mui/icons-material';
import { Box, Card, Button, Avatar, IconButton, CardContent } from '@mui/material';

import { Field } from 'src/components/hook-form';

import { YouTubeSelector } from './post-youtube-video-selector';

interface PostCreatorProps {
  currentUser: {
    name: string;
    avatar: string;
    username: string;
  };
}

export function PostCreator({ currentUser }: PostCreatorProps) {
  const { setValue, watch } = useFormContext();

  const values = watch();

  const [youtubeSelectorOpen, setYoutubeSelectorOpen] = useState(false);

  const handleYouTubeSelect = (youtubeUrl: string) => {
    setValue('videoUrl', youtubeUrl);
  };

  const handleRemoveVideo = () => {
    setValue('videoUrl', '');
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
        <CardContent
          sx={{
            p: {
              xs: 1.5,
              sm: 2,
            },
          }}
        >
          <Box
            display="flex"
            sx={{
              gap: {
                xs: 1,
                sm: 2,
              },
            }}
            alignItems="flex-start"
          >
            <Avatar src={currentUser.avatar} alt={currentUser.name} />

            <Box flex={1}>
              <Field.Text
                name="content"
                placeholder="What's on your mind?"
                multiline
                rows={3}
                fullWidth
                autoFocus
                inputProps={{ maxLength: 280 }}
                sx={{
                  borderRadius: 1,
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    p: 0,
                    borderRadius: 1,
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: {
                      xs: 1,
                      sm: 2,
                    },
                    fontSize: {
                      xs: '0.775rem',
                      sm: '1rem',
                    },
                    borderRadius: 1,
                  },
                }}
              />

              {values.videoUrl && (
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
                      src={`https://www.youtube.com/embed/${extractVideoId(values.videoUrl)}`}
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

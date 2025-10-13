import { useState } from 'react';

import { MoreHoriz, NavigateNext, NavigateBefore } from '@mui/icons-material';
import {
  Box,
  Card,
  Menu,
  Stack,
  Avatar,
  Button,
  MenuItem,
  useTheme,
  CardMedia,
  CardHeader,
  IconButton,
  Typography,
  CardContent,
} from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';

import { InteractionButton } from '../interaction-button';

import type { PostCardProps } from './types';

export type PostType = 'image' | 'images' | 'video' | 'caption' | 'quote';

export function PostCard({ post, onLike, onDislike, onRepost }: PostCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'now';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const images = post.media.urls || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const renderContent = () => {
    switch (post.media.type) {
      case 'image':
        return (
          <Box sx={{ position: 'relative', overflow: 'hidden', bgcolor: 'grey.50' }}>
            <CardMedia
              component="img"
              src={images[currentImageIndex]}
              alt={`Post content ${currentImageIndex + 1}`}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: 600,
                objectFit: 'cover',
              }}
            />

            {hasMultipleImages && (
              <>
                <IconButton
                  onClick={prevImage}
                  sx={{
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    },
                    opacity: 0,
                    '&:hover, &:focus': {
                      opacity: 1,
                    },
                  }}
                  aria-label="Previous image"
                >
                  <NavigateBefore />
                </IconButton>

                <IconButton
                  onClick={nextImage}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    },
                    opacity: 0,
                    '&:hover, &:focus': {
                      opacity: 1,
                    },
                  }}
                  aria-label="Next image"
                >
                  <NavigateNext />
                </IconButton>

                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 0.5,
                  }}
                >
                  {images.map((_, index) => (
                    <Button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      sx={{
                        minWidth: 'auto',
                        width: index === currentImageIndex ? 24 : 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor:
                          index === currentImageIndex ? 'white' : 'rgba(255, 255, 255, 0.6)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        },
                        transition: 'all 0.3s ease',
                        p: 0,
                      }}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </Box>
              </>
            )}
          </Box>
        );

      case 'video':
        return (
          <Box sx={{ position: 'relative', overflow: 'hidden', bgcolor: 'black' }}>
            <Box
              component="video"
              src={post.media.videoUrl}
              controls
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: 600,
              }}
            >
              Your browser does not support the video tag.
            </Box>
          </Box>
        );

      case 'quote':
        return (
          <Box
            sx={{
              px: 3,
              py: 6,
              background:
                theme.palette.mode === 'light'
                  ? `linear-gradient(135deg, ${theme.palette.grey[300]}, ${theme.palette.grey[200]})`
                  : `linear-gradient(135deg, ${theme.palette.grey[900]}, ${theme.palette.grey[800]})`,
            }}
          >
            <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
              <Iconify
                icon="fontisto:quote-left"
                sx={{
                  width: 28,
                  height: 28,
                  color: 'grey.500',
                  mb: 2,
                }}
              />

              <Typography
                component="blockquote"
                sx={{
                  fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                  lineHeight: 1.6,
                  fontSize: 28,
                  mb: 2,
                }}
              >
                {post.media.content}
              </Typography>
              {post.media.authorName && (
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  — {post.media.authorName}
                </Typography>
              )}
            </Box>
          </Box>
        );

      case 'caption':
      default:
        return null;
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 1,
        boxShadow: 1,
        '&:hover': {
          boxShadow: 4,
        },
        border: `1px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.18)}`,
        transition: 'box-shadow 0.3s ease-in-out',
        overflow: 'hidden',
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            src={post.authorDetails?.profilePhoto}
            alt={post.authorDetails?.name}
            sx={{
              width: 48,
              height: 48,
              border: `2px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.18)}`,
            }}
          />
        }
        action={
          <>
            <IconButton onClick={handleMenuOpen} aria-label="More options" size="small">
              <MoreHoriz />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleMenuClose}>Report</MenuItem>
              <MenuItem onClick={handleMenuClose}>Hide</MenuItem>
              <MenuItem onClick={handleMenuClose}>Copy link</MenuItem>
            </Menu>
          </>
        }
        title={
          <Typography variant="subtitle1" fontWeight={600}>
            {post.authorDetails?.name}
          </Typography>
        }
        subheader={
          <Typography variant="caption">
            @{post.authorDetails?.username} · {formatTime(new Date(post.createdAt))}
          </Typography>
        }
        sx={{
          p: 1,
          '& .MuiCardHeader-action': {
            margin: 0,
            alignSelf: 'center',
          },
        }}
      />

      {post.media.content && post.media.type !== 'quote' && (
        <CardContent sx={{ py: 1, px: 2 }}>
          <Typography
            variant="body2"
            color="grey.800"
            sx={{
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}
          >
            {post.media.content}
          </Typography>
        </CardContent>
      )}

      {renderContent()}

      {/* Interactions */}
      <Box
        display="flex"
        justifyContent="space-between"
        sx={{
          py: 1,
        }}
      >
        <Stack direction="row">
          <InteractionButton
            icon="mynaui:like"
            activeIcon="mynaui:like-solid"
            count={post.engagement.likes}
            isActive={post.isLiked}
            onClick={() => onLike(post.id)}
            activeColor="primary"
            hoverColor="primary"
            label={`${post.isLiked ? 'Unlike' : 'Like'} post`}
          />
          <InteractionButton
            icon="mynaui:dislike"
            activeIcon="mynaui:dislike-solid"
            count={post.engagement.dislikes}
            isActive={post.isDisliked}
            onClick={() => onDislike(post.id)}
            activeColor="error"
            hoverColor="error"
            label={`${post.isDisliked ? 'Unlike' : 'Like'} post`}
          />
        </Stack>
        <InteractionButton
          icon="mynaui:pin"
          activeIcon="mynaui:pin-solid"
          count={post.engagement.pins}
          isActive={post.isPinned}
          onClick={() => onRepost(post.id)}
          activeColor="info"
          hoverColor="info"
          label={`${post.isPinned ? 'Undo pin' : 'Pin'} post`}
        />
      </Box>
    </Card>
  );
}

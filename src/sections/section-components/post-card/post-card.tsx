import { useState } from 'react';
import YouTube from 'react-youtube';

import { Pause, MoreHoriz, PlayArrow, NavigateNext, NavigateBefore } from '@mui/icons-material';
import {
  Box,
  Card,
  Menu,
  Stack,
  Alert,
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

import { useUserContext } from 'src/routes/route-components';

import { useBoolean } from 'src/hooks/use-boolean';

import { extractYouTubeId } from 'src/utils/helper';

import { varAlpha } from 'src/theme/styles';
import { useDeletePostMutation } from 'src/core/apis';
import { RelationshipTypeEnum } from 'src/enums/enum-social';
import { useFollowMutation, useUnfollowMutation } from 'src/core/apis/api-social';

import { Iconify } from 'src/components/iconify';
import { ImageViewer } from 'src/components/image';

import { CreatePost } from '../create-post';
import { InteractionButton } from '../interaction-button';

import type { PostCardProps } from './types';

export type PostType = 'image' | 'images' | 'video' | 'caption' | 'quote' | 'youtube';
// YouTube ID extraction utility

export function PostCard({ post, onLike, onDislike, onRepost }: PostCardProps) {
  const { user } = useUserContext();

  const imageOpen = useBoolean();
  const createOpen = useBoolean();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoPlayer, setVideoPlayer] = useState<any>(null);

  const [isFollowing, setIsFollowing] = useState(post.authorRelationship.following || false);

  const [deletePost] = useDeletePostMutation();
  const [followMutate] = useFollowMutation();
  const [unfollowMutate] = useUnfollowMutation();

  const theme = useTheme();

  const images = post.media.urls || [];
  const hasMultipleImages = images.length > 1;

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

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    if (isFollowing) {
      unfollowMutate({
        requester: user?.id,
        recipient: post?.authorDetails?.id,
        type: RelationshipTypeEnum.FOLLOW,
      });
    } else {
      followMutate({
        requester: user?.id,
        recipient: post?.authorDetails?.id,
        type: RelationshipTypeEnum.FOLLOW,
      });
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Extract YouTube ID from URL
  const youtubeId = post.media.videoUrl ? extractYouTubeId(post.media.videoUrl) : 'YQHsXMglC9A';

  // YouTube player options
  const youtubeOpts = {
    height: '390',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      showinfo: 0,
      modestbranding: 1,
      playsinline: 1,
      enablejsapi: 1,
      origin: window.location.origin,
    },
  };

  const onYouTubeReady = (event: any) => {
    setVideoPlayer(event.target);
  };

  const onYouTubePlay = () => {
    setIsPlaying(true);
  };

  const onYouTubePause = () => {
    setIsPlaying(false);
  };

  const onYouTubeEnd = () => {
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (videoPlayer) {
      if (isPlaying) {
        videoPlayer.pauseVideo();
      } else {
        videoPlayer.playVideo();
      }
    }
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
                  : `linear-gradient(135deg, ${theme.palette.grey[900]}, ${theme.palette.grey[900]})`,
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

      case 'youtube':
        if (!youtubeId) {
          return (
            <Alert severity="error" sx={{ m: 2 }}>
              Invalid YouTube URL
            </Alert>
          );
        }

        return (
          <Box sx={{ position: 'relative', overflow: 'hidden', bgcolor: 'black' }}>
            <YouTube
              videoId={youtubeId}
              opts={youtubeOpts}
              onReady={onYouTubeReady}
              onPlay={onYouTubePlay}
              onPause={onYouTubePause}
              onEnd={onYouTubeEnd}
              style={{
                width: '100%',
                height: 'auto',
              }}
            />

            {/* Custom play/pause button overlay */}
            {!videoPlayer && (
              <IconButton
                onClick={togglePlayPause}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  },
                  width: 64,
                  height: 64,
                }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause sx={{ fontSize: 32 }} /> : <PlayArrow sx={{ fontSize: 32 }} />}
              </IconButton>
            )}
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
            onClick={imageOpen.onTrue}
          />
        }
        action={
          post.authorDetails.id !== user?.id ? (
            <Button
              variant={isFollowing ? 'outlined' : 'contained'}
              size="small"
              onClick={handleFollow}
              sx={{
                // mt: 7,
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 600,
                px: 2,
                ...(isFollowing
                  ? {
                      color: 'text.secondary',
                      borderColor: 'divider',
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        backgroundColor: 'background.neutral',
                        borderColor: 'divider',
                      },
                    }
                  : {
                      color: 'white !important',
                      backgroundColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }),
              }}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          ) : (
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
                <MenuItem onClick={createOpen.onTrue} sx={{ gap: 1 }}>
                  <Iconify icon="ri:edit-2-line" />
                  <Typography variant="subtitle2">Edit</Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    deletePost({ postId: post?.id, author: user?.id });
                  }}
                  sx={{ gap: 1, color: 'error.main' }}
                >
                  <Iconify icon="material-symbols:delete-rounded" />
                  <Typography variant="subtitle2">Delete</Typography>
                </MenuItem>
              </Menu>
              <CreatePost
                isOpen={createOpen.value}
                onClose={() => createOpen.onFalse()}
                editData={post}
              />
            </>
          )
        }
        title={
          <Typography variant="subtitle1" fontWeight={600}>
            {post.authorDetails?.name}
          </Typography>
        }
        subheader={
          <Typography variant="caption" sx={{ userSelect: 'text' }}>
            @{post.authorDetails?.username} · {formatTime(new Date(post.createdAt))}
          </Typography>
        }
        sx={{
          p: 1.5,
          '& .MuiCardHeader-action': {
            margin: 0,
            alignSelf: 'center',
          },
          '& .MuiCardHeader-content': {
            display: 'flex',
            flexDirection: 'column',
            gap: 0.25,
          },
        }}
      />

      {post.media.content && post.media.type !== 'quote' && (
        <CardContent sx={{ py: 1, px: 2 }}>
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              userSelect: 'text',
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
          py: 1.5,
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
      <ImageViewer
        open={imageOpen.value}
        onClose={() => imageOpen.onFalse()}
        imageUrl={post.authorDetails?.profilePhoto}
      />
    </Card>
  );
}

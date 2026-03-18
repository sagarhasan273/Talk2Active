import type { PostResponseType } from 'src/types/type-post';

import YouTube from 'react-youtube';
import React, { useState } from 'react';

import { Pause, MoreHoriz, PlayArrow, NavigateNext, NavigateBefore } from '@mui/icons-material';
import {
  Box,
  Card,
  Menu,
  Chip,
  Stack,
  Alert,
  alpha,
  MenuItem,
  useTheme,
  CardMedia,
  IconButton,
  Typography,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { fToNow } from 'src/utils/format-time';
import { extractYouTubeId } from 'src/utils/helper';

import { useCredentials } from 'src/core/slices';
import { AccountTypeConfig } from 'src/layouts/components/account-drawer';
import {
  useDeletePostMutation,
  useUpdatePostEngagementPinMutation,
  useUpdatePostEngagementLikeMutation,
  useUpdatePostEngagementDisikeMutation,
} from 'src/core/apis';

import { Iconify } from 'src/components/iconify';
import { ImageViewer } from 'src/components/image';
import { AvatarUser } from 'src/components/avatar-user';

import { CreatePost } from '../create-post';
import { InteractionButton } from '../interaction-button';

import type { PostCardProps } from './types';

// ─────────────────────────────────────────────────────────────────────────────

function RegularPostCard({ post }: PostCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { user, isAuthenticated, setSelectedUser } = useCredentials();

  const imageOpen = useBoolean();
  const createOpen = useBoolean();

  const [data, setData] = useState<PostResponseType>(post);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoPlayer, setVideoPlayer] = useState<any>(null);
  const [imgHovered, setImgHovered] = useState(false);

  const [deletePost] = useDeletePostMutation();
  const [updatePostLike] = useUpdatePostEngagementLikeMutation();
  const [updatePostDislike] = useUpdatePostEngagementDisikeMutation();
  const [updatePinpost] = useUpdatePostEngagementPinMutation();

  const images = data.media.urls || [];
  const hasMultipleImages = images.length > 1;
  const youtubeId = data.media.videoUrl ? extractYouTubeId(data.media.videoUrl) : '';
  const isOwner = data.authorDetails?.id === user.id;

  const nextImage = () => setCurrentImageIndex((p) => (p + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((p) => (p - 1 + images.length) % images.length);

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

  const handleLike = async (postId: string) => {
    setData((prev) => ({
      ...prev,
      isLiked: !prev.isLiked,
      isDisliked: false,
      engagement: {
        ...prev.engagement,
        likes: prev.isLiked ? prev.engagement.likes - 1 : prev.engagement.likes + 1,
        dislikes: prev.isDisliked ? prev.engagement.dislikes - 1 : prev.engagement.dislikes,
      },
    }));
    try {
      await updatePostLike({ postId, userId: user?.id }).unwrap();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDislike = async (postId: string) => {
    setData((prev) => ({
      ...prev,
      isLiked: false,
      isDisliked: !prev.isDisliked,
      engagement: {
        ...prev.engagement,
        likes: prev.isLiked ? prev.engagement.likes - 1 : prev.engagement.likes,
        dislikes: prev.isDisliked ? prev.engagement.dislikes - 1 : prev.engagement.dislikes + 1,
      },
    }));
    try {
      await updatePostDislike({ postId, userId: user?.id }).unwrap();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePinpost = async (postId: string) => {
    setData((prev) => ({
      ...prev,
      isPinned: !prev.isPinned,
      engagement: {
        ...prev.engagement,
        pins: prev.isPinned ? prev.engagement.pins - 1 : prev.engagement.pins + 1,
      },
    }));
    try {
      await updatePinpost({ postId, userId: user?.id }).unwrap();
    } catch (e) {
      console.error(e);
    }
  };

  const accountCfg =
    AccountTypeConfig[data.authorDetails?.accountType ?? 'member'] ?? AccountTypeConfig.member;

  // ── Media renderers ───────────────────────────────────────────────────────

  const renderContent = () => {
    switch (data.media.type) {
      case 'image':
        return (
          <Box
            onMouseEnter={() => setImgHovered(true)}
            onMouseLeave={() => setImgHovered(false)}
            sx={{ position: 'relative', overflow: 'hidden', bgcolor: 'black', lineHeight: 0 }}
          >
            <CardMedia
              component="img"
              src={images[currentImageIndex]}
              alt={`Post content ${currentImageIndex + 1}`}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: 560,
                objectFit: 'cover',
                transition: 'transform 0.4s ease',
                transform: imgHovered ? 'scale(1.015)' : 'scale(1)',
              }}
            />

            {/* Dark gradient overlay */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 40%)',
                pointerEvents: 'none',
              }}
            />

            {hasMultipleImages && (
              <>
                {/* Prev / Next */}
                {[
                  { fn: prevImage, icon: <NavigateBefore />, side: 'left' },
                  { fn: nextImage, icon: <NavigateNext />, side: 'right' },
                ].map(({ fn, icon, side }) => (
                  <IconButton
                    key={side}
                    onClick={fn}
                    sx={{
                      position: 'absolute',
                      [side]: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(0,0,0,0.55)',
                      backdropFilter: 'blur(4px)',
                      color: 'white',
                      opacity: imgHovered ? 1 : 0,
                      transition: 'opacity 0.2s, background 0.2s',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                    }}
                  >
                    {icon}
                  </IconButton>
                ))}

                {/* Dot indicators */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 0.6,
                    alignItems: 'center',
                  }}
                >
                  {images.map((_, i) => (
                    <Box
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      sx={{
                        width: i === currentImageIndex ? 20 : 6,
                        height: 6,
                        borderRadius: 3,
                        bgcolor: i === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': { bgcolor: 'white' },
                      }}
                    />
                  ))}
                </Box>

                {/* Counter badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    bgcolor: 'rgba(0,0,0,0.55)',
                    backdropFilter: 'blur(6px)',
                    borderRadius: 10,
                    px: 1.25,
                    py: 0.35,
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <Typography
                    sx={{ fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: 0.5 }}
                  >
                    {currentImageIndex + 1} / {images.length}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        );

      case 'video':
        return (
          <Box sx={{ position: 'relative', bgcolor: 'black', lineHeight: 0 }}>
            <Box
              component="video"
              src={post.media.videoUrl}
              controls
              sx={{ width: '100%', height: 'auto', maxHeight: 560, display: 'block' }}
            />
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
            <Iconify
              icon="fontisto:quote-left"
              sx={{
                width: 28,
                height: 28,
                color: 'grey.500',
                mb: 1,
              }}
            />

            <Typography
              component="blockquote"
              sx={{
                fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                lineHeight: 1.7,
                fontSize: { xs: 18, sm: 22 },
                color: 'text.primary',
                fontStyle: 'italic',
                mb: data.media.authorName ? 2 : 0,
                position: 'relative',
              }}
            >
              {data.media.content}
            </Typography>

            {data.media.authorName && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 24,
                    height: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.5),
                    borderRadius: 1,
                  }}
                />
                <Typography
                  variant="body2"
                  fontWeight={700}
                  sx={{ color: 'text.secondary', letterSpacing: 0.4 }}
                >
                  {data.media.authorName}
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 'youtube':
        if (!youtubeId)
          return (
            <Alert severity="error" sx={{ m: 2 }}>
              Invalid YouTube URL
            </Alert>
          );
        return (
          <Box sx={{ position: 'relative', bgcolor: 'black', lineHeight: 0 }}>
            <YouTube
              videoId={youtubeId}
              opts={youtubeOpts}
              onReady={(e: any) => setVideoPlayer(e.target)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnd={() => setIsPlaying(false)}
              style={{ width: '100%' }}
            />
            {!videoPlayer && (
              <IconButton
                onClick={() => {
                  if (videoPlayer) {
                    if (isPlaying) {
                      videoPlayer.pauseVideo();
                    } else {
                      videoPlayer.playVideo();
                    }
                  }
                }}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  width: 64,
                  height: 64,
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.9)',
                    transform: 'translate(-50%, -50%) scale(1.1)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                {isPlaying ? <Pause sx={{ fontSize: 32 }} /> : <PlayArrow sx={{ fontSize: 32 }} />}
              </IconButton>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  // ── Main card ─────────────────────────────────────────────────────────────

  return (
    <Card
      sx={{
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        overflow: 'hidden',
        transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.2),
        },
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedUser({ ...data.authorDetails, relationShip: data.authorRelationship });
        }}
      >
        {/* Avatar + author info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            onClick={(e) => {
              e.stopPropagation();
              imageOpen.onTrue();
            }}
          >
            <AvatarUser
              avatarUrl={data.authorDetails?.profilePhoto ?? null}
              name={data.authorDetails?.name ?? ''}
              verified={data.authorDetails?.verified}
              accountType={data.authorDetails?.accountType}
              sx={{ width: 42, height: 42 }}
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{ color: 'text.primary', lineHeight: 1.2 }}
              >
                {data.authorDetails?.name}
              </Typography>
              {data.authorDetails?.verified && (
                <Iconify
                  icon="material-symbols:verified-rounded"
                  width={18}
                  sx={{ color: '#2979ff', flexShrink: 0 }}
                />
              )}
              <Chip
                label={accountCfg.label}
                size="small"
                sx={{
                  height: 20,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 0.6,
                  bgcolor: accountCfg.bg,
                  color: accountCfg.color,
                  border: '1px solid',
                  borderColor: alpha(accountCfg.color, 0.35),
                  px: 0.5,
                  '&:hover': {
                    bgcolor: accountCfg.bg,
                    color: accountCfg.color,
                  },
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', lineHeight: 1 }}>
              @{data.authorDetails?.username}
              <Box component="span" sx={{ mx: 0.5, opacity: 0.5 }}>
                ·
              </Box>
              {fToNow(new Date(data.createdAt))} ago
            </Typography>
          </Box>
        </Box>

        {/* Options menu (owner only) */}
        {isOwner && (
          <Box onClick={(e) => e.stopPropagation()}>
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                color: 'text.disabled',
                borderRadius: 1.5,
                '&:hover': {
                  color: 'text.primary',
                  bgcolor: alpha(theme.palette.primary.main, 0.07),
                },
              }}
            >
              <MoreHoriz fontSize="small" />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: `0 8px 28px ${alpha('#000', 0.14)}`,
                  minWidth: 160,
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  createOpen.onTrue();
                }}
                sx={{ gap: 1.25, borderRadius: 1, mx: 0.5, my: 0.25 }}
              >
                <Iconify icon="ri:edit-2-line" width={18} />
                <Typography variant="body2" fontWeight={600}>
                  Edit post
                </Typography>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  deletePost({ postId: post?.id, author: user?.id });
                }}
                sx={{ gap: 1.25, color: 'error.main', borderRadius: 1, mx: 0.5, my: 0.25 }}
              >
                <Iconify icon="material-symbols:delete-rounded" width={18} />
                <Typography variant="body2" fontWeight={600}>
                  Delete post
                </Typography>
              </MenuItem>
            </Menu>

            <CreatePost isOpen={createOpen.value} onClose={createOpen.onFalse} editData={data} />
          </Box>
        )}
      </Box>

      {/* ── Text content ───────────────────────────────────────────────────── */}
      {data.media.content && data.media.type !== 'quote' && (
        <Box sx={{ px: 2, pb: 1.5 }}>
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              userSelect: 'text',
              color: 'text.primary',
              fontSize: '0.875rem',
            }}
          >
            {data.media.content}
          </Typography>
        </Box>
      )}

      {/* ── Media block ────────────────────────────────────────────────────── */}
      {renderContent()}

      {/* ── Interaction bar ────────────────────────────────────────────────── */}
      {isAuthenticated && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1,
            py: 0.75,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: isDark ? alpha('#fff', 0.015) : alpha('#000', 0.015),
          }}
        >
          <Stack direction="row">
            <InteractionButton
              icon="mynaui:like"
              activeIcon="mynaui:like-solid"
              count={data.engagement.likes}
              isActive={data.isLiked}
              onClick={() => handleLike(data.id)}
              activeColor="primary"
              hoverColor="primary"
              label={`${data.isLiked ? 'Unlike' : 'Like'} post`}
            />
            <InteractionButton
              icon="mynaui:dislike"
              activeIcon="mynaui:dislike-solid"
              count={data.engagement.dislikes}
              isActive={data.isDisliked}
              onClick={() => handleDislike(data.id)}
              activeColor="error"
              hoverColor="error"
              label={`${data.isDisliked ? 'Remove dislike' : 'Dislike'} post`}
            />
          </Stack>
          <InteractionButton
            icon="mynaui:pin"
            activeIcon="mynaui:pin-solid"
            count={data.engagement.pins}
            isActive={data.isPinned}
            onClick={() => handlePinpost(data.id)}
            activeColor="info"
            hoverColor="info"
            label={`${data.isPinned ? 'Undo pin' : 'Pin'} post`}
          />
        </Box>
      )}

      {/* ── Profile photo lightbox ─────────────────────────────────────────── */}
      <ImageViewer
        open={imageOpen.value}
        onClose={imageOpen.onFalse}
        imageUrl={data.authorDetails?.profilePhoto}
      />
    </Card>
  );
}

export const PostCard = React.memo(RegularPostCard);

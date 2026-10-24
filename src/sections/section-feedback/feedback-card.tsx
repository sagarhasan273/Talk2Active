import { Iconify } from '@/components/iconify';
import {
  DeleteOutline,
  EditOutlined,
  Favorite,
  FavoriteBorder,
  HeartBroken,
  HeartBrokenOutlined,
  KeyboardArrowDown,
} from '@mui/icons-material';
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Theme,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useUpdateFeedbackStatusMutation } from 'src/core/apis';

interface FeedbackCardProps {
  feedback: any;
  currentUserId?: string;
  editingId: string | null;
  isDark: boolean;
  theme: Theme;
  isAdmin?: boolean;
  page?: number; // Needed for the optimistic update cache target
  onEdit: () => void;
  onDelete: () => void;
  onReact: (action: 'LIKE' | 'DISLIKE') => void;
  onImageClick: (src: string, name: string) => void;
}

export default function FeedbackCard({
  feedback,
  currentUserId,
  editingId,
  isDark,
  theme,
  isAdmin,
  page = 1,
  onEdit,
  onDelete,
  onReact,
  onImageClick,
}: FeedbackCardProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [statusAnchor, setStatusAnchor] = useState<null | HTMLElement>(null);

  // Initialize the mutation
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateFeedbackStatusMutation();

  const isOwner =
    currentUserId &&
    (feedback.user?.userId === currentUserId || feedback.user?.id === currentUserId);
  const isLiked = feedback.currentUserReaction === 'LIKE';
  const isDisliked = feedback.currentUserReaction === 'DISLIKE';

  const handleCopyId = () => {
    if (feedback.user?.genUserId) {
      navigator.clipboard.writeText(feedback.user.genUserId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleStatusOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setStatusAnchor(event.currentTarget);
  };

  const handleStatusClose = () => {
    setStatusAnchor(null);
  };

  const handleStatusSelect = async (newStatus: 'PENDING' | 'VIEWED_BY_ADMIN' | 'RESOLVED') => {
    handleStatusClose();
    if (newStatus !== feedback.status) {
      try {
        await updateStatus({ feedbackId: feedback.id, status: newStatus, page }).unwrap();
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 0.5,
        border: '1px solid',
        borderColor: editingId === feedback.id ? 'primary.main' : isDark ? alpha('#fff', 0.08) : 'grey.200',
        bgcolor: editingId === feedback.id ? alpha(theme.palette.primary.main, 0.02) : 'background.paper',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: editingId === feedback.id ? 'primary.main' : alpha(theme.palette.primary.main, 0.3),
          boxShadow: isDark ? 'none' : '0 4px 16px rgba(0,0,0,0.03)',
        },
      }}
    >
      <Stack direction="row" spacing={1}>
        <Avatar
          src={feedback.user?.profilePhoto}
          alt={feedback.user?.name}
          sx={{ width: 48, height: 48, borderRadius: 0.5 }}
        />

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          {/* HEADER ROW: Name & ID (Left) | Chip & Actions (Right) */}
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1 }}>

            {/* LEFT SIDE */}
            <Stack direction="column" spacing={0.5}>
              <Typography variant="body1" fontWeight={700} noWrap>
                {feedback.user?.name || 'Anonymous User'}
              </Typography>

              {/* Copyable genUserId */}
              {feedback.user?.genUserId && (
                <Tooltip title={copiedId ? 'Copied ID!' : 'Click to copy ID'} arrow placement="top">
                  <Box
                    onClick={handleCopyId}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      height: 22,
                      width: 'fit-content',
                      px: 1,
                      cursor: 'pointer',
                      borderRadius: 0.5,
                      bgcolor: copiedId ? alpha(theme.palette.success.main, 0.12) : isDark ? alpha('#fff', 0.04) : '#f8fafc',
                      border: '1px solid',
                      borderColor: copiedId ? alpha(theme.palette.success.main, 0.3) : isDark ? alpha('#fff', 0.08) : '#e2e8f0',
                      transition: 'all 0.15s ease',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: copiedId ? 'success.main' : 'text.secondary',
                      }}
                    >
                      ID: {feedback.user?.genUserId}
                    </Typography>
                    <Iconify
                      icon={copiedId ? 'mingcute:check-line' : 'solar:copy-bold-duotone'}
                      width={12}
                      sx={{ color: copiedId ? 'success.main' : 'text.disabled' }}
                    />
                  </Box>
                </Tooltip>
              )}
            </Stack>

            {/* RIGHT SIDE */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip
                size="small"
                label={feedback.type}
                color={feedback.type === 'BUG' ? 'error' : feedback.type === 'FEATURE' ? 'primary' : 'secondary'}
                sx={{
                  borderRadius: 0.5,
                  fontWeight: 800,
                  fontSize: '0.65rem',
                  height: 20,
                  letterSpacing: 0.5,
                }}
              />

              {isOwner && (
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    size="small"
                    onClick={onEdit}
                    sx={{ color: 'text.secondary', borderRadius: 0.5, bgcolor: isDark ? alpha('#fff', 0.04) : 'grey.100' }}
                  >
                    <EditOutlined fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    onClick={onDelete}
                    sx={{
                      color: 'error.main',
                      borderRadius: 0.5,
                      bgcolor: alpha(theme.palette.error.main, 0.08),
                      '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.16) },
                    }}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Stack>
              )}
            </Stack>
          </Stack>

          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.6, color: 'text.primary' }}>
            {feedback.content}
          </Typography>

          {/* ATTACHED IMAGES */}
          {feedback.images && feedback.images.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {feedback.images.map((img: string, idx: number) => (
                <Box
                  key={idx}
                  component="img"
                  src={img}
                  alt="attachment"
                  onClick={() => onImageClick(img, `Attachment by ${feedback.user?.name || 'User'}`)}
                  sx={{
                    width: 88,
                    height: 88,
                    objectFit: 'cover',
                    borderRadius: 0.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    '&:hover': { opacity: 0.85 },
                  }}
                />
              ))}
            </Stack>
          )}

          {/* BOTTOM ROW: Reactions (Left) & Status (Right) */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>

            {/* REACTIONS (Left) */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Button
                size="small"
                onClick={() => onReact('LIKE')}
                startIcon={isLiked ? <Favorite sx={{ fontSize: 18, color: 'error.main' }} /> : <FavoriteBorder sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: 0.5,
                  color: isLiked ? 'error.main' : 'text.secondary',
                  bgcolor: isLiked ? alpha(theme.palette.error.main, 0.12) : alpha(theme.palette.error.main, 0.04),
                  px: 1,
                  minWidth: 48,
                  '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.16) },
                }}
              >
                {feedback.likeCount || 0}
              </Button>

              <Button
                size="small"
                onClick={() => onReact('DISLIKE')}
                startIcon={isDisliked ? <HeartBroken sx={{ fontSize: 18, color: 'text.primary' }} /> : <HeartBrokenOutlined sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: 0.5,
                  color: isDisliked ? 'text.primary' : 'text.secondary',
                  bgcolor: isDisliked ? alpha(theme.palette.text.primary, 0.12) : isDark ? alpha('#fff', 0.04) : 'grey.100',
                  px: 1,
                  minWidth: 48,
                  '&:hover': { bgcolor: isDark ? alpha('#fff', 0.12) : 'grey.200' },
                }}
              >
                {feedback.dislikeCount || 0}
              </Button>
            </Stack>

            {/* ADMIN STATUS CONTROLS / READONLY STATUS (Right) */}
            {isAdmin ? (
              <>
                <Button
                  size="small"
                  onClick={handleStatusOpen}
                  disabled={isUpdatingStatus}
                  endIcon={<KeyboardArrowDown />}
                  color={
                    feedback.status === 'RESOLVED'
                      ? 'success'
                      : feedback.status === 'VIEWED_BY_ADMIN'
                        ? 'info'
                        : 'inherit'
                  }
                  sx={{
                    borderRadius: 0.5,
                    textTransform: 'none',
                    fontWeight: 700,
                    bgcolor:
                      feedback.status === 'RESOLVED'
                        ? alpha(theme.palette.success.main, 0.12)
                        : feedback.status === 'VIEWED_BY_ADMIN'
                          ? alpha(theme.palette.info.main, 0.12)
                          : isDark
                            ? alpha('#fff', 0.04)
                            : 'grey.100',
                    px: 1.5,
                  }}
                >
                  {feedback.status === 'RESOLVED'
                    ? '✅ Resolved'
                    : feedback.status === 'VIEWED_BY_ADMIN'
                      ? '👀 Viewed'
                      : '⏳ Pending'}
                </Button>

                <Menu
                  anchorEl={statusAnchor}
                  open={Boolean(statusAnchor)}
                  onClose={handleStatusClose}
                  PaperProps={{ sx: { borderRadius: 1, minWidth: 140 } }}
                >
                  <MenuItem onClick={() => handleStatusSelect('PENDING')} sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    ⏳ Pending
                  </MenuItem>
                  <MenuItem onClick={() => handleStatusSelect('VIEWED_BY_ADMIN')} sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    👀 Viewed
                  </MenuItem>
                  <MenuItem onClick={() => handleStatusSelect('RESOLVED')} sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    ✅ Resolved
                  </MenuItem>
                </Menu>
              </>
            ) : (
              /* Hide for normal users if status is PENDING */
              feedback.status && feedback.status !== 'PENDING' && (
                <Chip
                  size="small"
                  label={feedback.status === 'RESOLVED' ? '✅ Resolved' : '👀 Viewed'}
                  color={feedback.status === 'RESOLVED' ? 'success' : 'info'}
                  variant="soft"
                  sx={{
                    borderRadius: 0.5,
                    fontWeight: 800,
                    fontSize: '0.65rem',
                    height: 24,
                    letterSpacing: 0.5,
                  }}
                />
              )
            )}

          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
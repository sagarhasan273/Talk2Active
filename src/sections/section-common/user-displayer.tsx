// src/sections/section-voice/voice-room-card/user-displayer.tsx

import { ButtonRelationshipToggle } from '@/components/buttons';
import ButtonBlockUser from '@/components/buttons/button-block-user';
import ButtonReportUser from '@/components/buttons/button-report-user';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import {
  alpha,
  Avatar,
  Backdrop,
  Box,
  Chip,
  Fade,
  IconButton,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import { useState } from 'react';
import DialogReportUser from './dialog-report-user';



export type UserDisplayerProfile = {
  id?: string;
  userId?: string;
  name: string;
  username?: string;
  profilePhoto?: string | null;
  verified?: boolean;
  accountType?: 'admin' | 'supporter' | 'vip' | 'moderator' | 'member' | string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  friendsCount?: number;
  isFollowing?: boolean;
  isBlocked?: boolean;
};

type UserDisplayerProps = {
  open: boolean;
  user: UserDisplayerProfile;
  currentUserId?: string;
  onClose: () => void;
  onToggleFollow?: (userId: string, isFollowing: boolean) => void;
  onBlockUser?: (userId: string) => void;
  onReportUser?: (userId: string, reason: string) => void;
};

export const UserDisplayer = ({
  open,
  user,
  currentUserId,
  onClose,
  onToggleFollow,
  onBlockUser,
  onReportUser,
}: UserDisplayerProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [reportOpen, setReportOpen] = useState(false);

  const resolvedUserId = user.userId || user.id || '';
  const isSelf = Boolean(currentUserId && resolvedUserId === currentUserId);
  const isBlocked = Boolean(user.isBlocked);

  const getInitials = (fullName: string) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return fullName.slice(0, 2).toUpperCase();
  };

  const statItems = [
    { label: 'Followers', count: user.followersCount ?? 0 },
    { label: 'Following', count: user.followingCount ?? 0 },
    { label: 'Friends', count: user.friendsCount ?? 0 },
  ];

  const handleOpenReport = () => {
    onClose(); // Closes the user profile card first
    setReportOpen(true);
  };

  return (
    <>
      <Backdrop
        open={open}
        onClick={onClose}
        TransitionComponent={Fade}
        sx={{
          zIndex: 2500,
          bgcolor: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 3 },
        }}
      >
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: { xs: 360, sm: 580 },
            borderRadius: 3,
            bgcolor: isDark ? alpha(theme.palette.background.paper, 0.95) : '#ffffff',
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
            boxShadow: isDark
              ? '0 24px 72px -12px rgba(0,0,0,0.85)'
              : '0 24px 72px -12px rgba(145, 158, 171, 0.35)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: { xs: 2.5, sm: 3 },
              py: 1.75,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'text.primary' }}>
              User Profile
            </Typography>

            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: 'text.secondary',
                bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                '&:hover': {
                  bgcolor: isDark ? alpha('#fff', 0.12) : alpha('#000', 0.08),
                },
              }}
            >
              <CloseRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* Modal Body */}
          <Box
            sx={{
              p: { xs: 2.5, sm: 3 },
              display: 'flex',
              flexDirection: { xs: 'column-reverse', sm: 'row' },
              gap: { xs: 2.5, sm: 3 },
              alignItems: { xs: 'stretch', sm: 'center' },
            }}
          >
            {/* LEFT Info */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Stack direction="row" alignItems="center" spacing={0.75} mb={0.5}>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    noWrap
                    sx={{
                      fontSize: { xs: '1.1rem', sm: '1.25rem' },
                      lineHeight: 1.2,
                      color: 'text.primary',
                    }}
                  >
                    {user.name}
                  </Typography>
                  {user.verified && (
                    <VerifiedRoundedIcon sx={{ fontSize: 18, color: 'info.main', flexShrink: 0 }} />
                  )}
                </Stack>

                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    display: 'block',
                    fontSize: 12,
                    fontFamily: 'monospace',
                    letterSpacing: 0.2,
                    mb: 1.5,
                  }}
                >
                  @{user.username || resolvedUserId || 'user'}
                </Typography>

                {user.accountType && user.accountType !== 'member' && (
                  <Chip
                    label={user.accountType}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 10.5,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      mb: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: 'primary.main',
                    }}
                  />
                )}

                {user.bio && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.4,
                      fontSize: '0.8125rem',
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {user.bio}
                  </Typography>
                )}
              </Box>

              {/* Stats Counters */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 1,
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.025),
                  border: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'center',
                  mb: { xs: 2, sm: 2.5 },
                }}
              >
                {statItems.map(({ label, count }) => (
                  <Box key={label}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={800}
                      sx={{ color: 'text.primary', lineHeight: 1.2 }}
                    >
                      {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', fontSize: 10.5, fontWeight: 600 }}
                    >
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Action Buttons */}
              {!isSelf && (
                <Stack direction="row" spacing={1} alignItems="center">
                  {resolvedUserId && (
                    <ButtonRelationshipToggle
                      targetUser={{ id: resolvedUserId, name: user.name }}
                      isFollow={user.isFollowing}
                      size="small"
                      variant="soft"
                      fullWidth
                    />
                  )}

                  <ButtonReportUser
                    variant="soft"
                    size="small"
                    onClick={handleOpenReport}
                    fullWidth
                  />

                  {onBlockUser && (
                    <ButtonBlockUser
                      userId={resolvedUserId}
                      userName={user.name}
                      isBlocked={isBlocked}
                      onBlockUser={onBlockUser}
                      variant="soft"
                      size="small"
                    />
                  )}
                </Stack>
              )}
            </Box>

            {/* RIGHT Square Avatar */}
            <Box
              sx={{
                position: 'relative',
                width: { xs: '100%', sm: 190 },
                height: { xs: 200, sm: 190 },
                flexShrink: 0,
                borderRadius: 2.5,
                overflow: 'hidden',
                bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04),
                border: '1px solid',
                borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
                boxShadow: theme.shadows[4],
              }}
            >
              <Avatar
                variant="square"
                src={user.profilePhoto || undefined}
                alt={user.name}
                sx={{
                  width: '100%',
                  height: '100%',
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: 'primary.main',
                }}
              >
                {getInitials(user.name)}
              </Avatar>
            </Box>
          </Box>
        </Box>
      </Backdrop>

      {/* Report User Modal Dialog */}
      <DialogReportUser
        open={reportOpen}
        userId={resolvedUserId}
        userName={user.name}
        onClose={() => setReportOpen(false)}
        onSubmitReport={(targetId: any, reason: any) => {
          onReportUser?.(targetId, reason);
        }}
      />
    </>
  );
};

export default UserDisplayer;

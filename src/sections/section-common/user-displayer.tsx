// src/sections/section-voice/voice-room-card/user-displayer.tsx

import AnimatedAvatar from '@/components/avatar-user/animated-avatar';
import { ButtonRelationshipToggle } from '@/components/buttons';
import ButtonBlockUser from '@/components/buttons/button-block-user';
import ButtonReportUser from '@/components/buttons/button-report-user';
import { Label } from '@/components/label';
import { useCredentials } from '@/core/slices';
import type { RootState } from '@/core/types'; // Import RootState for typed selector
import { AccountTypeEnum } from '@/enums/enum-user';
import type { UserStats } from '@/types/type-social';
import { UserType } from '@/types/type-user';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import {
  alpha,
  Box,
  Divider,
  Fade,
  IconButton,
  Modal,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux'; // Import useSelector
import DialogReportUser from '../../components/dialogs/dialog-report-user';
import UserDisplayerWrapper from './user-displayer-wrapper';

export type UserDisplayerProfile = {
  id?: string;
  userId?: string;
  genUserId?: string;
  name: string;
  username?: string;
  profilePhoto?: string | null;
  verified?: boolean;
  accountType?: UserType['accountType'];
  bio?: string;
  follower_count?: number;
  following_count?: number;
  friend_count?: number;
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

const AccountTypeConfig: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: 'Admin', color: '#ff1744', bg: 'rgba(255,23,68,0.12)' },
  supporter: { label: 'Supporter', color: '#d500f9', bg: 'rgba(213,0,249,0.12)' },
  member: { label: 'Member', color: '#78909c', bg: 'rgba(120,144,156,0.12)' },
};

export const UserDisplayer = ({
  open,
  user,
  currentUserId,
  onClose,
  onReportUser,
}: UserDisplayerProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { checkIfBlocked } = useCredentials();

  const [reportOpen, setReportOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const resolvedUserId = user.userId || '';
  const displayHandle = user.genUserId ? `ID: ${user.genUserId}` : `Can't see Uid`;
  const isSelf = Boolean(currentUserId && resolvedUserId === currentUserId);
  const isBlocked = checkIfBlocked(resolvedUserId);

  // O(1) Instant lookup from Redux userStatsMap (persists across closes and reopens)
  const cachedStats = useSelector((state: RootState) => state.room?.userStatsMap?.[resolvedUserId]);

  // Local state for instant optimistic updates while the modal is open
  const [liveStats, setLiveStats] = useState({
    follower_count: cachedStats?.follower_count ?? user.follower_count ?? 0,
    friend_count: cachedStats?.friend_count ?? user.friend_count ?? 0,
    following_count: cachedStats?.following_count ?? user.following_count ?? 0,
  });

  // Sync with Redux cache or props whenever modal opens or switches to another user
  useEffect(() => {
    setLiveStats({
      follower_count: cachedStats?.follower_count ?? user.follower_count ?? 0,
      friend_count: cachedStats?.friend_count ?? user.friend_count ?? 0,
      following_count: cachedStats?.following_count ?? user.following_count ?? 0,
    });
  }, [
    resolvedUserId,
    cachedStats,
    user.follower_count,
    user.friend_count,
    user.following_count,
    open,
  ]);

  const handleStatsUpdate = useCallback(
    (updatedStatsList: UserStats[]) => {
      if (!Array.isArray(updatedStatsList)) return;
      const targetStats = updatedStatsList.find((s) => String(s.userId) === String(resolvedUserId));
      if (targetStats) {
        setLiveStats({
          follower_count: targetStats.follower_count ?? 0,
          friend_count: targetStats.friend_count ?? 0,
          following_count: targetStats.following_count ?? 0,
        });
      }
    },
    [resolvedUserId]
  );

  const accountCfg =
    AccountTypeConfig[user.accountType?.toLowerCase() ?? AccountTypeEnum.MEMBER] ??
    AccountTypeConfig.member;

  const getInitials = (fullName: string) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return fullName.slice(0, 2).toUpperCase();
  };

  const formatStatCount = (count: number) =>
    count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count;

  const statItems = [
    { label: 'Followers', count: liveStats.follower_count },
    { label: 'Friends', count: liveStats.friend_count },
    { label: 'Following', count: liveStats.following_count },
  ];

  const handleCopyHandle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const copyText = user.genUserId || user.username || resolvedUserId;
      if (!copyText) return;
      navigator.clipboard.writeText(String(copyText));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    },
    [user.genUserId, user.username, resolvedUserId]
  );

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        closeAfterTransition
        slotProps={{
          backdrop: {
            sx: {
              bgcolor: 'rgba(9, 11, 16, 0.72)',
              backdropFilter: 'blur(10px)',
            },
          },
        }}
        sx={{
          zIndex: (th) => Math.max(th.zIndex.tooltip, th.zIndex.modal),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 3 },
        }}
      >
        <Fade in={open}>
          <UserDisplayerWrapper accountType={user.accountType}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: { xs: 2.25, sm: 2.75 },
                py: 1.5,
                borderBottom: '1px solid',
                borderColor: isDark ? alpha('#fff', 0.06) : '#e2e8f0',
                bgcolor: isDark ? alpha('#fff', 0.015) : '#f8fafc',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  fontSize: 11,
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                  color: isDark ? 'text.secondary' : '#64748b',
                }}
              >
                User Profile
              </Typography>

              <IconButton
                onClick={onClose}
                size="small"
                sx={{
                  color: 'text.secondary',
                  borderRadius: 0.5,
                  width: 26,
                  height: 26,
                  bgcolor: isDark ? alpha('#fff', 0.04) : '#ffffff',
                  border: '1px solid',
                  borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.error.main, 0.08),
                    color: 'error.main',
                    borderColor: alpha(theme.palette.error.main, 0.2),
                  },
                }}
              >
                <CloseRoundedIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Box>

            {/* Modal Body */}
            <Box
              sx={{
                p: { xs: 2.25, sm: 2.75 },
                display: 'flex',
                flexDirection: { xs: 'column-reverse', sm: 'row' },
                gap: { xs: 2.25, sm: 3 },
                alignItems: { xs: 'stretch', sm: 'center' },
              }}
            >
              {/* LEFT: User Details, Stats & Actions */}
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
                  {/* Name + Verified */}
                  <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75 }}>
                    <Typography
                      variant="h6"
                      noWrap
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: '1.15rem', sm: '1.3rem' },
                        lineHeight: 1.2,
                        color: isDark ? 'text.primary' : '#0f172a',
                      }}
                    >
                      {user.name}
                    </Typography>
                    {user.verified && (
                      <VerifiedRoundedIcon
                        sx={{ fontSize: 18, color: 'primary.main', flexShrink: 0 }}
                      />
                    )}
                  </Stack>

                  {/* Role Badge & Copyable Handle Pill */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.75}
                    sx={{ flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}
                  >
                    <Label
                      label={accountCfg.label}
                      size="small"
                      sx={{
                        height: 21,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: 0.4,
                        textTransform: 'uppercase',
                        bgcolor: accountCfg.bg,
                        color: accountCfg.color,
                        border: '1px solid',
                        borderColor: alpha(accountCfg.color, 0.3),
                        borderRadius: 0.75,
                        '&:hover': {
                          bgcolor: accountCfg.bg,
                          color: accountCfg.color,
                        },
                      }}
                    />

                    <Tooltip title={copied ? 'Copied!' : 'Click to copy'} arrow placement="top">
                      <Box
                        onClick={handleCopyHandle}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          height: 21,
                          px: 0.9,
                          cursor: 'pointer',
                          borderRadius: 0.75,
                          bgcolor: copied
                            ? alpha(theme.palette.success.main, 0.12)
                            : isDark
                              ? alpha('#fff', 0.04)
                              : '#f1f5f9',
                          border: '1px solid',
                          borderColor: copied
                            ? alpha(theme.palette.success.main, 0.3)
                            : isDark
                              ? alpha('#fff', 0.08)
                              : '#e2e8f0',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        <Typography
                          variant="caption"
                          noWrap
                          sx={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            color: copied ? 'success.main' : 'text.secondary',
                            maxWidth: 150,
                          }}
                        >
                          {displayHandle}
                        </Typography>
                        {copied ? (
                          <DoneRoundedIcon sx={{ fontSize: 11, color: 'success.main' }} />
                        ) : (
                          <ContentCopyRoundedIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
                        )}
                      </Box>
                    </Tooltip>
                  </Stack>

                  {/* Bio Box */}
                  {user.bio && (
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 2,
                        p: 1.25,
                        borderRadius: 0.5,
                        bgcolor: isDark ? alpha('#fff', 0.02) : '#f8fafc',
                        border: '1px solid',
                        borderColor: isDark ? alpha('#fff', 0.05) : '#f1f5f9',
                        color: isDark ? 'text.secondary' : '#475569',
                        fontSize: 12,
                        lineHeight: 1.45,
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

                {/* Stats Row */}
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 0.5,
                    bgcolor: isDark ? alpha('#fff', 0.025) : '#f8fafc',
                    border: '1px solid',
                    borderColor: isDark ? alpha('#fff', 0.07) : '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    mb: !isSelf ? 2 : 0,
                  }}
                >
                  {statItems.map(({ label, count }, index) => (
                    <Box key={label} sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <Box sx={{ textAlign: 'center', flex: 1, py: 0.25 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 800,
                            fontSize: 14,
                            color: isDark ? 'text.primary' : '#0f172a',
                            lineHeight: 1.2,
                          }}
                        >
                          {formatStatCount(count)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            fontSize: 9.5,
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            textTransform: 'uppercase',
                          }}
                        >
                          {label}
                        </Typography>
                      </Box>
                      {index < statItems.length - 1 && (
                        <Divider
                          orientation="vertical"
                          flexItem
                          sx={{
                            my: 0.5,
                            borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>

                {/* Action Buttons */}
                {!isSelf && (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ width: '100%', mt: 1 }}
                  >
                    {resolvedUserId && (
                      <ButtonRelationshipToggle
                        targetUser={{ id: resolvedUserId, name: user.name }}
                        size="small"
                        variant="soft"
                        sx={{ flex: 1, minWidth: '100px' }}
                        onStatsUpdate={handleStatsUpdate}
                      />
                    )}

                    <ButtonReportUser
                      variant="soft"
                      targetUserId={resolvedUserId}
                      size="small"
                      sx={{ flex: 1, minWidth: '100px' }}
                    />

                    <ButtonBlockUser
                      targetUserId={resolvedUserId}
                      userName={user.name}
                      isBlocked={isBlocked}
                      variant="soft"
                      size="small"
                      sx={{ flex: 1, minWidth: '100px' }}
                    />
                  </Stack>
                )}
              </Box>

              <AnimatedAvatar
                accountType={user.accountType}
                src={user.profilePhoto || undefined}
                name={user.name}
                size={210}
                ringGap={12}
                speed={4}
              />
            </Box>
          </UserDisplayerWrapper>
        </Fade>
      </Modal>

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

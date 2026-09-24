// src/components/button-relationship-toggle/button-relationship-toggle.tsx

import type { SxProps, Theme } from '@mui/material';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import {
  alpha,
  Button,
  CircularProgress,
  IconButton,
  Popover,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';

import { UserStats } from '@/types/type-social';
import { usePopover } from 'src/components/custom-popover';
import { Iconify } from 'src/components/iconify';
import { useFollowMutation, useUnfollowMutation } from 'src/core/apis';
import { selectAccount } from 'src/core/slices';
import { RelationshipTypeEnum } from 'src/enums/enum-social';

// ----------------------------------------------------------------------

export type FollowButtonVariant = 'icon' | 'button' | 'soft' | 'outlined';

export type ButtonRelationshipToggleProps = {
  targetUser: {
    id: string;
    name: string;
  };
  isFollow?: boolean;
  variant?: FollowButtonVariant;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  showConfirmPopover?: boolean;
  sx?: SxProps<Theme>;
  followSx?: SxProps<Theme>;
  unfollowSx?: SxProps<Theme>;
  onSuccessFollow?: (data: UserStats[]) => void;
  onSuccessUnfollow?: (data: UserStats[]) => void;
};

export function ButtonRelationshipToggle({
  targetUser,
  isFollow = false,
  variant = 'soft',
  size = 'small',
  fullWidth = false,
  showConfirmPopover = true,
  sx,
  followSx,
  unfollowSx,
  onSuccessFollow,
  onSuccessUnfollow
}: ButtonRelationshipToggleProps) {
  const theme = useTheme();
  const user = useSelector(selectAccount);
  const popover = usePopover();

  // Local state for optimistic UI updates + sync with parent props
  const [following, setFollowing] = useState<boolean>(isFollow);
  const [isHoveringFollowing, setIsHoveringFollowing] = useState(false);

  useEffect(() => {
    setFollowing(isFollow);
  }, [isFollow]);

  const [followMutate, { isLoading: isFollowLoading }] = useFollowMutation();
  const [unfollowMutate, { isLoading: isUnfollowLoading }] = useUnfollowMutation();
  const isLoading = isFollowLoading || isUnfollowLoading;


  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFollowing(true);
    try {
      const response = await followMutate({
        requester: user.userId,
        recipient: targetUser.id,
        type: RelationshipTypeEnum.FOLLOW,
      }).unwrap();
      if (response.status) {
        onSuccessFollow?.(response.data);
      }
    } catch {
      setFollowing(false);
    }
  };

  const handleConfirmUnfollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    popover.onClose();
    setFollowing(false);
    try {
      const response = await unfollowMutate({
        requester: user.userId,
        recipient: targetUser.id,
        type: RelationshipTypeEnum.FOLLOW,
      }).unwrap();
      if (response.status) {
        onSuccessUnfollow?.(response.data);
      }
    } catch {
      setFollowing(true);
    }
  };

  const handleUnfollowClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (showConfirmPopover) {
      popover.onOpen(e);
    } else {
      handleConfirmUnfollow(e);
    }
  };

  // ── 1. Popover Component with Safe Z-Index ────────────────────────
  const renderConfirmPopover = () => (
    <Popover
      disableRestoreFocus
      open={Boolean(popover.open)}
      anchorEl={popover.anchorEl}
      onClose={popover.onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{
        zIndex: 3200, // Explicitly higher than UserDisplayer (3000) and SocialChat drawers
      }}
      slotProps={{
        paper: {
          onClick: (e) => e.stopPropagation(),
          sx: {
            p: 1.5,
            width: 220,
            borderRadius: 1.5,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[12],
            bgcolor: 'background.paper',
          },
        },
      }}
    >
      <Stack direction="row" gap={1} alignItems="center" mb={1}>
        <Iconify icon="mingcute:question-fill" sx={{ width: 16, height: 16, color: 'warning.main' }} />
        <Typography variant="caption" fontWeight={600} noWrap>
          Unfollow {targetUser.name}?
        </Typography>
      </Stack>
      <Stack direction="row" gap={1} justifyContent="flex-end">
        <Button size="small" variant="outlined" color="inherit" onClick={popover.onClose}>
          Cancel
        </Button>
        <Button size="small" variant="contained" color="error" onClick={handleConfirmUnfollow}>
          Unfollow
        </Button>
      </Stack>
    </Popover>
  );

  // ── 2. Variant: ICON ──────────────────────────────────────────────
  if (variant === 'icon') {
    return (
      <>
        <IconButton
          size={size}
          disabled={isLoading}
          onClick={following ? handleUnfollowClick : handleFollow}
          sx={{
            p: size === 'small' ? '5px' : '7px',
            borderRadius: 1,
            color: following ? 'error.main' : 'primary.main',
            border: '1px solid',
            borderColor: following
              ? alpha(theme.palette.error.main, 0.4)
              : alpha(theme.palette.primary.main, 0.4),
            bgcolor: following
              ? alpha(theme.palette.error.main, 0.04)
              : alpha(theme.palette.primary.main, 0.04),
            '&:hover': {
              borderColor: following ? 'error.main' : 'primary.main',
              bgcolor: following
                ? alpha(theme.palette.error.main, 0.12)
                : alpha(theme.palette.primary.main, 0.12),
            },
            ...((following ? unfollowSx : followSx) as any),
            ...(sx as any),
          }}
        >
          {isLoading ? (
            <CircularProgress size={14} color="inherit" />
          ) : (
            <Iconify
              icon={following ? 'ri:user-unfollow-fill' : 'mingcute:user-follow-fill'}
              sx={{ width: 15, height: 15 }}
            />
          )}
        </IconButton>
        {renderConfirmPopover()}
      </>
    );
  }

  // ── 3. Variant: SOFT (Dynamic Hover: "Following" -> "Unfollow") ───
  if (variant === 'soft') {
    return (
      <>
        <Button
          fullWidth={fullWidth}
          size={size}
          disabled={isLoading}
          onClick={following ? handleUnfollowClick : handleFollow}
          onMouseEnter={() => setIsHoveringFollowing(true)}
          onMouseLeave={() => setIsHoveringFollowing(false)}
          startIcon={
            isLoading ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <Iconify
                icon={
                  following
                    ? isHoveringFollowing
                      ? 'ri:user-unfollow-line'
                      : 'mingcute:check-fill'
                    : 'mingcute:user-add-fill'
                }
                sx={{ width: 15, height: 15 }}
              />
            )
          }
          sx={{
            borderRadius: 1,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: size === 'small' ? 12 : 13,
            transition: 'all 0.18s ease',
            ...(following
              ? {
                color: isHoveringFollowing ? 'error.main' : 'text.primary',
                bgcolor: isHoveringFollowing
                  ? alpha(theme.palette.error.main, 0.12)
                  : alpha(theme.palette.text.primary, 0.06),
                border: '1px solid',
                borderColor: isHoveringFollowing
                  ? alpha(theme.palette.error.main, 0.3)
                  : theme.palette.divider,
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.16),
                },
                ...(unfollowSx as any),
              }
              : {
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.18),
                  borderColor: theme.palette.primary.main,
                },
                ...(followSx as any),
              }),
            ...(sx as any),
          }}
        >
          {following ? (isHoveringFollowing ? 'Unfollow' : 'Following') : 'Follow'}
        </Button>
        {renderConfirmPopover()}
      </>
    );
  }

  // ── 4. Variant: OUTLINED ──────────────────────────────────────────
  if (variant === 'outlined') {
    return (
      <>
        <Button
          fullWidth={fullWidth}
          size={size}
          disabled={isLoading}
          variant="outlined"
          color={following ? 'inherit' : 'primary'}
          onClick={following ? handleUnfollowClick : handleFollow}
          startIcon={
            isLoading ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <Iconify
                icon={following ? 'ri:user-unfollow-line' : 'mingcute:user-follow-line'}
                sx={{ width: 15, height: 15 }}
              />
            )
          }
          sx={{
            borderRadius: 1,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: size === 'small' ? 12 : 13,
            ...((following ? unfollowSx : followSx) as any),
            ...(sx as any),
          }}
        >
          {following ? 'Following' : 'Follow'}
        </Button>
        {renderConfirmPopover()}
      </>
    );
  }

  // ── 5. Variant: BUTTON (Contained Primary / Outlined Secondary) ───
  return (
    <>
      <Button
        fullWidth={fullWidth}
        size={size}
        disabled={isLoading}
        variant={following ? 'outlined' : 'contained'}
        color={following ? 'inherit' : 'primary'}
        onClick={following ? handleUnfollowClick : handleFollow}
        startIcon={
          isLoading ? (
            <CircularProgress size={14} color="inherit" />
          ) : (
            <Iconify
              icon={following ? 'mingcute:check-line' : 'mingcute:user-add-fill'}
              sx={{ width: 15, height: 15 }}
            />
          )
        }
        sx={{
          borderRadius: 1,
          fontWeight: 700,
          textTransform: 'none',
          fontSize: size === 'small' ? 12 : 13,
          boxShadow: following ? 'none' : `0 4px 12px ${alpha(theme.palette.primary.main, 0.28)}`,
          ...((following ? unfollowSx : followSx) as any),
          ...(sx as any),
        }}
      >
        {following ? 'Following' : 'Follow'}
      </Button>
      {renderConfirmPopover()}
    </>
  );
}

export default ButtonRelationshipToggle;

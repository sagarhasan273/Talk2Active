// src/components/button-relationship-toggle/button-relationship-toggle.tsx

import type { SxProps, Theme } from '@mui/material';

import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import {
  alpha,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Popover,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

import { UserStats } from '@/types/type-social';
import { usePopover } from 'src/components/custom-popover';
import { Iconify } from 'src/components/iconify';
import { useFollowMutation, useUnfollowMutation } from 'src/core/apis';
import { updateParticipants, useCredentials } from 'src/core/slices';
import { RelationshipTypeEnum } from 'src/enums/enum-social';

export type FollowButtonVariant = 'icon' | 'button' | 'soft' | 'outlined';

export type ButtonRelationshipToggleProps = {
  targetUser: {
    id: string;
    name: string;
  };
  variant?: FollowButtonVariant;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  showConfirmPopover?: boolean;
  sx?: SxProps<Theme>;
  followSx?: SxProps<Theme>;
  unfollowSx?: SxProps<Theme>;
  onStatsUpdate?: (data: UserStats[]) => void;
};

// 1. OPTIMIZATION: Wrapped in React.memo
const ButtonRelationshipToggleComponent = ({
  targetUser,
  variant = 'soft',
  size = 'small',
  fullWidth = false,
  showConfirmPopover = true,
  sx,
  followSx,
  unfollowSx,
  onStatsUpdate
}: ButtonRelationshipToggleProps) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const { user, checkIfFollowing, checkIfBlocked } = useCredentials();
  const popover = usePopover();

  const globalFollowing = checkIfFollowing(targetUser.id);
  const isBlocked = checkIfBlocked(targetUser.id);

  const [localFollowing, setLocalFollowing] = useState(globalFollowing);
  const [isHoveringFollowing, setIsHoveringFollowing] = useState(false);
  const [justFollowed, setJustFollowed] = useState(false);

  useEffect(() => {
    setLocalFollowing(globalFollowing);
  }, [globalFollowing]);

  const [followMutate, { isLoading: isFollowLoading }] = useFollowMutation();
  const [unfollowMutate, { isLoading: isUnfollowLoading }] = useUnfollowMutation();

  const isLoading = isFollowLoading || isUnfollowLoading;

  // 2. OPTIMIZATION: Wrapped all handlers in useCallback
  const handleFollow = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLocalFollowing(true);
    setJustFollowed(true);

    try {
      const response = await followMutate({
        requester: user?.userId,
        recipient: targetUser.id,
        type: RelationshipTypeEnum.FOLLOW,
      }).unwrap();

      if (response.status && response.data) {
        dispatch(updateParticipants(response.data));
        onStatsUpdate?.(response.data);
      }
    } catch {
      setLocalFollowing(false);
      setJustFollowed(false);
    }
  }, [followMutate, user?.userId, targetUser.id, dispatch, onStatsUpdate]);

  const handleConfirmUnfollow = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    popover.onClose();

    setLocalFollowing(false);
    setIsHoveringFollowing(false);

    try {
      const response = await unfollowMutate({
        requester: user?.userId,
        recipient: targetUser.id,
        type: RelationshipTypeEnum.FOLLOW,
      }).unwrap();

      if (response.status && response.data) {
        dispatch(updateParticipants(response.data));
        onStatsUpdate?.(response.data);
      }
    } catch {
      setLocalFollowing(true);
    }
  }, [unfollowMutate, user?.userId, targetUser.id, popover, dispatch, onStatsUpdate]);

  const handleUnfollowClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (showConfirmPopover) {
      popover.onOpen(e);
    } else {
      handleConfirmUnfollow(e);
    }
  }, [showConfirmPopover, popover, handleConfirmUnfollow]);

  const handleMouseLeave = useCallback(() => {
    setIsHoveringFollowing(false);
    setJustFollowed(false);
  }, []);

  const showUnfollowHover = isHoveringFollowing && !justFollowed;

  const renderWrappedButton = (buttonElement: React.ReactElement) => {
    if (isBlocked) {
      return (
        <Tooltip title="Unblock first" arrow placement="top">
          <Box
            component="span"
            sx={{
              display: fullWidth && variant !== 'icon' ? 'block' : 'inline-block',
              width: fullWidth && variant !== 'icon' ? '100%' : 'auto',
              cursor: 'not-allowed',
            }}
          >
            {React.cloneElement(buttonElement, {
              style: { ...buttonElement.props.style, pointerEvents: 'none' }
            })}
          </Box>
        </Tooltip>
      );
    }
    return buttonElement;
  };

  // 3. OPTIMIZATION: Only render popover node if showConfirmPopover is true
  const renderConfirmPopover = () => {
    if (!showConfirmPopover) return null;

    return (
      <Popover
        disableRestoreFocus
        open={Boolean(popover.open)}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ zIndex: 3200 }}
        slotProps={{
          paper: {
            onClick: (e) => e.stopPropagation(),
            sx: {
              p: 1.5,
              width: 220,
              borderRadius: 0.5,
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
  };

  // ... (The render blocks for 'icon', 'soft', 'outlined', and 'button' remain exactly the same)
  // ── 2. Variant: ICON ──────────────────────────────────────────────
  if (variant === 'icon') {
    return (
      <>
        {renderWrappedButton(
          <IconButton
            size={size}
            disabled={isLoading || isBlocked}
            onClick={localFollowing ? handleUnfollowClick : handleFollow}
            sx={{
              p: size === 'small' ? '5px' : '7px',
              borderRadius: 0.5,
              color: localFollowing ? 'error.main' : 'primary.main',
              border: '1px solid',
              borderColor: localFollowing
                ? alpha(theme.palette.error.main, 0.4)
                : alpha(theme.palette.primary.main, 0.4),
              bgcolor: localFollowing
                ? alpha(theme.palette.error.main, 0.04)
                : alpha(theme.palette.primary.main, 0.04),
              transition: 'all 0.2s ease-in-out',
              '@media (hover: hover) and (pointer: fine)': {
                '&:hover': {
                  bgcolor: localFollowing ? 'error.main' : 'primary.main',
                  borderColor: localFollowing ? 'error.main' : 'primary.main',
                  color: 'common.white',
                },
              },
              ...((localFollowing ? unfollowSx : followSx) as any),
              ...(sx as any),
            }}
          >
            {isLoading ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <Iconify
                icon={localFollowing ? 'ri:user-unfollow-fill' : 'mingcute:user-follow-fill'}
                sx={{ width: 15, height: 15 }}
              />
            )}
          </IconButton>
        )}
        {renderConfirmPopover()}
      </>
    );
  }

  // ── 3. Variant: SOFT ──────────────────────────────────────────────
  if (variant === 'soft') {
    return (
      <>
        {renderWrappedButton(
          <Button
            fullWidth={fullWidth}
            size={size}
            disabled={isLoading || isBlocked}
            onClick={localFollowing ? handleUnfollowClick : handleFollow}
            onMouseEnter={() => setIsHoveringFollowing(true)}
            onMouseLeave={handleMouseLeave}
            startIcon={
              isLoading ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <Iconify
                  icon={
                    localFollowing
                      ? showUnfollowHover
                        ? 'ri:user-unfollow-line'
                        : 'mingcute:check-fill'
                      : 'mingcute:user-add-fill'
                  }
                  sx={{ width: 15, height: 15 }}
                />
              )
            }
            sx={{
              borderRadius: 0.5,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: size === 'small' ? 12 : 13,
              transition: 'all 0.18s ease',
              ...(localFollowing
                ? {
                  color: showUnfollowHover ? 'error.main' : 'text.primary',
                  bgcolor: showUnfollowHover
                    ? alpha(theme.palette.error.main, 0.12)
                    : alpha(theme.palette.text.primary, 0.06),
                  border: '1px solid',
                  borderColor: showUnfollowHover
                    ? alpha(theme.palette.error.main, 0.3)
                    : theme.palette.divider,
                  '&:hover': {
                    bgcolor: showUnfollowHover
                      ? alpha(theme.palette.error.main, 0.16)
                      : alpha(theme.palette.text.primary, 0.08),
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
            {localFollowing ? (showUnfollowHover ? 'Unfollow' : 'Following') : 'Follow'}
          </Button>
        )}
        {renderConfirmPopover()}
      </>
    );
  }

  // ── 4. Variant: OUTLINED ──────────────────────────────────────────
  if (variant === 'outlined') {
    return (
      <>
        {renderWrappedButton(
          <Button
            fullWidth={fullWidth}
            size={size}
            disabled={isLoading || isBlocked}
            variant="outlined"
            color={localFollowing ? 'inherit' : 'primary'}
            onClick={localFollowing ? handleUnfollowClick : handleFollow}
            startIcon={
              isLoading ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <Iconify
                  icon={localFollowing ? 'ri:user-unfollow-line' : 'mingcute:user-follow-line'}
                  sx={{ width: 15, height: 15 }}
                />
              )
            }
            sx={{
              borderRadius: 0.5,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: size === 'small' ? 12 : 13,
              ...((localFollowing ? unfollowSx : followSx) as any),
              ...(sx as any),
            }}
          >
            {localFollowing ? 'Following' : 'Follow'}
          </Button>
        )}
        {renderConfirmPopover()}
      </>
    );
  }

  // ── 5. Variant: BUTTON ────────────────────────────────────────────
  return (
    <>
      {renderWrappedButton(
        <Button
          fullWidth={fullWidth}
          size={size}
          disabled={isLoading || isBlocked}
          variant={localFollowing ? 'outlined' : 'contained'}
          color={localFollowing ? 'inherit' : 'primary'}
          onClick={localFollowing ? handleUnfollowClick : handleFollow}
          startIcon={
            isLoading ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <Iconify
                icon={localFollowing ? 'mingcute:check-line' : 'mingcute:user-add-fill'}
                sx={{ width: 15, height: 15 }}
              />
            )
          }
          sx={{
            borderRadius: 0.5,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: size === 'small' ? 12 : 13,
            boxShadow: localFollowing ? 'none' : `0 4px 12px ${alpha(theme.palette.primary.main, 0.28)}`,
            ...((localFollowing ? unfollowSx : followSx) as any),
            ...(sx as any),
          }}
        >
          {localFollowing ? 'Following' : 'Follow'}
        </Button>
      )}
      {renderConfirmPopover()}
    </>
  );
};

export const ButtonRelationshipToggle = React.memo(ButtonRelationshipToggleComponent, (prevProps, nextProps) => {
  return prevProps.targetUser.id === nextProps.targetUser.id &&
    prevProps.variant === nextProps.variant &&
    prevProps.size === nextProps.size;
});

export default ButtonRelationshipToggle;

// src/components/button-block-user/button-block-user.tsx

import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import {
  alpha,
  Button,
  CircularProgress,
  IconButton,
  Popover,
  Stack,
  type SxProps,
  type Theme,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useCallback } from 'react';

import { useBlockUserMutation, useUnblockUserMutation } from '@/core/apis/api-social';
import { useCredentials } from '@/core/slices';
import { usePopover } from 'src/components/custom-popover';
import { Iconify } from 'src/components/iconify';

export type BlockButtonVariant = 'icon' | 'soft' | 'outlined' | 'button';

export type ButtonBlockUserProps = {
  targetUserId: string;
  userName?: string;
  isBlocked?: boolean;
  onSuccess?: () => void;
  variant?: BlockButtonVariant;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  showConfirmPopover?: boolean;
  sx?: SxProps<Theme>;
};

export const ButtonBlockUser = ({
  targetUserId,
  userName = 'this user',
  isBlocked = false,
  onSuccess,
  variant = 'icon',
  size = 'small',
  fullWidth = false,
  showConfirmPopover = true,
  sx,
}: ButtonBlockUserProps) => {
  const theme = useTheme();
  const popover = usePopover();

  const { user, checkIfBlocked } = useCredentials();
  const currentUserId = user?.userId;

  const [blockUser, { isLoading: blockLoading }] = useBlockUserMutation();
  const [unblockUser, { isLoading: unblockLoading }] = useUnblockUserMutation();

  // Combine loading states so the UI reacts to both blocking and unblocking
  const isLoading = blockLoading || unblockLoading;

  // Use the most accurate block state (prop vs global context)
  const isCurrentlyBlocked = isBlocked || checkIfBlocked(targetUserId);

  const handleAction = useCallback(async () => {
    if (!targetUserId || !currentUserId) return;

    try {
      if (!isCurrentlyBlocked) {
        await blockUser({ requester: currentUserId, recipient: targetUserId }).unwrap();
      } else {
        await unblockUser({ requester: currentUserId, recipient: targetUserId }).unwrap();
      }
      onSuccess?.();
    } catch (error) {
      console.error('Failed to toggle block status:', error);
    } finally {
      popover.onClose();
    }
  }, [blockUser, unblockUser, currentUserId, targetUserId, isCurrentlyBlocked, onSuccess, popover]);

  const handleTriggerClick = (event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();

    if (!isCurrentlyBlocked && showConfirmPopover) {
      popover.onOpen(event as any);
    } else {
      handleAction();
    }
  };

  const renderPopover = () => (
    <Popover
      disableRestoreFocus
      open={popover.open}
      anchorEl={popover.anchorEl}
      onClose={(e: any) => {
        if (e?.stopPropagation) e.stopPropagation();
        popover.onClose();
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{
        zIndex: 3200,
      }}
      slotProps={{
        paper: {
          sx: {
            p: 1.5,
            width: 220,
            borderRadius: 0.5,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[8],
          },
        },
      }}
    >
      <Stack direction="row" gap={1} alignItems="center" mb={1.25}>
        <Iconify icon="mingcute:warning-fill" sx={{ width: 16, height: 16, color: 'error.main' }} />
        <Typography variant="caption" fontWeight={600}>
          Block {userName}?
        </Typography>
      </Stack>
      <Stack direction="row" gap={1} justifyContent="flex-end">
        <Button size="small" variant="outlined" color="inherit" onClick={popover.onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button size="small" variant="contained" color="error" onClick={handleAction} disabled={isLoading}>
          {isLoading ? 'Wait...' : 'Confirm'}
        </Button>
      </Stack>
    </Popover>
  );

  const iconOrSpinner = isLoading ? (
    <CircularProgress size={16} color="inherit" />
  ) : (
    <BlockRoundedIcon sx={{ fontSize: size === 'small' ? 17 : 19 }} />
  );

  // ── 1. Variant: ICON ──────────────────────────────────────────────
  if (variant === 'icon') {
    return (
      <>
        <Tooltip title={isCurrentlyBlocked ? 'Unblock user' : 'Block user'} arrow placement="top">
          <IconButton
            size={size}
            onClick={handleTriggerClick}
            disabled={isLoading}
            sx={{
              px: 1,
              borderRadius: 0.5,
              border: '1px solid',
              borderColor: isCurrentlyBlocked ? 'error.main' : 'divider',
              color: isCurrentlyBlocked ? 'error.main' : 'text.secondary',
              bgcolor: isCurrentlyBlocked ? alpha(theme.palette.error.main, 0.1) : 'transparent',
              transition: 'all 0.18s ease',
              '&:hover': {
                borderColor: 'error.main',
                color: 'error.main',
                bgcolor: alpha(theme.palette.error.main, 0.12),
              },
              ...sx,
            }}
          >
            {iconOrSpinner}
          </IconButton>
        </Tooltip >
        {renderPopover()}
      </>
    );
  }

  // ── 2. Variant: SOFT ──────────────────────────────────────────────
  if (variant === 'soft') {
    return (
      <>
        <Button
          fullWidth={fullWidth}
          size={size}
          onClick={handleTriggerClick}
          disabled={isLoading}
          startIcon={iconOrSpinner}
          sx={{
            px: 1,
            borderRadius: 0.5,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: size === 'small' ? 12 : 13,
            color: isCurrentlyBlocked ? 'text.secondary' : 'error.main',
            bgcolor: alpha(theme.palette.error.main, isCurrentlyBlocked ? 0 : 0.08),
            border: isCurrentlyBlocked ? `1px solid ${alpha(theme.palette.text.secondary, 0.2)}` : `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.16),
              borderColor: 'error.main',
              color: 'error.main',
            },
            ...sx,
          }}
        >
          {isCurrentlyBlocked ? 'Unblock' : 'Block'}
        </Button>
        {renderPopover()}
      </>
    );
  }

  // ── 3. Variant: OUTLINED ──────────────────────────────────────────
  if (variant === 'outlined') {
    return (
      <>
        <Button
          fullWidth={fullWidth}
          size={size}
          variant="outlined"
          color={isCurrentlyBlocked ? 'inherit' : 'error'}
          onClick={handleTriggerClick}
          disabled={isLoading}
          startIcon={iconOrSpinner}
          sx={{
            px: 1,
            borderRadius: 0.5,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: size === 'small' ? 12 : 13,
            ...sx,
          }}
        >
          {isCurrentlyBlocked ? 'Unblock' : 'Block'}
        </Button>
        {renderPopover()}
      </>
    );
  }

  // ── 4. Variant: BUTTON (Contained) ────────────────────────────────
  return (
    <>
      <Button
        fullWidth={fullWidth}
        size={size}
        variant={isCurrentlyBlocked ? 'outlined' : 'contained'}
        color={isCurrentlyBlocked ? 'inherit' : 'error'}
        onClick={handleTriggerClick}
        disabled={isLoading}
        startIcon={iconOrSpinner}
        sx={{
          px: 1,
          borderRadius: 0.5,
          fontWeight: 700,
          textTransform: 'none',
          fontSize: size === 'small' ? 12 : 13,
          boxShadow: isCurrentlyBlocked ? 'none' : `0 4px 12px ${alpha(theme.palette.error.main, 0.28)}`,
          ...sx,
        }}
      >
        {isCurrentlyBlocked ? 'Unblock' : 'Block'}
      </Button>
      {renderPopover()}
    </>
  );
};

export default ButtonBlockUser;

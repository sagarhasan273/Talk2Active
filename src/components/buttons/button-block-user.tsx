// src/components/button-block-user/button-block-user.tsx

import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import {
  alpha,
  Button,
  IconButton,
  Popover,
  Stack,
  type SxProps,
  type Theme,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import React from 'react';

import { usePopover } from 'src/components/custom-popover';
import { Iconify } from 'src/components/iconify';

export type BlockButtonVariant = 'icon' | 'soft' | 'outlined' | 'button';

export type ButtonBlockUserProps = {
  userId: string;
  userName?: string;
  isBlocked?: boolean;
  onBlockUser: (userId: string) => void;
  variant?: BlockButtonVariant;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  showConfirmPopover?: boolean;
  sx?: SxProps<Theme>;
};

export const ButtonBlockUser = ({
  userId,
  userName = 'this user',
  isBlocked = false,
  onBlockUser,
  variant = 'icon',
  size = 'small',
  fullWidth = false,
  showConfirmPopover = true,
  sx,
}: ButtonBlockUserProps) => {
  const theme = useTheme();
  const popover = usePopover();

  const handleTriggerClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (!isBlocked && showConfirmPopover) {
      popover.onOpen(event);
    } else {
      onBlockUser(userId);
    }
  };

  const handleConfirm = (event: React.MouseEvent) => {
    event.stopPropagation();
    popover.onClose();
    onBlockUser(userId);
  };

  const renderPopover = () => (
    <Popover
      disableRestoreFocus
      open={popover.open}
      anchorEl={popover.anchorEl}
      onClose={popover.onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      slotProps={{
        paper: {
          sx: {
            p: 1.5,
            width: 220,
            borderRadius: 1.5,
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
        <Button size="small" variant="outlined" color="inherit" onClick={popover.onClose}>
          Cancel
        </Button>
        <Button size="small" variant="contained" color="error" onClick={handleConfirm}>
          Confirm
        </Button>
      </Stack>
    </Popover>
  );

  // ── 1. Variant: ICON ──────────────────────────────────────────────
  if (variant === 'icon') {
    return (
      <>
        <Tooltip title={isBlocked ? 'Unblock user' : 'Block user'} arrow placement="top">
          <IconButton
            size={size}
            onClick={handleTriggerClick}
            sx={{
              width: size === 'small' ? 36 : 40,
              height: size === 'small' ? 36 : 40,
              borderRadius: 1.25,
              border: '1px solid',
              borderColor: isBlocked ? 'error.main' : 'divider',
              color: isBlocked ? 'error.main' : 'text.secondary',
              bgcolor: isBlocked ? alpha(theme.palette.error.main, 0.1) : 'transparent',
              transition: 'all 0.18s ease',
              '&:hover': {
                borderColor: 'error.main',
                color: 'error.main',
                bgcolor: alpha(theme.palette.error.main, 0.12),
              },
              ...sx,
            }}
          >
            <BlockRoundedIcon sx={{ fontSize: size === 'small' ? 17 : 19 }} />
          </IconButton>
        </Tooltip>
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
          startIcon={<BlockRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{
            height: size === 'small' ? 36 : 40,
            borderRadius: 1.25,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: size === 'small' ? 12 : 13,
            color: 'error.main',
            bgcolor: alpha(theme.palette.error.main, 0.08),
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.16),
              borderColor: 'error.main',
            },
            ...sx,
          }}
        >
          {isBlocked ? 'Unblock' : 'Block'}
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
          color="error"
          onClick={handleTriggerClick}
          startIcon={<BlockRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{
            height: size === 'small' ? 36 : 40,
            borderRadius: 1.25,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: size === 'small' ? 12 : 13,
            ...sx,
          }}
        >
          {isBlocked ? 'Unblock' : 'Block'}
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
        variant="contained"
        color="error"
        onClick={handleTriggerClick}
        startIcon={<BlockRoundedIcon sx={{ fontSize: 16 }} />}
        sx={{
          height: size === 'small' ? 36 : 40,
          borderRadius: 1.25,
          fontWeight: 700,
          textTransform: 'none',
          fontSize: size === 'small' ? 12 : 13,
          boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.28)}`,
          ...sx,
        }}
      >
        {isBlocked ? 'Unblock' : 'Block'}
      </Button>
      {renderPopover()}
    </>
  );
};

export default ButtonBlockUser;

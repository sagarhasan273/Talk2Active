import { Button, IconButton, Popover, Stack, Typography, type SxProps } from '@mui/material';
import React, { useCallback } from 'react';

import { useUnfollowMutation } from '@/core/apis';
import { useCredentials } from '@/core/slices';
import { RelationshipTypeEnum } from '@/enums/enum-social';
import { usePopover } from 'src/components/custom-popover';
import { Iconify } from 'src/components/iconify';

type ButtonUnfollowIconProps = {
  title?: string;
  onConfirm?: (event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => void;
  targetUserId?: string;
  currentUserId?: string;
  onSuccess?: (data: any) => void;
  sx?: SxProps;
};

export function ButtonUnfollowIcon({
  title = 'Do you want to unfollow?',
  targetUserId,
  currentUserId,
  onConfirm,
  onSuccess,
  sx,
}: ButtonUnfollowIconProps) {
  const popover = usePopover();
  const { user } = useCredentials();
  const [unfollowMutate, { isLoading: isUnfollowLoading }] = useUnfollowMutation();

  const requesterId = currentUserId || user?.userId;

  const handleAction = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      // If we are missing IDs, fallback to the custom onConfirm prop
      if (!targetUserId || !requesterId) {
        onConfirm?.(event);
        popover.onClose();
        return;
      }

      try {
        const response = await unfollowMutate({
          requester: requesterId,
          recipient: targetUserId,
          type: RelationshipTypeEnum.FOLLOW,
        }).unwrap();

        if (response?.status) {
          onSuccess?.(response.data);
        }
      } catch (error) {
        console.error('Failed to unfollow:', error);
      } finally {
        popover.onClose();
      }
    },
    [targetUserId, requesterId, unfollowMutate, onSuccess, onConfirm, popover]
  );

  const handleOpenPopover = useCallback(
    (event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      popover.onOpen(event as React.MouseEvent<HTMLButtonElement>);
    },
    [popover]
  );

  const handleClosePopover = useCallback(
    (event?: any) => {
      // Safely call stopPropagation if the event supports it (MUI backdrop clicks pass generic events)
      if (event && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
      }
      popover.onClose();
    },
    [popover]
  );

  return (
    <>
      <IconButton
        onClick={handleOpenPopover}
        onTouchEnd={(e) => {
          // Prevent ghost clicks on mobile devices
          e.preventDefault();
          handleOpenPopover(e);
        }}
        disableRipple
        sx={{
          p: '4px',
          ml: 'auto',
          borderRadius: 0.5,
          color: 'error.main',
          border: (theme) => `1px solid ${theme.palette.error.main}`,
          '&:hover': {
            color: (theme) => `${theme.palette.error.dark} !important`,
            border: (theme) => `1px solid ${theme.palette.error.dark}`,
          },
          ...sx,
        }}
      >
        <Iconify icon="ri:user-unfollow-fill" sx={{ width: 14, height: 14 }} />
      </IconButton>

      <Popover
        disableRestoreFocus
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              p: 1,
              width: 1,
              maxWidth: 220,
              display: 'flex',
              flexDirection: 'column',
              border: (theme) => `1px solid ${theme.palette.divider}`,
            },
          },
        }}
      >
        <Stack direction="row" gap={1} alignItems="center">
          <Iconify icon="mingcute:question-fill" sx={{ width: 14 }} />
          <Typography variant="caption">{title}</Typography>
        </Stack>

        <Stack direction="row" gap={1} mt={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={handleClosePopover}
            disabled={isUnfollowLoading}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={handleAction}
            disabled={isUnfollowLoading}
          >
            {isUnfollowLoading ? 'Wait...' : 'Confirm'}
          </Button>
        </Stack>
      </Popover>
    </>
  );
}

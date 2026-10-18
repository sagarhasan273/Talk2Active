// src/components/button-relationship-toggle/button-follow-icon.tsx

import { Button, IconButton, Popover, Stack, Typography, type SxProps } from '@mui/material';
import React, { useCallback } from 'react';

import { useFollowMutation } from '@/core/apis';
import { useCredentials } from '@/core/slices';
import { RelationshipTypeEnum } from '@/enums/enum-social';
import { usePopover } from 'src/components/custom-popover';
import { Iconify } from 'src/components/iconify';

type ButtonFollowIconProps = {
  title?: string;
  onConfirm?: (event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => void;
  targetUserId?: string;
  currentUserId?: string;
  onSuccess?: (data: any) => void;
  onPopover?: boolean;
  sx?: SxProps;
};

export function ButtonFollowIcon({
  title = 'Do you want to follow?',
  targetUserId,
  currentUserId,
  onConfirm,
  onSuccess,
  onPopover = true,
  sx,
}: ButtonFollowIconProps) {
  const popover = usePopover();
  const { user } = useCredentials();
  const [followMutate, { isLoading: isFollowLoading }] = useFollowMutation();

  const requesterId = currentUserId || user?.userId;

  const handleAction = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (!targetUserId || !requesterId) {
        onConfirm?.(event);
        popover.onClose();
        return;
      }

      try {
        const response = await followMutate({
          requester: requesterId,
          recipient: targetUserId,
          type: RelationshipTypeEnum.FOLLOW,
        }).unwrap();

        if (response?.status) {
          onSuccess?.(response.data);
        }
      } catch (error) {
        console.error('Failed to follow:', error);
      } finally {
        popover.onClose();
      }
    },
    [targetUserId, requesterId, followMutate, onSuccess, onConfirm, popover]
  );

  const handleInteraction = useCallback(
    (event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (onPopover) {
        popover.onOpen(event as any);
      } else {
        handleAction(event);
      }
    },
    [onPopover, popover, handleAction]
  );

  const handleClosePopover = useCallback(
    (event?: any) => {
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
        onClick={handleInteraction}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleInteraction(e);
        }}
        disableRipple
        sx={{
          p: '4px',
          ml: 'auto',
          borderRadius: 0.5,
          color: 'primary.main',
          border: (theme) => `1px solid ${theme.palette.primary.main}`,
          '&:hover': {
            color: (theme) => `${theme.palette.primary.dark} !important`,
            border: (theme) => `1px solid ${theme.palette.primary.dark}`,
          },
          ...sx,
        }}
      >
        <Iconify icon="mingcute:user-follow-fill" sx={{ width: 14, height: 14 }} />
      </IconButton>

      {onPopover && (
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
              disabled={isFollowLoading}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={handleAction}
              disabled={isFollowLoading}
            >
              {isFollowLoading ? 'Wait...' : 'Confirm'}
            </Button>
          </Stack>
        </Popover>
      )}
    </>
  );
}

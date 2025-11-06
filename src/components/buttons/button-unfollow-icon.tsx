import { Stack, Button, Popover, Typography, IconButton } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';

type ButtonUnfollowIconProps = {
  title: string;
  onConfirm: React.MouseEventHandler<HTMLButtonElement>;
};

export function ButtonUnfollowIcon({
  title = 'Do you want to unfollow?',
  onConfirm,
}: ButtonUnfollowIconProps) {
  const popover = usePopover();

  return (
    <>
      <IconButton
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
        }}
        onClick={(event) => {
          event.stopPropagation();
          popover.onOpen(event);
        }}
        disableRipple
      >
        <Iconify icon="ri:user-unfollow-fill" sx={{ width: 14, height: 14 }} />
      </IconButton>
      <Popover
        disableRestoreFocus
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={() => {
          popover.onClose();
        }}
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
          <Button size="small" variant="outlined" onClick={popover.onClose}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={(event) => {
              onConfirm(event);
              popover.onClose();
            }}
          >
            Confirm
          </Button>
        </Stack>
      </Popover>
    </>
  );
}

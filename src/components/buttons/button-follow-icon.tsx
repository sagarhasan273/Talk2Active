import { Stack, Button, Popover, Typography, IconButton } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';

type ButtonFollowIconProps = {
  title: string;
  onConfirm: React.MouseEventHandler<HTMLButtonElement>;
  onPopover?: boolean;
};

export function ButtonFollowIcon({
  title = 'Do you want to unfollow?',
  onConfirm,
  onPopover = true,
}: ButtonFollowIconProps) {
  const popover = usePopover();

  return (
    <>
      <IconButton
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
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (onPopover) {
            popover.onOpen(event);
          } else {
            onConfirm(event);
          }
        }}
        disableRipple
      >
        <Iconify icon="mingcute:user-follow-fill" sx={{ width: 14, height: 14 }} />
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
          <Button size="small" variant="contained" color="error" onClick={onConfirm}>
            Confirm
          </Button>
        </Stack>
      </Popover>
    </>
  );
}

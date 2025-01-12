import type { IconButtonProps } from '@mui/material/IconButton';

import IconButton from '@mui/material/IconButton';
import MessageIcon from '@mui/icons-material/Message';

// ----------------------------------------------------------------------

type MessageButtonProps = IconButtonProps;

export function MessageButton({ sx, ...other }: MessageButtonProps) {
  return (
    <IconButton sx={sx} {...other}>
      <MessageIcon />
    </IconButton>
  );
}

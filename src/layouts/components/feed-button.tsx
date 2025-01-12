import type { IconButtonProps } from '@mui/material/IconButton';

import FeedIcon from '@mui/icons-material/Feed';
import IconButton from '@mui/material/IconButton';

// ----------------------------------------------------------------------

type FeedButtonProps = IconButtonProps;

export function FeedButton({ sx, ...other }: FeedButtonProps) {
  return (
    <IconButton sx={sx} {...other}>
      <FeedIcon />
    </IconButton>
  );
}

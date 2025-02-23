import type { IconButtonProps } from '@mui/material/IconButton';

import FeedIcon from '@mui/icons-material/Feed';
import IconButton from '@mui/material/IconButton';

import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

type FeedButtonProps = IconButtonProps;

export function FeedButton({ sx, ...other }: FeedButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push('feed');
  };

  return (
    <IconButton onClick={handleClick} sx={sx} {...other}>
      <FeedIcon />
    </IconButton>
  );
}

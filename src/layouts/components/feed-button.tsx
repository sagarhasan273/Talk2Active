import type { IconButtonProps } from '@mui/material/IconButton';

import IconButton from '@mui/material/IconButton';
import { SvgIcon, Typography } from '@mui/material';

import { useRouter } from 'src/routes/route-hooks';

// ----------------------------------------------------------------------

type FeedButtonProps = IconButtonProps & { active: string; onClickActive: () => void };

export function FeedButton({ sx, active, onClickActive, ...other }: FeedButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push('');
    onClickActive();
  };

  return (
    <IconButton
      onClick={handleClick}
      sx={{
        color: 'primary.main',
        display: 'flex',
        flexDirection: 'column',
        ustifyContent: 'center',
        alignItems: 'center',
        ...(active === 'home' && { color: 'primary.dark' }),
        ...sx,
      }}
      disableRipple
      {...other}
    >
      <SvgIcon>
        <path
          fill="currentColor"
          d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h11l5 5v11q0 .825-.587 1.413T19 21zm0-2h14V9h-4V5H5zm2-2h10v-2H7zm0-8h5V7H7zm0 4h10v-2H7zM5 5v4zv14z"
        />
      </SvgIcon>
      <Typography variant="caption">Feed</Typography>
    </IconButton>
  );
}

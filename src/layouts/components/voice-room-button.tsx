import type { IconButtonProps } from '@mui/material/IconButton';

import { SvgIcon } from '@mui/material';
import IconButton from '@mui/material/IconButton';

import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

type VoiceRoomButtonProps = IconButtonProps;

export function VoiceRoomButton({ sx, ...other }: VoiceRoomButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push('voice-room');
  };

  return (
    <IconButton onClick={handleClick} sx={{ color: 'primary.main', mr: 0.8, ...sx }} {...other}>
      <SvgIcon>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 22">
          <path
            fill="currentColor"
            d="M9 5a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c2.67 0 8 1.34 8 4v2H1v-2c0-2.66 5.33-4 8-4m7.76-9.64c2.02 2.2 2.02 5.25 0 7.27l-1.68-1.69c.84-1.18.84-2.71 0-3.89zM20.07 2c3.93 4.05 3.9 10.11 0 14l-1.63-1.63c2.77-3.18 2.77-7.72 0-10.74z"
          />
        </svg>
      </SvgIcon>
    </IconButton>
  );
}

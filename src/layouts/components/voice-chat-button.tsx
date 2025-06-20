import type { IconButtonProps } from '@mui/material/IconButton';

import { SvgIcon } from '@mui/material';
import IconButton from '@mui/material/IconButton';

import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

type VoiceChatButtonProps = IconButtonProps;

export function VoiceChatButton({ sx, ...other }: VoiceChatButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push('voice-chat');
  };

  return (
    <IconButton onClick={handleClick} sx={{ color: 'primary.main', ...sx }} {...other}>
      <SvgIcon>
        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M6 11h1.5V9H6zm2.5 2H10V7H8.5zm2.75 2h1.5V5h-1.5zM14 13h1.5V7H14zm2.5-2H18V9h-1.5zM2 22V4q0-.825.588-1.412T4 2h16q.825 0 1.413.588T22 4v12q0 .825-.587 1.413T20 18H6z"
          />
        </svg>
      </SvgIcon>
    </IconButton>
  );
}

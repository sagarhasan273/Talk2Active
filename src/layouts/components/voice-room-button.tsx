import type { IconButtonProps } from '@mui/material/IconButton';

import IconButton from '@mui/material/IconButton';
import { SvgIcon, Typography } from '@mui/material';

import { useRouter } from 'src/routes/route-hooks';

// ----------------------------------------------------------------------

type VoiceRoomButtonProps = IconButtonProps & { active: string; onClickActive: () => void };

export function VoiceRoomButton({ sx, active, onClickActive, ...other }: VoiceRoomButtonProps) {
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
        mr: 0.8,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        ...(active === 'voice-room' && { color: 'primary.dark' }),
        ...sx,
      }}
      disableRipple
      {...other}
    >
      <SvgIcon>
        <g fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2.5 12c0-4.478 0-6.718 1.391-8.109S7.521 2.5 12 2.5c4.478 0 6.718 0 8.109 1.391S21.5 7.521 21.5 12c0 4.478 0 6.718-1.391 8.109S16.479 21.5 12 21.5c-4.478 0-6.718 0-8.109-1.391S2.5 16.479 2.5 12Z" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v8m-3-6v4m-3-3v2m9-3v4m3-3v2"
          />
        </g>
      </SvgIcon>
      <Typography variant="caption">Voice</Typography>
    </IconButton>
  );
}

import React from 'react';

import { Box, SvgIcon, Typography, ButtonBase } from '@mui/material';

type VoiceRoomFindButtonProps = {
  onClick?: () => void;
  selected?: boolean;
};

const VoiceRoomFindButton = ({ onClick, selected = false }: VoiceRoomFindButtonProps) => (
  <ButtonBase
    onClick={onClick}
    sx={{
      width: 1,
      height: 50,
      bgcolor: selected ? 'background.paper' : 'background.default',
      borderRadius: '8px',
      display: 'flex',
      color: selected ? 'primary.main' : 'text.primary',
      alignItems: 'center',
      px: 1.5,
      mb: 1,
      gap: 1.5,
      textAlign: 'left',
      transition: 'all 0.2s ease',
      border: selected
        ? (theme) => `1px solid ${theme.palette.primary.main}`
        : '1px solid transparent',
      '&:hover': {
        bgcolor: 'background.paper',
      },
      '&:active': {
        transform: 'scale(0.98)',
      },
    }}
  >
    {/* Room Text Info */}

    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <SvgIcon sx={{ color: 'currentColor' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
          <path
            fill="currentColor"
            d="M440 424V88h-88V13.005L88 58.522V424H16v32h86.9L352 490.358V120h56v336h88v-32Zm-120 29.642l-200-27.586V85.478L320 51Z"
          />
          <path fill="currentColor" d="M256 232h32v64h-32z" />
        </svg>
      </SvgIcon>
      <Typography
        variant="body2"
        noWrap
        sx={{ color: 'currentColor', fontWeight: 600, fontSize: '0.875rem' }}
      >
        Find a room
      </Typography>
    </Box>
  </ButtonBase>
);

export default VoiceRoomFindButton;

import { Stack, Typography, useTheme } from '@mui/material';
import React from 'react';

function Logo() {
  const theme = useTheme();
  return (
    <Stack sx={{ justifyContent: 'center' }}>
      <Typography sx={{ textAlign: 'center', fontSize: '24px', fontWeight: 700, color: theme.palette.text.secondary2 }}>
        Talk2Active
      </Typography>
    </Stack>
  );
}

export default Logo;

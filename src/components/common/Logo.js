import { Stack, Typography } from '@mui/material';
import React from 'react';

function Logo() {
  return (
    <Stack sx={{ justifyContent: 'center' }}>
      <Typography sx={{ textAlign: 'center', fontSize: '24px', fontWeight: 700 }}>Talk2Active</Typography>
    </Stack>
  );
}

export default Logo;

import type { ReactNode } from 'react';

import { Box } from '@mui/material';

type VoiceTabPanelProps = {
  children: ReactNode;
  value: number;
  index: number;
};

export function VoiceTabPanel({ children, value, index }: VoiceTabPanelProps) {
  const active = value === index;

  return (
    <Box
      role="tabpanel"
      aria-hidden={!active}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        display: active ? 'flex' : 'none',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}

import React from 'react';

import { Box } from '@mui/material';

import { accent, barBounce } from './theme-tokens';

const BAR_HEIGHTS = [8, 12, 6];

/** Three animated bars indicating the active speaker. */
export const WaveformIndicator = () => (
  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 12, mt: 1 }}>
    {BAR_HEIGHTS.map((height, i) => (
      <Box
        key={i}
        sx={{
          width: 4,
          height,
          borderRadius: 0.5,
          bgcolor: accent.brand,
          animation: `${barBounce} 1s infinite`,
          animationDelay: `${i * 0.2}s`,
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      />
    ))}
  </Box>
);

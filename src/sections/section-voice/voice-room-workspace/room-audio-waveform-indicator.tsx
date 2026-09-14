import { Box, keyframes, useTheme } from '@mui/material';

const barBounce = keyframes`
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
`;

const BAR_HEIGHTS = [8, 12, 6];

/** Three animated bars indicating the active speaker. */
export const WaveformIndicator = () => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 12, mt: 1 }}>
      {BAR_HEIGHTS.map((height, i) => (
        <Box
          key={i}
          sx={{
            width: 4,
            height,
            borderRadius: 0.5,
            bgcolor: theme.palette.primary.main,
            animation: `${barBounce} 1s infinite`,
            animationDelay: `${i * 0.2}s`,
            transformOrigin: 'bottom',
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />
      ))}
    </Box>
  );
};

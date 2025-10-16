import type { UseCounterReturn } from 'src/hooks/use-counter';

import { Box, Button, useTheme, Typography } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

export interface Profile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  followers: number;
  following: number;
  isFollowing?: boolean;
}

interface EngagementProfileShiftProps {
  counter: UseCounterReturn;
}

export default function EngagementProfileShift({ counter }: EngagementProfileShiftProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Button
        endIcon={
          <Box
            component="span"
            sx={{
              display: counter.value === 0 ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 18,
              height: 18,
              color: 'primary.main',
            }}
          >
            <Typography variant="subtitle2">{counter.value}</Typography>
          </Box>
        }
        onClick={counter.onDecrement}
        sx={{
          position: 'relative',
          py: 2,
          borderRadius: 0,
          bgcolor: 'background.neutral',
          color: 'text.primary',
          fontWeight: 500,
          overflow: 'hidden',
          transition: 'transform 0.2s',
          borderRight: `1px solid ${theme.palette.background.paper}`,
          '&:hover': {
            bgcolor: 'background.paper',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            background: `linear-gradient(to left, ${varAlpha(theme.palette.primary.mainChannel, 0.32)}, ${varAlpha(theme.palette.primary.mainChannel, 0.1)}, transparent)`,
          },
        }}
        disabled={counter.value <= 0}
        fullWidth
      >
        Prev
      </Button>
      <Button
        startIcon={
          <Box
            component="span"
            sx={{
              display: counter.value >= counter.maxValue ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 18,
              height: 18,
              color: 'primary.main',
            }}
          >
            <Typography variant="subtitle2">{counter.maxValue - counter.value}</Typography>
          </Box>
        }
        onClick={counter.onIncrement}
        sx={{
          position: 'relative',
          py: 2,
          borderRadius: 0,
          bgcolor: 'background.neutral',
          color: 'text.primary',
          fontWeight: 500,
          overflow: 'hidden',
          transition: 'transform 0.2s',
          borderLeft: `1px solid ${theme.palette.background.paper}`,
          '&:hover': {
            bgcolor: 'background.paper',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `linear-gradient(to right, ${varAlpha(theme.palette.primary.mainChannel, 0.32)}, ${varAlpha(theme.palette.primary.mainChannel, 0.1)}, transparent)`,
          },
        }}
        disabled={counter.value >= counter.maxValue}
        fullWidth
      >
        Next
      </Button>
    </Box>
  );
}

// src/sections/section-voice/voice-room-card/room-list-card-skeleton.tsx

import { Box, Paper, Skeleton, Stack, alpha, useTheme, type SxProps } from '@mui/material';

type VoiceRoomCardSkeletonProps = {
  sx?: SxProps;
};

export const VoiceRoomCardSkeleton = ({ sx }: VoiceRoomCardSkeletonProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={[
        {
          p: 2,
          borderRadius: 1,
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
          height: 296,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          overflow: 'hidden',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {/* 1. Header & Topic */}
      <Box sx={{ flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} mb={1.1}>
          <Stack direction="row" spacing={0.75}>
            <Skeleton variant="rounded" width={64} height={20} sx={{ borderRadius: 0.5 }} />
            <Skeleton variant="rounded" width={80} height={20} sx={{ borderRadius: 0.5 }} />
          </Stack>
          <Skeleton variant="circular" width={20} height={20} />
        </Stack>
        <Skeleton variant="text" width="65%" height={28} />
      </Box>

      {/* 2. Host Strip */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          p: 1,
          my: 1,
          borderRadius: 1,
          bgcolor: isDark ? alpha('#fff', 0.035) : '#f8fafc',
          border: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.06) : '#e2e8f0',
          flexShrink: 0,
        }}
      >
        <Skeleton variant="circular" width={36} height={36} />
        <Stack sx={{ flex: 1 }}>
          <Skeleton variant="text" width="45%" height={18} />
          <Skeleton variant="text" width="25%" height={14} />
        </Stack>
        <Skeleton variant="rounded" width={40} height={24} sx={{ borderRadius: 1 }} />
      </Box>

      {/* 3. Stage Area */}
      <Box sx={{ flex: 1, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
          {Array.from({ length: 5 }).map((_, i) => (
            <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Skeleton variant="circular" width={46} height={46} />
              <Skeleton variant="rounded" width={32} height={12} sx={{ mt: 0.75, borderRadius: 0.75 }} />
            </Box>
          ))}
        </Stack>
      </Box>

      {/* 4. Join Button */}
      <Skeleton variant="rounded" width="100%" height={36} sx={{ borderRadius: 1, mt: 1, flexShrink: 0 }} />
    </Paper>
  );
};

export default VoiceRoomCardSkeleton;

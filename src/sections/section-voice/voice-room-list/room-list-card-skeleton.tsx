// src/sections/section-voice/voice-room-card/room-list-card-skeleton.tsx
// Same fixed blocks as the real card (52 / 54 / 110 / 36) => swap has zero layout shift.

import { Box, Paper, Skeleton, Stack, alpha, useTheme, type SxProps } from '@mui/material';
import { memo } from 'react';
import {
  BUTTON_HEIGHT,
  CARD_HEIGHT,
  HEADER_HEIGHT,
  HOST_STRIP_HEIGHT,
  STAGE_HEIGHT,
} from './room-list-constants';

type VoiceRoomCardSkeletonProps = {
  sx?: SxProps;
};

const POD_SIZE = 50;

export const VoiceRoomCardSkeleton = memo(({ sx }: VoiceRoomCardSkeletonProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={[
        {
          p: 2,
          borderRadius: 0.5,
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
          height: CARD_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          overflow: 'hidden',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {/* 1. Header & topic */}
      <Box sx={{ flexShrink: 0, height: HEADER_HEIGHT }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} mb={1} sx={{ height: 20 }}>
          <Stack direction="row" spacing={0.75}>
            <Skeleton variant="rounded" width={64} height={20} sx={{ borderRadius: 0.5 }} />
            <Skeleton variant="rounded" width={80} height={20} sx={{ borderRadius: 0.5 }} />
          </Stack>
          <Skeleton variant="rounded" width={44} height={20} sx={{ borderRadius: 0.5 }} />
        </Stack>
        <Skeleton variant="text" width="65%" height={22} />
      </Box>

      {/* 2. Host strip */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: 1,
          height: HOST_STRIP_HEIGHT,
          borderRadius: 0.75,
          boxSizing: 'border-box',
          bgcolor: isDark ? alpha('#fff', 0.035) : '#f8fafc',
          border: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.06) : '#e2e8f0',
          flexShrink: 0,
        }}
      >
        <Skeleton variant="circular" width={36} height={36} />
        <Stack sx={{ flex: 1 }}>
          <Skeleton variant="text" width="45%" height={16} />
          <Skeleton variant="text" width="25%" height={12} />
        </Stack>
        <Skeleton variant="rounded" width={44} height={24} sx={{ borderRadius: 0.5 }} />
      </Box>

      {/* 3. Stage */}
      <Box
        sx={{
          height: STAGE_HEIGHT,
          minHeight: STAGE_HEIGHT,
          maxHeight: STAGE_HEIGHT,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="center">
          {Array.from({ length: 5 }).map((_, i) => (
            <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: POD_SIZE + 8 }}>
              <Skeleton variant="circular" width={POD_SIZE} height={POD_SIZE} />
              <Skeleton variant="rounded" width={32} height={14} sx={{ mt: -0.75, borderRadius: 0.75 }} />
            </Box>
          ))}
        </Stack>
      </Box>

      {/* 4. Join button */}
      <Skeleton variant="rounded" width="100%" height={BUTTON_HEIGHT} sx={{ borderRadius: 0.5, flexShrink: 0 }} />
    </Paper>
  );
});

export default VoiceRoomCardSkeleton;

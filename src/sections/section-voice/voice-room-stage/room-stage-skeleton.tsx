// src/sections/section-voice/voice-room-stage/room-stage-skeleton.tsx

import { Box, Skeleton, Stack } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import React from 'react';

import { useResponsive } from '@/hooks/use-responsive';
import RoomLoadingFallback from '@/sections/section-common/room-loading-fallback';

interface RoomStageSkeletonProps {
  tileCount?: number;
}

export const RoomStageSkeleton: React.FC<RoomStageSkeletonProps> = ({
  tileCount = 6,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useResponsive('down', 'sm');

  const borderColor = isDark ? alpha('#fff', 0.08) : '#e2e8f0';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        width: '100%',
        height: '100%',
        minHeight: { xs: 'calc(100vh - 120px)', md: 600 },
        minWidth: 0,
        bgcolor: isMobile ? 'transparent' : 'background.default',
        borderRadius: isMobile ? 0 : 1,
        border: isMobile ? 'none' : '1px solid',
        borderColor,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── 1. Top CompactRoomHeader Skeleton ── */}
      <Box
        sx={{
          px: { xs: 1.5, sm: 2.5 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor,
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
          <Skeleton variant="rounded" width={34} height={34} sx={{ borderRadius: 1, flexShrink: 0 }} />
          <Box sx={{ minWidth: 0, flex: 1, maxWidth: 280 }}>
            <Skeleton variant="text" width="75%" height={22} />
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
              <Skeleton variant="rounded" width={56} height={16} sx={{ borderRadius: 0.5 }} />
              <Skeleton variant="rounded" width={48} height={16} sx={{ borderRadius: 0.5 }} />
            </Stack>
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: 1 }} />
        </Stack>
      </Box>

      {/* ── 2. Main Stage Speaker Grid Skeleton ── */}
      <RoomLoadingFallback sx={{ bgcolor: 'transparent', border: 'none' }} />

      {/* ── 3. Persistent Bottom RoomControlDock Skeleton ── */}
      <Box
        sx={{
          px: { xs: 1.5, sm: 3 },
          py: 1.5,
          borderTop: '1px solid',
          borderColor,
          bgcolor: isDark ? alpha('#131722', 0.75) : alpha('#ffffff', 0.85),
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 1, sm: 1.5 },
          flexShrink: 0,
        }}
      >
        <Skeleton variant="rounded" width={42} height={42} sx={{ borderRadius: 1.5 }} />
        <Skeleton variant="rounded" width={42} height={42} sx={{ borderRadius: 1.5 }} />
        <Skeleton variant="rounded" width={42} height={42} sx={{ borderRadius: 1.5 }} />
        {!isMobile && (
          <Skeleton variant="rounded" width={42} height={42} sx={{ borderRadius: 1.5 }} />
        )}
        <Skeleton variant="rounded" width={42} height={42} sx={{ borderRadius: 1.5 }} />
        <Skeleton
          variant="rounded"
          width={isMobile ? 48 : 88}
          height={42}
          sx={{
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.error.main, 0.2),
          }}
        />
      </Box>
    </Box>
  );
};

export default RoomStageSkeleton;

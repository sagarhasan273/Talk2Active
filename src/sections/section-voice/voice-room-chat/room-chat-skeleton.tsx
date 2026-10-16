// src/sections/section-voice/voice-room-chat/room-chat-skeleton.tsx

import { Box, Skeleton, Stack } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import React from 'react';

interface RoomChatMessagesSkeletonProps {
  messageCount?: number;
}

/**
 * Skeleton for just the scrollable message feed inside RoomChatPanel
 */
export const RoomChatMessagesSkeleton: React.FC<RoomChatMessagesSkeletonProps> = ({
  messageCount = 5,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Alternating pattern of incoming/outgoing messages with varied bubble widths
  const items = [
    { isSelf: false, width: '72%', height: 44 },
    { isSelf: true, width: '58%', height: 38 },
    { isSelf: false, width: '82%', height: 62 },
    { isSelf: false, width: '48%', height: 38 },
    { isSelf: true, width: '66%', height: 48 },
  ];

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: 'hidden',
        px: 2,
        py: 1.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      {Array.from({ length: messageCount }).map((_, idx) => {
        const item = items[idx % items.length];

        return (
          <Box
            key={idx}
            sx={{
              alignSelf: item.isSelf ? 'flex-end' : 'flex-start',
              width: item.width,
              maxWidth: '85%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: item.isSelf ? 'flex-end' : 'flex-start',
            }}
          >
            {/* Sender Header (Avatar + Name + Time) */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{
                mb: 0.5,
                ml: item.isSelf ? 0 : 0.5,
                mr: item.isSelf ? 0.5 : 0,
              }}
            >
              {!item.isSelf && <Skeleton variant="circular" width={22} height={22} />}
              <Skeleton variant="text" width={item.isSelf ? 28 : 68} height={14} />
              <Skeleton variant="text" width={34} height={12} />
            </Stack>

            {/* Message Bubble */}
            <Skeleton
              variant="rounded"
              width="100%"
              height={item.height}
              sx={{
                borderRadius: 2,
                bgcolor: item.isSelf
                  ? alpha(theme.palette.primary.main, isDark ? 0.22 : 0.14)
                  : isDark
                    ? alpha('#fff', 0.05)
                    : alpha('#000', 0.04),
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
};

interface RoomChatSkeletonProps {
  width?: number | string;
  isFullPanel?: boolean;
}

/**
 * Full Skeleton for RoomChatMain / RoomChatPanel (Header + Feed + Toolbar + Input)
 */
export const RoomChatSkeleton: React.FC<RoomChatSkeletonProps> = ({
  width = 340,
  isFullPanel = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const borderColor = isDark ? alpha('#fff', 0.08) : '#e2e8f0';

  return (
    <Box
      sx={{
        display: isFullPanel ? 'flex' : { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        flexShrink: 0,
        width: isFullPanel ? '100%' : width,
        height: '100%',
        minHeight: 0,
        bgcolor: isDark ? '#181c26' : '#ffffff',
        borderRadius: 1,
        border: isFullPanel ? 'none' : '1px solid',
        borderColor,
        overflow: 'hidden',
      }}
    >
      {/* 1. Header Skeleton */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor,
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Skeleton variant="text" width={70} height={22} />
        <Skeleton variant="rounded" width={26} height={26} sx={{ borderRadius: 1 }} />
      </Box>

      {/* 2. Messages Feed Skeleton */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        <RoomChatMessagesSkeleton />
      </Box>

      {/* 3. Action Toolbar Skeleton (Everyone, Image Upload, Ask AI) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 0.75,
          borderTop: '1px solid',
          borderColor,
          bgcolor: isDark ? alpha('#fff', 0.02) : '#f8fafc',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Skeleton variant="rounded" width={78} height={24} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" width={26} height={24} sx={{ borderRadius: 1 }} />
        </Stack>
        <Skeleton variant="rounded" width={64} height={24} sx={{ borderRadius: 1 }} />
      </Box>

      {/* 4. Input Field & Send Button Skeleton */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1.25,
          borderTop: '1px solid',
          borderColor,
          flexShrink: 0,
        }}
      >
        <Skeleton
          variant="rounded"
          height={38}
          sx={{
            flex: 1,
            borderRadius: 1,
            bgcolor: isDark ? alpha('#fff', 0.035) : '#f8fafc',
          }}
        />
        <Skeleton
          variant="rounded"
          width={38}
          height={38}
          sx={{
            borderRadius: 1,
            flexShrink: 0,
            bgcolor: alpha(theme.palette.primary.main, 0.2),
          }}
        />
      </Box>
    </Box>
  );
};

export default RoomChatSkeleton;

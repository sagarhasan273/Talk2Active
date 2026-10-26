import { useVoiceRoomStorage } from '@/core/contexts';
import { Box } from '@mui/material';
import React, { useMemo } from 'react';
import RoomChatSkeleton from '../voice-room-chat/room-chat-skeleton';
import RoomStageSkeleton from '../voice-room-stage/room-stage-skeleton';

export type RoomContainerSkeletonProps = {};

export const RoomContainerSkeleton = React.memo(function RoomContainerSkeleton(
  _: RoomContainerSkeletonProps
) {
  const { selectedRoom } = useVoiceRoomStorage();
  const tileCount = useMemo(
    () => (selectedRoom?.participants?.length || 0) + 1,
    [selectedRoom?.participants?.length]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 1,
        width: 1,
        height: '100%',
        py: 1,
      }}
    >
      <RoomStageSkeleton tileCount={tileCount} />
      <RoomChatSkeleton />
    </Box>
  );
});

export default RoomContainerSkeleton;

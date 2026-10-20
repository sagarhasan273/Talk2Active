// src/sections/section-voice/voice-room-stage/room-stage-main.tsx

import { useVoiceRoomStorage } from '@/core/contexts';
import { Box } from '@mui/material';
import React from 'react';
import RoomChatSkeleton from '../voice-room-chat/room-chat-skeleton';
import RoomStageSkeleton from '../voice-room-stage/room-stage-skeleton';


export type RoomContainerSkeletonProps = {

};

export const RoomContainerSkeleton: React.FC<RoomContainerSkeletonProps> = ({

}) => {
  const { selectedRoom } = useVoiceRoomStorage();

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
      <RoomStageSkeleton
        tileCount={(selectedRoom?.participants?.length || 0) + 1}
      />
      <RoomChatSkeleton />
    </Box>
  );
};

export default RoomContainerSkeleton;

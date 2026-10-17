// src/sections/section-voice/voice-room-card/room-list-main.tsx

import type { RoomType } from '@/types/type-room';
import { VoiceRoomsFilter, type FilterState } from '../voice-filter-rooms';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, Divider, Typography } from '@mui/material';

import { useCredentials, useRoomTools } from '@/core/slices';

import { useLiveKitSession } from '@/core/contexts/context-livekit';
import { useVoiceRoomAction } from '@/core/contexts/context-voice-room-action';
import VoiceButtonSocialChat from '../voice-button-social-chat';
import { DefaultHeader } from '../voice-room-header/room-header-default';
import { RoomCardCreation } from './room-list-card-creation';
import { VoiceRoomCard } from './room-list-card-main';
import RoomListFooter from './room-list-footer';

const INITIAL_BATCH_SIZE = 24;
const LOAD_MORE_STEP = 24;

const sxCard = {
  height: 296,
  minHeight: 280,
  maxHeight: 296,
  width: '100%',
  maxWidth: { xs: '100%', sm: 1, md: 520 },
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  contentVisibility: 'auto',
  containIntrinsicSize: '0 296px',
};

const NOOP = () => { };

const RoomListHeaderSlot = memo(({ onCreateRoom }: { onCreateRoom: () => void }) => {
  const { isInRoom } = useLiveKitSession();
  if (isInRoom) return null;

  return (
    <Box sx={{ gridColumn: '1 / -1' }}>
      <DefaultHeader onQuickJoin={NOOP} onCreateRoom={onCreateRoom} />
    </Box>
  );
});

interface RoomlistMainProps {
  onSelectRoom: (room: RoomType) => void;
  onCreateRoom: () => void;
}

export const RoomlistMain = memo(function RoomlistMain({
  onSelectRoom,
  onCreateRoom,
}: RoomlistMainProps) {
  // Extract relationship checkers here to prevent child cards from subscribing to Redux
  const { user, checkIfFollowing, checkIfBlocked } = useCredentials();
  const currentUserId = user?.userId;

  const { rooms, getRoomById } = useRoomTools();
  const { handleSelectRoom } = useVoiceRoomAction();

  const onSelectRoomRef = useRef(onSelectRoom);
  onSelectRoomRef.current = onSelectRoom;

  const onCreateRoomRef = useRef(onCreateRoom);
  onCreateRoomRef.current = onCreateRoom;

  const stableOnSelectRoom = useCallback((room: RoomType) => {
    onSelectRoomRef.current(room);
  }, []);

  const stableOnCreateRoom = useCallback(() => {
    onCreateRoomRef.current();
  }, []);

  const handleJoinFromSocialChat = useCallback(
    (roomId: string) => {
      const roomObj = getRoomById(roomId);
      if (roomObj) {
        handleSelectRoom(roomObj);
      }
    },
    [getRoomById, handleSelectRoom]
  );

  const [filterRooms, setFilterRooms] = useState<FilterState>({
    searchQuery: '',
    selectedLanguage: 'all',
    selectedLevel: 'all',
    hideFullRooms: false,
    showActiveOnly: false,
  });

  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(INITIAL_BATCH_SIZE);
  }, [filterRooms]);

  const filteredRooms = useMemo(() => {
    const search = filterRooms.searchQuery.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchesSearch = !search || room.topic.toLowerCase().includes(search);
      const matchesLanguage = filterRooms.selectedLanguage === 'all' || room.languages.includes(filterRooms.selectedLanguage);
      const matchesLevel = filterRooms.selectedLevel === 'all' || room.level === filterRooms.selectedLevel;
      const matchesCapacity = !filterRooms.hideFullRooms || room.participants.length < room.max_participants;
      const matchesActive = !filterRooms.showActiveOnly || room.isActive;

      return matchesSearch && matchesLanguage && matchesLevel && matchesCapacity && matchesActive;
    });
  }, [rooms, filterRooms]);

  const visibleRooms = useMemo(
    () => filteredRooms.slice(0, visibleCount),
    [filteredRooms, visibleCount]
  );

  const hasMoreRooms = visibleCount < filteredRooms.length;

  useEffect(() => {
    const triggerEl = loadMoreTriggerRef.current;
    if (!triggerEl || !hasMoreRooms) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + LOAD_MORE_STEP, filteredRooms.length));
        }
      },
      { rootMargin: '600px 0px' }
    );

    observer.observe(triggerEl);
    return () => observer.disconnect();
  }, [hasMoreRooms, filteredRooms.length]);

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(340px, 1fr))' },
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          position: 'relative',
          gap: 1.5,
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        <RoomListHeaderSlot onCreateRoom={stableOnCreateRoom} />

        <Box sx={{ gridColumn: '1 / -1' }}>
          <VoiceRoomsFilter initialFilters={filterRooms} onFilterChange={setFilterRooms} />
        </Box>

        <RoomCardCreation onCreateRoom={stableOnCreateRoom} sx={sxCard} />

        {visibleRooms.map((room, index) => (
          <VoiceRoomCard
            key={room.roomId}
            index={index}
            roomData={room}
            currentUserId={currentUserId}
            onJoinRoom={stableOnSelectRoom}
            checkIfFollowing={checkIfFollowing}
            checkIfBlocked={checkIfBlocked}
            sx={sxCard}
          />
        ))}

        {hasMoreRooms && (
          <Box ref={loadMoreTriggerRef} sx={{ gridColumn: '1 / -1', py: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Loading more rooms ({visibleRooms.length} of {filteredRooms.length})...
            </Typography>
          </Box>
        )}

        <Box sx={{ gridColumn: '1 / -1', my: 1 }}>
          <Divider sx={{ bgcolor: 'primary.main' }} />
        </Box>

        <Box sx={{ gridColumn: '1 / -1' }}>
          <RoomListFooter onCreateRoom={stableOnCreateRoom} />
        </Box>
      </Box>

      <VoiceButtonSocialChat onJoinRoom={handleJoinFromSocialChat} />
    </>
  );
});

export default RoomlistMain;
// src/sections/section-voice/voice-room-card/room-list-main.tsx

import type { RoomType } from '@/types/type-room';
import { VoiceRoomsFilter, type FilterState } from '../voice-filter-rooms';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, Divider } from '@mui/material';

import { useCredentials, useRoomTools } from '@/core/slices';

import { useLiveKitSession } from '@/core/contexts/context-livekit';
import { useVoiceRoomAction } from '@/core/contexts/context-voice-room-action';
import VoiceRoomScrollButtons from '../voice-button-room-list-scroll';
import VoiceButtonSocialChat from '../voice-button-social-chat';
import { DefaultHeader } from '../voice-room-header/room-header-default';
import { RoomCardCreation } from './room-list-card-creation';
import { VoiceRoomCard } from './room-list-card-main';
import RoomListFooter from './room-list-footer';

// We will render a "window" of 16 cards max (about 3-4 rows depending on screen width)
const WINDOW_SIZE = 16;
const CARD_HEIGHT = 296;
const GRID_GAP = 12; // 1.5 MUI spacing = 12px
const ROW_TOTAL_HEIGHT = CARD_HEIGHT + GRID_GAP; // 308px

const sxCard = {
  height: CARD_HEIGHT,
  minHeight: 280,
  maxHeight: CARD_HEIGHT,
  width: '100%',
  maxWidth: { xs: '100%', sm: 1, md: 520 },
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
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

  // --- SLIDING WINDOW VIRTUALIZATION STATE ---
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: WINDOW_SIZE });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const colsRef = useRef(1);

  // 1. Track how many columns fit on the screen so we can calculate row offsets accurately
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      // Grid logic: minmax(340px, 1fr) with 12px gap
      colsRef.current = Math.max(1, Math.floor((width + GRID_GAP) / (340 + GRID_GAP)));
    });

    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  // 2. Sliding Window Scroll Handler
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const scrollTop = scrollContainerRef.current.scrollTop;

    // The top headers and creation card take up roughly 420px of height.
    // We subtract this so our math starts at the first real grid row.
    const HEADER_OFFSET = 420;
    const gridScrollTop = Math.max(0, scrollTop - HEADER_OFFSET);

    // Calculate which row the user is currently looking at
    const currentGridRow = Math.floor(gridScrollTop / ROW_TOTAL_HEIGHT);

    // Buffer: Render 1 row above the visible area to prevent pop-in
    const startRow = Math.max(0, currentGridRow - 1);

    // Convert row index to item index based on active columns
    const startIdx = startRow * colsRef.current;
    const endIdx = startIdx + WINDOW_SIZE;

    setVisibleRange((prev) => {
      // Performance optimization: Only trigger a React state update 
      // if the window has shifted by an entire row. This prevents scrolling lag.
      if (Math.abs(prev.start - startIdx) >= colsRef.current) {
        return { start: startIdx, end: endIdx };
      }
      return prev;
    });
  }, []);

  const handleScrollToTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleScrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Reset scroll window when filters change
  useEffect(() => {
    setVisibleRange({ start: 0, end: WINDOW_SIZE });
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
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

  return (
    <>
      <Box
        ref={scrollContainerRef}
        onScroll={handleScroll}
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

        {/* Sliding Window Mapping */}
        {filteredRooms.map((room, index) => {
          if (index < visibleRange.start || index >= visibleRange.end) {
            return <Box key={`placeholder-${room.roomId}`} sx={{ height: CARD_HEIGHT, width: '100%', bgcolor: 'background.default' }} />;
          }

          return (
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
          );
        })}

        <Box sx={{ gridColumn: '1 / -1', my: 1 }}>
          <Divider sx={{ bgcolor: 'primary.main' }} />
        </Box>

        <Box sx={{ gridColumn: '1 / -1' }}>
          <RoomListFooter onCreateRoom={stableOnCreateRoom} />
        </Box>
      </Box>

      <VoiceRoomScrollButtons
        onScrollTop={handleScrollToTop}
        onScrollBottom={handleScrollToBottom}
      />

      <VoiceButtonSocialChat onJoinRoom={handleJoinFromSocialChat} />
    </>
  );
});

export default RoomlistMain;
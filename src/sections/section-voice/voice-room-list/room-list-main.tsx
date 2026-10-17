// src/sections/section-voice/voice-room-card/room-list-main.tsx

import type { RoomType } from '@/types/type-room';
import { VoiceRoomsFilter, type FilterState } from '../voice-filter-rooms';

import { Box, Divider, useTheme } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useLiveKitSession } from '@/core/contexts/context-livekit';
import { useVoiceRoomAction } from '@/core/contexts/context-voice-room-action';
import { useCredentials, useRoomTools } from '@/core/slices';

import VoiceRoomScrollButtons from '../voice-button-room-list-scroll';
import VoiceButtonSocialChat from '../voice-button-social-chat';
import { DefaultHeader } from '../voice-room-header/room-header-default';
import { RoomCardCreation } from './room-list-card-creation';
import { VoiceRoomCard } from './room-list-card-main';
import RoomListFooter from './room-list-footer';

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

  return <DefaultHeader onQuickJoin={NOOP} onCreateRoom={onCreateRoom} />;
});

interface RoomlistMainProps {
  onSelectRoom: (room: RoomType) => void;
  onCreateRoom: () => void;
}

export const RoomlistMain = memo(function RoomlistMain({
  onSelectRoom,
  onCreateRoom,
}: RoomlistMainProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);
  const [scrollMargin, setScrollMargin] = useState(0);

  // Measure columns AND the exact offset of the grid below the Header/Filters
  useLayoutEffect(() => {
    const scrollEl = scrollContainerRef.current;
    const gridEl = gridContainerRef.current;
    if (!scrollEl || !gridEl) return;

    const updateMeasurements = () => {
      const width = gridEl.clientWidth;
      const calculatedCols = Math.floor((width + GRID_GAP) / (340 + GRID_GAP));
      setColumns(Math.max(1, calculatedCols));
      setScrollMargin(gridEl.offsetTop);
    };

    updateMeasurements();

    const resizeObserver = new ResizeObserver(updateMeasurements);
    resizeObserver.observe(scrollEl);
    resizeObserver.observe(gridEl);

    return () => resizeObserver.disconnect();
  }, []);

  const filteredRooms = useMemo(() => {
    const search = filterRooms.searchQuery.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchesSearch = !search || room.topic.toLowerCase().includes(search);
      const matchesLanguage =
        filterRooms.selectedLanguage === 'all' ||
        room.languages.includes(filterRooms.selectedLanguage);
      const matchesLevel =
        filterRooms.selectedLevel === 'all' || room.level === filterRooms.selectedLevel;
      const matchesCapacity =
        !filterRooms.hideFullRooms || room.participants.length < room.max_participants;
      const matchesActive = !filterRooms.showActiveOnly || room.isActive;

      return matchesSearch && matchesLanguage && matchesLevel && matchesCapacity && matchesActive;
    });
  }, [rooms, filterRooms]);

  const allCards = useMemo(() => ['creation' as const, ...filteredRooms], [filteredRooms]);
  const rowCount = Math.ceil(allCards.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_TOTAL_HEIGHT,
    scrollMargin,
    overscan: 6, // Renders 6 rows (~1,848px) above and below viewport
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? Math.max(0, virtualRows[0].start - scrollMargin) : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? Math.max(0, totalSize - (virtualRows[virtualRows.length - 1].end - scrollMargin))
      : 0;

  const visibleSliceStart = virtualRows.length > 0 ? virtualRows[0].index * columns : 0;
  const visibleSliceEnd =
    virtualRows.length > 0
      ? Math.min(allCards.length, (virtualRows[virtualRows.length - 1].index + 1) * columns)
      : 0;
  const visibleCards = allCards.slice(visibleSliceStart, visibleSliceEnd);

  // Reset scroll to top when filters change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [filterRooms]);

  // INSTANT JUMP TO TOP
  const handleScrollToTop = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, []);

  // INSTANT JUMP TO BOTTOM
  const handleScrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, []);

  return (
    <>
      <Box
        ref={scrollContainerRef}
        sx={{
          height: '100%',
          overflowY: 'auto',
          position: 'relative',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <RoomListHeaderSlot onCreateRoom={stableOnCreateRoom} />

        <VoiceRoomsFilter initialFilters={filterRooms} onFilterChange={setFilterRooms} />

        {/* Flat Native CSS Grid with Virtual Top/Bottom Padding & GPU Skeletons */}
        <Box
          ref={gridContainerRef}
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: `${GRID_GAP}px`,
            mt: 1.5,
            pt: `${paddingTop}px`,
            pb: `${paddingBottom}px`,
            backgroundClip: 'content-box',
            borderRadius: 1,
          }}
        >
          {visibleCards.map((card, idx) => {
            const actualIndex = visibleSliceStart + idx;

            if (card === 'creation') {
              return (
                <RoomCardCreation
                  key="creation-card"
                  onCreateRoom={stableOnCreateRoom}
                  sx={sxCard}
                />
              );
            }

            return (
              <VoiceRoomCard
                key={card.roomId}
                index={actualIndex - 1}
                roomData={card}
                currentUserId={currentUserId}
                onJoinRoom={stableOnSelectRoom}
                checkIfFollowing={checkIfFollowing}
                checkIfBlocked={checkIfBlocked}
                sx={sxCard}
              />
            );
          })}
        </Box>

        <Divider sx={{ bgcolor: 'primary.main', my: 1 }} />

        <RoomListFooter onCreateRoom={stableOnCreateRoom} />
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

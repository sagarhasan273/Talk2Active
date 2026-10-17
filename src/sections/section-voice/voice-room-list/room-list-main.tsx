// src/sections/section-voice/voice-room-card/room-list-main.tsx

import type { RoomType } from '@/types/type-room';
import { VoiceRoomsFilter, type FilterState } from '../voice-filter-rooms';

import { Box, Divider, useTheme } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  const [columns, setColumns] = useState(1);

  // Dynamically calculate grid columns
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const calculatedCols = Math.floor((width + GRID_GAP) / (340 + GRID_GAP));
      setColumns(Math.max(1, calculatedCols));
    });

    resizeObserver.observe(el);
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

  // Virtualize ONLY the card rows (strictly fixed size = 0 layout thrashing)
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_TOTAL_HEIGHT,
    overscan: 6, // 6 rows (~1850px) buffered above and below for silky mobile scroll-up
  });

  // Reset scroll to top when filters change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [filterRooms]);

  const handleScrollToTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleScrollToBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  const placeholderColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)';

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

        {/* Single Virtual Track Container */}
        <Box
          sx={{
            width: '100%',
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: 'relative',
            mt: 1.5,
            backgroundSize: `100% ${ROW_TOTAL_HEIGHT}px`,
            backgroundRepeat: 'repeat-y',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const startIndex = virtualRow.index * columns;
            const rowCards = allCards.slice(startIndex, startIndex + columns);

            return (
              <Box
                key={virtualRow.key}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${CARD_HEIGHT}px`,
                  transform: `translate3d(0, ${virtualRow.start}px, 0)`,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                  gap: `${GRID_GAP}px`,
                }}
              >
                {rowCards.map((card, idx) =>
                  card === 'creation' ? (
                    <RoomCardCreation
                      key="creation-card"
                      onCreateRoom={stableOnCreateRoom}
                      sx={sxCard}
                    />
                  ) : (
                    <VoiceRoomCard
                      key={card.roomId}
                      index={startIndex + idx - 1}
                      roomData={card}
                      currentUserId={currentUserId}
                      onJoinRoom={stableOnSelectRoom}
                      checkIfFollowing={checkIfFollowing}
                      checkIfBlocked={checkIfBlocked}
                      sx={sxCard}
                    />
                  )
                )}
              </Box>
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

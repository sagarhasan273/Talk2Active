// src/sections/section-voice/voice-room-card/room-list-main.tsx

import type { RoomType } from '@/types/type-room';
import { VoiceRoomsFilter, type FilterState } from '../voice-filter-rooms';

import {
  alpha,
  Box,
  CircularProgress,
  Divider,
  Fade,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useLiveKitSession } from '@/core/contexts/app-context/context-livekit';
import { useCredentials, useRoomTools } from '@/core/slices';

import { LoginPromptDialog } from '@/components/custom-dialog';
import { useVoiceRoomSetting } from '@/core/contexts';
import { useBoolean } from '@/hooks/use-boolean';
import UserDisplayer, { type UserDisplayerProfile } from '@/sections/section-common/user-displayer';

import { SocialView } from '@/sections/section-social-chat';
import VoiceRoomScrollButtons from '../voice-button-room-list-scroll';
import { VoiceModalCreateRoom } from '../voice-modal-create-room';
import { DefaultHeader } from '../voice-room-header/room-header-default';
import { RoomCardCreation } from './room-list-card-creation';
import { RoomParticipantsDialog } from './room-list-card-dialog';
import { VoiceRoomCard } from './room-list-card-main';
import VoiceRoomCardSkeleton from './room-list-card-skeleton';
import RoomListFooter from './room-list-footer';

const CARD_HEIGHT = 296;
const GRID_GAP = 12;
const ROW_TOTAL_HEIGHT = CARD_HEIGHT + GRID_GAP;

const FAST_SCROLL_VELOCITY_THRESHOLD = 2.2;

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

const RoomListHeaderSlot = memo(({ onCreateRoom }: { onCreateRoom?: () => void }) => {
  const { isInRoom } = useLiveKitSession();
  // if (isInRoom) return null;
  return (
    <DefaultHeader
      onQuickJoin={NOOP}
      sx={{
        mt: isInRoom ? 0 : 1,
        mb: 1,
      }}
    />
  );
});

// ── 1. Isolated Fast-Scroll Pill ──
interface FastScrollIndicatorRef {
  trigger: (durationMs?: number) => void;
}

const FastScrollIndicator = memo(
  forwardRef<FastScrollIndicatorRef, { isDark: boolean }>(({ isDark }, ref) => {
    const theme = useTheme();
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        trigger: (durationMs = 180) => {
          setVisible((prev) => (prev ? prev : true));
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            setVisible(false);
          }, durationMs);
        },
      }),
      []
    );

    useEffect(
      () => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      },
      []
    );

    return (
      <Fade in={visible} timeout={{ enter: 80, exit: 180 }} unmountOnExit>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: theme.zIndex.appBar + 5,
            px: 1.75,
            py: 0.6,
            borderRadius: 10,
            bgcolor: isDark ? alpha('#181c26', 0.94) : alpha('#ffffff', 0.96),
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.12) : '#e2e8f0',
            boxShadow: '0 6px 20px rgba(0,0,0,0.22)',
            pointerEvents: 'none',
          }}
        >
          <CircularProgress size={13} thickness={5} color="primary" disableShrink />
          <Typography variant="caption" fontWeight={700} color="text.primary">
            Loading rooms...
          </Typography>
        </Stack>
      </Fade>
    );
  })
);

// ── 2. Isolated Modal Host ──
interface RoomListModalsRef {
  openProfile: (rawUser: any) => void;
  openRoomDialog: (room: RoomType) => void;
}

const RoomListModalsHost = memo(
  forwardRef<
    RoomListModalsRef,
    {
      currentUserId?: string;
      onJoinRoom: (room: RoomType) => void;
    }
  >(({ currentUserId, onJoinRoom }, ref) => {
    const { checkIfFollowing, checkIfBlocked } = useCredentials();

    const [selectedProfile, setSelectedProfile] = useState<UserDisplayerProfile | null>(null);
    const [dialogRoom, setDialogRoom] = useState<RoomType | null>(null);
    const [editRoom, setEditRoom] = useState<RoomType | null>(null);

    const openProfile = useCallback(
      (rawUser: any) => {
        const targetUser = rawUser?.user || rawUser;
        const uid = targetUser?.userId || targetUser?.id;
        setSelectedProfile({
          userId: uid,
          name: targetUser?.name || 'User',
          username: targetUser?.username,
          genUserId: targetUser?.genUserId,
          profilePhoto: targetUser?.profilePhoto,
          verified: targetUser?.verified,
          accountType: targetUser?.accountType,
          bio: targetUser?.bio,
          follower_count: targetUser?.follower_count,
          following_count: targetUser?.following_count,
          friend_count: targetUser?.friend_count,
          isFollowing: uid ? checkIfFollowing(uid) : false,
          isBlocked: uid ? checkIfBlocked(uid) : false,
        });
      },
      [checkIfFollowing, checkIfBlocked]
    );

    useImperativeHandle(
      ref,
      () => ({
        openProfile,
        openRoomDialog: (room: RoomType) => setDialogRoom(room),
      }),
      [openProfile]
    );

    const dialogAllUsers = useMemo(() => {
      if (!dialogRoom) return [];
      const hostId = dialogRoom.host?.userId;
      return (dialogRoom.participants || []).map((p) => ({
        ...p,
        isHost: Boolean(hostId && (p.userId === hostId || (p as any).userId === hostId)),
      }));
    }, [dialogRoom]);

    const dialogIsFull = dialogRoom
      ? dialogAllUsers.length >= (dialogRoom.max_participants || 5)
      : false;
    const dialogIsHost = Boolean(currentUserId && dialogRoom?.host?.userId === currentUserId);

    return (
      <>
        {selectedProfile && (
          <UserDisplayer
            open={Boolean(selectedProfile)}
            user={selectedProfile}
            currentUserId={currentUserId}
            onClose={() => setSelectedProfile(null)}
          />
        )}

        {dialogRoom && (
          <RoomParticipantsDialog
            open={Boolean(dialogRoom)}
            onClose={() => setDialogRoom(null)}
            room={dialogRoom}
            allUsers={dialogAllUsers}
            isFull={dialogIsFull}
            isHost={dialogIsHost}
            onJoinRoom={onJoinRoom}
            onParticipantClick={(p) => {
              setDialogRoom(null);
              openProfile(p);
            }}
            onEditRoom={
              dialogIsHost
                ? (r) => {
                  setDialogRoom(null);
                  setEditRoom(r);
                }
                : undefined
            }
          />
        )}

        {editRoom && (
          <VoiceModalCreateRoom
            open={Boolean(editRoom)}
            onClose={() => setEditRoom(null)}
            currentRoom={editRoom}
          />
        )}
      </>
    );
  })
);

interface RoomlistMainProps {
  onSelectRoom: (room: RoomType) => void;
  isVisible?: boolean;
}

export const RoomlistMain = memo(function RoomlistMain({
  onSelectRoom,
  isVisible,
}: RoomlistMainProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { user, isAuthenticated } = useCredentials();
  const currentUserId = user?.userId;

  const { rooms, isRoomsLoading, getRoomById, visitedRoomIds } = useRoomTools();
  const { handleSelectRoom } = useVoiceRoomSetting();

  const logOpen = useBoolean();

  const modalsRef = useRef<RoomListModalsRef>(null);
  const fastScrollIndicatorRef = useRef<FastScrollIndicatorRef>(null);

  const onSelectRoomRef = useRef(onSelectRoom);
  onSelectRoomRef.current = onSelectRoom;

  const [filterRooms, setFilterRooms] = useState<FilterState>({
    searchQuery: '',
    selectedLanguage: 'all',
    selectedLevel: 'all',
    hideFullRooms: false,
    showActiveOnly: false,
    showVisitedRooms: false,
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [gridMetrics, setGridMetrics] = useState({ columns: 1, cardWidth: 340, scrollMargin: 0 });

  // ── Tab Switch Scroll Restoration State ──
  const savedScrollTopRef = useRef(0);
  const isVisibleRef = useRef(true);

  // ── Fast Scroll Velocity Detector ──
  const lastScrollPosRef = useRef(0);
  const lastScrollTimeRef = useRef(performance.now());

  const stableOnSelectRoom = useCallback(
    (room: RoomType) => {
      if (!isAuthenticated) {
        logOpen.onTrue();
        return;
      }
      onSelectRoomRef.current(room);
    },
    [isAuthenticated]
  );

  const handleAvatarClick = useCallback(
    (rawUser: any) => {
      if (!isAuthenticated) {
        logOpen.onTrue();
        return;
      }
      modalsRef.current?.openProfile(rawUser);
    },
    [isAuthenticated]
  );

  const handleOverflowClick = useCallback(
    (room: RoomType) => {
      if (!isAuthenticated) {
        logOpen.onTrue();
        return;
      }
      modalsRef.current?.openRoomDialog(room);
    },
    [isAuthenticated]
  );

  const handleJoinFromSocialChat = useCallback(
    (roomId: string) => {
      if (!isAuthenticated) {
        return;
      }
      const roomObj = getRoomById(roomId);
      if (roomObj) handleSelectRoom(roomObj);
    },
    [isAuthenticated, getRoomById, handleSelectRoom]
  );

  const handleScrollVelocity = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!isVisibleRef.current) return;

    const currentTop = e.currentTarget.scrollTop;
    savedScrollTopRef.current = currentTop; // Continuously save valid scroll positions

    const now = performance.now();
    const dt = now - lastScrollTimeRef.current;

    if (dt > 12) {
      const dy = Math.abs(currentTop - lastScrollPosRef.current);
      const velocity = dy / dt; // pixels per ms

      if (velocity > FAST_SCROLL_VELOCITY_THRESHOLD || dy > ROW_TOTAL_HEIGHT * 2.5) {
        fastScrollIndicatorRef.current?.trigger(180);
      }

      lastScrollPosRef.current = currentTop;
      lastScrollTimeRef.current = now;
    }
  }, []);

  useLayoutEffect(() => {
    const scrollEl = scrollContainerRef.current;
    const gridEl = gridContainerRef.current;
    if (!scrollEl || !gridEl) return;

    const updateMeasurements = () => {
      const width = gridEl.clientWidth;

      if (width === 0) {
        isVisibleRef.current = false;
        return;
      }

      // If it WAS hidden and just became Visible, restore the scroll position instantly!
      if (!isVisibleRef.current) {
        scrollEl.scrollTop = savedScrollTopRef.current;
        isVisibleRef.current = true;
      }

      const cols = Math.max(1, Math.floor((width + GRID_GAP) / (340 + GRID_GAP)));
      const computedCardWidth = Math.floor((width - GRID_GAP * (cols - 1)) / cols);
      const nextMargin = gridEl.offsetTop;

      setGridMetrics((prev) =>
        prev.columns === cols &&
          Math.abs(prev.cardWidth - computedCardWidth) < 2 &&
          Math.abs(prev.scrollMargin - nextMargin) < 4
          ? prev
          : { columns: cols, cardWidth: computedCardWidth, scrollMargin: nextMargin }
      );
    };

    updateMeasurements();
    const resizeObserver = new ResizeObserver(updateMeasurements);

    resizeObserver.observe(gridEl);
    resizeObserver.observe(scrollEl);

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
      const matchesShowVisitedRooms =
        !filterRooms.showVisitedRooms || visitedRoomIds.includes(room.roomId);
      return (
        matchesSearch &&
        matchesLanguage &&
        matchesLevel &&
        matchesCapacity &&
        matchesActive &&
        matchesShowVisitedRooms
      );
    });
  }, [rooms, visitedRoomIds, filterRooms]);

  const allCards = useMemo(() => ['creation' as const, ...filteredRooms], [filteredRooms]);
  const { columns, cardWidth, scrollMargin } = gridMetrics;
  const rowCount = Math.ceil(allCards.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_TOTAL_HEIGHT,
    scrollMargin,
    overscan: columns === 1 ? 4 : 3,
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

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      savedScrollTopRef.current = 0;
    }
  }, [filterRooms]);

  const handleScrollToTop = useCallback(() => {
    fastScrollIndicatorRef.current?.trigger(240);
    rowVirtualizer.scrollToIndex(0, { align: 'start' });
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      savedScrollTopRef.current = 0;
    }
  }, [rowVirtualizer]);

  const handleScrollToBottom = useCallback(() => {
    if (rowCount > 0) {
      fastScrollIndicatorRef.current?.trigger(240);
      rowVirtualizer.scrollToIndex(rowCount - 1, { align: 'end' });
    }
  }, [rowVirtualizer, rowCount]);

  const skeletonFillColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.04)';
  const spacerSkeletonSx = {
    gridColumn: '1 / -1',
    width: '100%',
    pointerEvents: 'none',
    borderRadius: 0.5,
    backgroundImage: `repeating-linear-gradient(
      to bottom,
      ${skeletonFillColor} 0px,
      ${skeletonFillColor} ${CARD_HEIGHT}px,
      transparent ${CARD_HEIGHT}px,
      transparent ${ROW_TOTAL_HEIGHT}px
    )`,
  };

  return (
    <>
      <FastScrollIndicator ref={fastScrollIndicatorRef} isDark={isDark} />

      <Box
        ref={scrollContainerRef}
        onScroll={handleScrollVelocity}
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
        <RoomListHeaderSlot />
        <VoiceRoomsFilter initialFilters={filterRooms} onFilterChange={setFilterRooms} />

        {isRoomsLoading ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: `${GRID_GAP}px`,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <VoiceRoomCardSkeleton key={`loading-skeleton-${i}`} sx={sxCard} />
            ))}
          </Box>
        ) : (
          <Box
            ref={gridContainerRef}
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: `${GRID_GAP}px`,
            }}
          >
            {paddingTop > 0 && <Box sx={{ ...spacerSkeletonSx, height: `${paddingTop}px` }} />}

            {visibleCards.map((card, idx) => {
              if (card === 'creation') {
                if (!isAuthenticated) {
                  return null;
                }

                return <RoomCardCreation key="creation-card" sx={sxCard} />;
              }

              return (
                <VoiceRoomCard
                  key={card.roomId}
                  index={visibleSliceStart + idx - 1}
                  roomData={card}
                  currentUserId={currentUserId}
                  cardWidth={cardWidth}
                  onJoinRoom={stableOnSelectRoom}
                  onAvatarClick={handleAvatarClick}
                  onOverflowClick={handleOverflowClick}
                  sx={sxCard}
                />
              );
            })}

            {paddingBottom > 0 && (
              <Box sx={{ ...spacerSkeletonSx, height: `${paddingBottom}px` }} />
            )}
          </Box>
        )}

        <Divider sx={{ bgcolor: 'primary.main', my: 1 }} />
        <RoomListFooter onCreateRoom={() => { }} />
      </Box>

      <RoomListModalsHost
        ref={modalsRef}
        currentUserId={currentUserId}
        onJoinRoom={stableOnSelectRoom}
      />

      <VoiceRoomScrollButtons
        onScrollTop={handleScrollToTop}
        onScrollBottom={handleScrollToBottom}
      />

      {isVisible && <SocialView onJoinRoom={handleJoinFromSocialChat} />}

      {isVisible && <LoginPromptDialog openBoolean={logOpen} />}
    </>
  );
});

export default RoomlistMain;

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
  startTransition,
  Suspense,
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

import { useVoiceRoomSetting } from '@/core/contexts';
import { useBoolean } from '@/hooks/use-boolean';
import type { UserDisplayerProfile } from '@/sections/section-common/user-displayer';

import VoiceRoomScrollButtons from '../voice-button-room-list-scroll';
import { DefaultHeader } from '../voice-room-header/room-header-default';
import VoiceRoomCardBorderWrapper from './room-list-card-border-wrapper';
import { RoomCardCreation } from './room-list-card-creation';
import { VoiceRoomCard } from './room-list-card-main';
import VoiceRoomCardSkeleton from './room-list-card-skeleton';
import {
  CARD_HEIGHT,
  CARD_MAX_WIDTH,
  CARD_MIN_COL_WIDTH,
  GRID_GAP,
  ROW_TOTAL_HEIGHT,
} from './room-list-constants';
import {
  DeferredMount,
  LazyLoginPromptDialog,
  LazyRoomListFooter,
  LazyRoomParticipantsDialog,
  LazySocialView,
  LazyUserDisplayer,
  LazyVoiceModalCreateRoom,
  prefetchRoomListChunks,
} from './room-list-lazy';
import {
  hydrationQueue,
  runWhenIdle,
  useEverTrue,
  useIdleReady,
} from './room-list-scheduler';

const FAST_SCROLL_VELOCITY_THRESHOLD = 2.2;
const SCROLL_END_DELAY_MS = 140;

const sxCard = {
  height: CARD_HEIGHT,
  minHeight: 280,
  maxHeight: CARD_HEIGHT,
  width: '100%',
  maxWidth: { xs: '100%', sm: 1, md: CARD_MAX_WIDTH },
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

// Static row style. Dynamic values (translateY / columns) go through `style`, NOT sx,
// otherwise emotion would generate + inject a new CSS class for every scroll offset.
const rowSx = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: CARD_HEIGHT,
  display: 'grid',
  gap: `${GRID_GAP}px`,
  contain: 'layout style',
  willChange: 'transform',
  // Explicit z-index above the ghost ::before (which has z-index 0)
  zIndex: 1,
};

const RoomListHeaderSlot = memo(() => {
  const { isInRoom } = useLiveKitSession();
  return (
    <DefaultHeader
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

// ── 2. Isolated Modal Host (every modal is lazy: code-split + mounted on first use) ──
interface RoomListModalsRef {
  openProfile: (rawUser: any) => void;
  openRoomDialog: (room: RoomType) => void;
  openCreateRoom: () => void;
}

type RoomParticipant = NonNullable<RoomType['participants']>[number];

interface DialogRoomParticipant extends RoomParticipant {
  isHost: boolean;
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
    const [createOpen, setCreateOpen] = useState(false);

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
        openCreateRoom: () => setCreateOpen(true),
      }),
      [openProfile]
    );

    const dialogAllUsers = useMemo(() => {
      if (!dialogRoom) return [];
      const hostId = dialogRoom.host?.userId;
      return (dialogRoom.participants || []).map((p) => ({
        ...p,
        isHost: Boolean(hostId && p.userId === hostId),
      }));
    }, [dialogRoom]);

    const dialogIsFull = dialogRoom
      ? dialogAllUsers.length >= (dialogRoom.max_participants || 5)
      : false;
    const dialogIsHost = Boolean(currentUserId && dialogRoom?.host?.userId === currentUserId);

    return (
      <Suspense fallback={null}>
        {selectedProfile && (
          <LazyUserDisplayer
            open={Boolean(selectedProfile)}
            user={selectedProfile}
            currentUserId={currentUserId}
            onClose={() => setSelectedProfile(null)}
          />
        )}

        {dialogRoom && (
          <LazyRoomParticipantsDialog
            open={Boolean(dialogRoom)}
            onClose={() => setDialogRoom(null)}
            room={dialogRoom}
            allUsers={dialogAllUsers}
            isFull={dialogIsFull}
            isHost={dialogIsHost}
            onJoinRoom={onJoinRoom}
            onParticipantClick={(p: DialogRoomParticipant) => {
              setDialogRoom(null);
              openProfile(p);
            }}
            onEditRoom={
              dialogIsHost
                ? (r: RoomType) => {
                  setDialogRoom(null);
                  setEditRoom(r);
                }
                : undefined
            }
          />
        )}

        {editRoom && (
          <LazyVoiceModalCreateRoom
            open={Boolean(editRoom)}
            onClose={() => setEditRoom(null)}
            currentRoom={editRoom}
          />
        )}

        {createOpen && (
          <LazyVoiceModalCreateRoom open={createOpen} onClose={() => setCreateOpen(false)} />
        )}
      </Suspense>
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
  const loginDialogMounted = useEverTrue(logOpen.value);
  const socialReady = useIdleReady(600);

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

  // Typing in the search box stays instant; the heavy re-filter/re-render is a low-priority transition.
  const handleFilterChange = useCallback((next: FilterState) => {
    startTransition(() => setFilterRooms(next));
  }, []);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // ALWAYS mounted (skeleton and real list live inside it) so it can be measured from the very first render.
  const listRef = useRef<HTMLDivElement>(null);
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

  // Footer "+ Host a Room" used to be a no-op; now opens the create modal.
  const handleCreateRoom = useCallback(() => {
    if (!isAuthenticated) {
      logOpen.onTrue();
      return;
    }
    modalsRef.current?.openCreateRoom();
  }, [isAuthenticated]);

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

  // ── Native passive scroll listener ──
  // 1. remembers scroll position (tab-switch restore)
  // 2. flags the container with [data-scrolling] so CSS pauses every decorative animation
  // 3. detects fast scrolls: shows the pill and pauses card hydration until the list settles
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return undefined;

    let scrolling = false;
    let endTimer: ReturnType<typeof setTimeout> | null = null;
    lastScrollPosRef.current = el.scrollTop;

    const endScroll = () => {
      scrolling = false;
      el.removeAttribute('data-scrolling');
      hydrationQueue.resume();
    };

    const onScroll = () => {
      if (!isVisibleRef.current) return;

      const currentTop = el.scrollTop;
      savedScrollTopRef.current = currentTop;

      if (!scrolling) {
        scrolling = true;
        el.setAttribute('data-scrolling', 'true');
      }
      if (endTimer) clearTimeout(endTimer);
      endTimer = setTimeout(endScroll, SCROLL_END_DELAY_MS);

      const now = performance.now();
      const dt = now - lastScrollTimeRef.current;

      if (dt > 12) {
        const dy = Math.abs(currentTop - lastScrollPosRef.current);
        const velocity = dy / dt; // pixels per ms

        if (velocity > FAST_SCROLL_VELOCITY_THRESHOLD || dy > ROW_TOTAL_HEIGHT * 2.5) {
          fastScrollIndicatorRef.current?.trigger(180);
          hydrationQueue.pause();
        }

        lastScrollPosRef.current = currentTop;
        lastScrollTimeRef.current = now;
      }
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (endTimer) clearTimeout(endTimer);
      hydrationQueue.resume();
    };
  }, []);

  // ── Measurement (columns, card width, scroll margin) ──
  useLayoutEffect(() => {
    const scrollEl = scrollContainerRef.current;
    const listEl = listRef.current;
    if (!scrollEl || !listEl) return undefined;

    const updateMeasurements = () => {
      const width = listEl.clientWidth;

      if (width === 0) {
        isVisibleRef.current = false;
        return;
      }

      // If it WAS hidden and just became visible, restore the scroll position instantly
      if (!isVisibleRef.current) {
        scrollEl.scrollTop = savedScrollTopRef.current;
        isVisibleRef.current = true;
      }

      const cols = Math.max(1, Math.floor((width + GRID_GAP) / (CARD_MIN_COL_WIDTH + GRID_GAP)));
      const colWidth = Math.floor((width - GRID_GAP * (cols - 1)) / cols);
      // cards are capped at CARD_MAX_WIDTH, so the stage layout must be computed for that width
      const computedCardWidth = Math.min(colWidth, CARD_MAX_WIDTH);
      const nextMargin = listEl.offsetTop;

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

    // Observe the container AND each top-level child (header / filter / list): when the header or
    // filter changes height, scrollMargin is re-read instead of going stale (a CLS + blank-row source).
    resizeObserver.observe(scrollEl);
    Array.from(scrollEl.children).forEach((child) => resizeObserver.observe(child));

    return () => resizeObserver.disconnect();
  }, []);

  const filteredRooms = useMemo(() => {
    const search = filterRooms.searchQuery.trim().toLowerCase();
    return rooms.filter((room) => {
      const matchesSearch = !search || (room.topic || '').toLowerCase().includes(search);
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

  // The creation card only exists for signed-in users, so only reserve a slot for it then
  // (previously a blank hole was left in the first row for guests).
  const creationOffset = isAuthenticated ? 1 : 0;
  const allCards = useMemo<Array<'creation' | RoomType>>(
    () => (isAuthenticated ? ['creation', ...filteredRooms] : filteredRooms),
    [isAuthenticated, filteredRooms]
  );

  const { columns, cardWidth, scrollMargin } = gridMetrics;
  const rowCount = Math.ceil(allCards.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_TOTAL_HEIGHT,
    scrollMargin,
    // Bumped from 3/2 → 4/3. Combined with the ghost overlay below, fast scroll
    // never shows blank cells — but a slightly larger buffer still means real cards
    // appear sooner after flinging.
    overscan: columns === 1 ? 4 : 3,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      savedScrollTopRef.current = 0;
    }
  }, [filterRooms]);

  // Warm lazy chunks while the browser is idle so the first tap never waits on the network
  useEffect(() => runWhenIdle(prefetchRoomListChunks, 3000), []);

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

  const gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
  const skeletonCount = Math.max(3, columns * 2);

  // ── Ghost skeleton grid (used behind virtual rows during fast scroll) ──
  //
  // Purpose: when the user flings, the browser's scroll position runs ahead of
  // React's ability to commit new virtual rows → brief blank gaps appear.
  // A `::before` pseudo-element painted on `.rl-list` fills the ENTIRE virtual
  // area with skeleton-shaped rectangles. Rendered rows sit on top (z-index 1).
  // Where a row is missing → the ghost is exposed (looks like a loading skeleton).
  // Where a row exists → ghost is fully covered (invisible).
  //
  // Uses the SAME geometry as the rows (CARD_HEIGHT, ROW_TOTAL_HEIGHT, GRID_GAP,
  // `columns`) so ghost cells align pixel-perfectly with real card positions.
  //
  // Cost: one extra paint of a repeating gradient at initial render. Zero
  // animation, zero layout, zero JS during scroll.
  const ghostFill = isDark ? 'rgba(255, 255, 255, 0.028)' : 'rgba(15, 23, 42, 0.03)';

  // Horizontal row cadence — one solid band per row, transparent gap between rows.
  const ghostRowsGradient = `repeating-linear-gradient(to bottom,
    ${ghostFill} 0px,
    ${ghostFill} ${CARD_HEIGHT}px,
    transparent ${CARD_HEIGHT}px,
    transparent ${ROW_TOTAL_HEIGHT}px)`;

  // Vertical column cadence — mask out gutters so each row shows N separate cells.
  //   stride = (100% + gap) / columns          ← distance from cell N to cell N+1
  //   cell   = stride - gap                     ← solid part of each cell
  const ghostStride = `calc((100% + ${GRID_GAP}px) / ${columns})`;
  const ghostCell = `calc((100% + ${GRID_GAP}px) / ${columns} - ${GRID_GAP}px)`;
  const columnMaskGradient = `repeating-linear-gradient(to right,
    #000 0,
    #000 ${ghostCell},
    transparent ${ghostCell},
    transparent ${ghostStride})`;

  return (
    <>
      <FastScrollIndicator ref={fastScrollIndicatorRef} isDark={isDark} />

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
          // While the user is scrolling, freeze every decorative animation inside the list
          // (border sweeps, host-strip pans, avatar rings, skeleton pulses). They resume ~140ms after scroll stops.
          '&[data-scrolling] .rl-list *, &[data-scrolling] .rl-list *::before, &[data-scrolling] .rl-list *::after':
            { animationPlayState: 'paused !important' },
        }}
      >
        <RoomListHeaderSlot />
        <VoiceRoomsFilter initialFilters={filterRooms} onFilterChange={handleFilterChange} />

        <Box ref={listRef} sx={{ position: 'relative', width: '100%' }}>
          {isRoomsLoading ? (
            <Box className="rl-list" sx={{ display: 'grid', gap: `${GRID_GAP}px` }} style={{ gridTemplateColumns }}>
              {Array.from({ length: skeletonCount }).map((_, i) => (
                <VoiceRoomCardSkeleton key={`loading-skeleton-${i}`} sx={sxCard} />
              ))}
            </Box>
          ) : (
            <Box
              className="rl-list"
              sx={{
                position: 'relative',
                width: '100%',
                // 🔑 Ghost grid: only mounted when there are virtual rows to fill
                // (never for an empty list). Sits behind the rows (z-index 0).
                ...(rowCount > 0 && {
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    pointerEvents: 'none',
                    backgroundImage: ghostRowsGradient,
                    maskImage: columnMaskGradient,
                    WebkitMaskImage: columnMaskGradient,
                  },
                }),
              }}
              style={{ height: totalSize }}
            >
              {virtualRows.map((vRow) => {
                const start = vRow.index * columns;
                const rowCards = allCards.slice(start, start + columns);

                return (
                  <Box
                    key={vRow.index}
                    data-index={vRow.index}
                    sx={rowSx as any}
                    style={{
                      gridTemplateColumns,
                      transform: `translate3d(0, ${vRow.start - scrollMargin}px, 0)`,
                    }}
                  >
                    {rowCards.map((card, i) => {
                      if (card === 'creation') {
                        return <RoomCardCreation key="creation-card" sx={sxCard} />;
                      }

                      const roomIndex = start + i - creationOffset;

                      return (
                        <VoiceRoomCardBorderWrapper key={card.roomId} accountType={card?.host?.accountType}>
                          <VoiceRoomCard
                            roomData={card}
                            currentUserId={currentUserId}
                            cardWidth={cardWidth}
                            priority={roomIndex < 2}
                            onJoinRoom={stableOnSelectRoom}
                            onAvatarClick={handleAvatarClick}
                            onOverflowClick={handleOverflowClick}
                            sx={sxCard}
                          />
                        </VoiceRoomCardBorderWrapper>
                      );
                    })}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        <Divider sx={{ bgcolor: 'primary.main', my: 1 }} />

        {/* Footer: code-split and only mounted when scrolled near; placeholder reserves its space. */}
        <DeferredMount rootRef={scrollContainerRef} sx={{ minHeight: { xs: 640, md: 420 }, mb: 20 }}>
          <LazyRoomListFooter onCreateRoom={handleCreateRoom} />
        </DeferredMount>
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

      {/* Social chat is not needed for first paint: mounted after the list has settled. */}
      {socialReady && (
        <Suspense fallback={null}>
          <LazySocialView
            onJoinRoom={handleJoinFromSocialChat}
            sx={{ display: isVisible ? 'flex' : 'none' }}
          />
        </Suspense>
      )}

      {isVisible && loginDialogMounted && (
        <Suspense fallback={null}>
          <LazyLoginPromptDialog openBoolean={logOpen} />
        </Suspense>
      )}
    </>
  );
});

export default RoomlistMain;

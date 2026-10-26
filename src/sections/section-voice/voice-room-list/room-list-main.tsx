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
import VoiceRoomCardBorderWrapper from './room-list-card-border-wrapper';
import { RoomCardCreation } from './room-list-card-creation';
import { RoomParticipantsDialog } from './room-list-card-dialog';
import { VoiceRoomCard } from './room-list-card-main';
import VoiceRoomCardSkeleton from './room-list-card-skeleton';
import RoomListFooter from './room-list-footer';

const CARD_HEIGHT = 296;
const GRID_GAP = 12;
const ROW_TOTAL_HEIGHT = CARD_HEIGHT + GRID_GAP;

const FAST_SCROLL_VELOCITY_THRESHOLD = 2.2;
const SCROLL_ANIM_RESTORE_DELAY = 120;

const LOADING_ROW_COUNT = 3;
const MIN_GRID_HEIGHT = LOADING_ROW_COUNT * ROW_TOTAL_HEIGHT;

const sxCard = {
  height: CARD_HEIGHT,
  minHeight: CARD_HEIGHT,
  maxHeight: CARD_HEIGHT,
  width: '100%',
  maxWidth: { xs: '100%', sm: 1, md: 520 },
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const RoomListHeaderSlot = memo(function RoomListHeaderSlot() {
  const { isInRoom } = useLiveKitSession();
  return <DefaultHeader sx={{ mt: isInRoom ? 0 : 1, mb: 1 }} />;
});

// ── 1. Fast-Scroll Pill ──
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
          timerRef.current = setTimeout(() => setVisible(false), durationMs);
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

// ── 2. Modal Host ──
interface RoomListModalsRef {
  openProfile: (rawUser: any) => void;
  openRoomDialog: (room: RoomType) => void;
}

const RoomListModalsHost = memo(
  forwardRef<
    RoomListModalsRef,
    { currentUserId?: string; onJoinRoom: (room: RoomType) => void }
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

  const [gridMetrics, setGridMetrics] = useState({
    columns: 1,
    cardWidth: 340,
    scrollMargin: 0,
  });

  const savedScrollTopRef = useRef(0);
  const isVisibleRef = useRef(true);

  const lastScrollPosRef = useRef(0);
  const lastScrollTimeRef = useRef(performance.now());
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (!isAuthenticated) return;
      const roomObj = getRoomById(roomId);
      if (roomObj) handleSelectRoom(roomObj);
    },
    [isAuthenticated, getRoomById, handleSelectRoom]
  );

  useEffect(
    () => () => {
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    },
    []
  );

  const handleScrollVelocity = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!isVisibleRef.current) return;

    const currentTop = e.currentTarget.scrollTop;
    savedScrollTopRef.current = currentTop;

    const now = performance.now();
    const dt = now - lastScrollTimeRef.current;

    if (dt > 12) {
      const dy = Math.abs(currentTop - lastScrollPosRef.current);
      const velocity = dy / dt;

      if (velocity > FAST_SCROLL_VELOCITY_THRESHOLD || dy > ROW_TOTAL_HEIGHT * 2.5) {
        fastScrollIndicatorRef.current?.trigger(180);
      }

      lastScrollPosRef.current = currentTop;
      lastScrollTimeRef.current = now;
    }

    const el = e.currentTarget;
    if (el.style.getPropertyValue('--card-anim-play-state') !== 'paused') {
      el.style.setProperty('--card-anim-play-state', 'paused');
    }
    if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    scrollEndTimerRef.current = setTimeout(() => {
      el.style.setProperty('--card-anim-play-state', 'running');
    }, SCROLL_ANIM_RESTORE_DELAY);
  }, []);

  useLayoutEffect(() => {
    const scrollEl = scrollContainerRef.current;
    const gridEl = gridContainerRef.current;
    if (!scrollEl || !gridEl) return;

    let rafId: number | null = null;
    let lastWidth = 0;

    const measureNow = () => {
      rafId = null;
      const width = gridEl.clientWidth;

      if (width === 0) {
        isVisibleRef.current = false;
        return;
      }
      if (!isVisibleRef.current) {
        scrollEl.scrollTop = savedScrollTopRef.current;
        isVisibleRef.current = true;
      }
      if (Math.abs(width - lastWidth) < 2) return;
      lastWidth = width;

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

    const updateMeasurements = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(measureNow);
    };

    updateMeasurements();
    const ro = new ResizeObserver(updateMeasurements);
    ro.observe(gridEl);

    return () => {
      ro.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [isRoomsLoading]);

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
    // Higher overscan while scrolling → fewer gaps to cover with the ghost
    overscan: columns === 1 ? 6 : 4,
  });

  const isVirtualizerScrolling = rowVirtualizer.isScrolling;
  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

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

  // ── Ghost skeleton overlay values ──
  // Solid color used for the "empty card" ghost rectangles
  const ghostFill = isDark ? 'rgba(255, 255, 255, 0.028)' : 'rgba(15, 23, 42, 0.03)';

  // Horizontal row cadence — one solid bar per row, gap between rows
  const ghostRowsGradient = `repeating-linear-gradient(to bottom,
    ${ghostFill} 0px,
    ${ghostFill} ${CARD_HEIGHT}px,
    transparent ${CARD_HEIGHT}px,
    transparent ${ROW_TOTAL_HEIGHT}px)`;

  // Vertical column cadence — mask out the gutters between columns.
  // calc() with % works inside repeating-linear-gradient on all modern browsers.
  const cellWidth = `calc((100% + ${GRID_GAP}px) / ${columns} - ${GRID_GAP}px)`;
  const stride = `calc((100% + ${GRID_GAP}px) / ${columns})`;
  const columnMaskGradient = `repeating-linear-gradient(to right,
    #000 0,
    #000 ${cellWidth},
    transparent ${cellWidth},
    transparent ${stride})`;

  const gridHeight = Math.max(totalSize - GRID_GAP, MIN_GRID_HEIGHT);

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
          overscrollBehaviorY: 'contain',
        }}
      >
        <RoomListHeaderSlot />
        <VoiceRoomsFilter initialFilters={filterRooms} onFilterChange={setFilterRooms} />

        <Box
          ref={gridContainerRef}
          sx={{
            position: 'relative',
            width: '100%',
            height: gridHeight,
            contain: 'layout style',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 0,
              backgroundImage: ghostRowsGradient,
              maskImage: columnMaskGradient,
              WebkitMaskImage: columnMaskGradient,
            },
          }}
        >
          {isRoomsLoading ? (
            // Real skeletons — they cover the ghost, which is fine
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: `${GRID_GAP}px`,
              }}
            >
              {Array.from({ length: columns * LOADING_ROW_COUNT }).map((_, i) => (
                <VoiceRoomCardSkeleton key={`loading-skeleton-${i}`} sx={sxCard} />
              ))}
            </Box>
          ) : (
            virtualRows.map((vr) => {
              const rowStart = vr.index * columns;
              const rowCards = allCards.slice(rowStart, rowStart + columns);
              const y = vr.start - scrollMargin;

              return (
                <Box
                  key={vr.key}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: CARD_HEIGHT,
                    transform: `translate3d(0, ${y}px, 0)`,
                    willChange: 'transform',
                    zIndex: 1,
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap: `${GRID_GAP}px`,
                    contain: 'layout style',
                  }}
                >
                  {rowCards.map((card, colIdx) => {
                    if (card === 'creation') {
                      if (!isAuthenticated) return null;
                      return <RoomCardCreation key="creation-card" sx={sxCard} />;
                    }

                    return (
                      <VoiceRoomCardBorderWrapper
                        key={card.roomId}
                        accountType={card?.host?.accountType}
                      >
                        <VoiceRoomCard
                          index={rowStart + colIdx}
                          roomData={card}
                          currentUserId={currentUserId}
                          cardWidth={cardWidth}
                          isScrolling={isVirtualizerScrolling}
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
            })
          )}
        </Box>

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

      <SocialView
        onJoinRoom={handleJoinFromSocialChat}
        sx={{ display: isVisible ? 'flex' : 'none' }}
      />

      {isVisible && <LoginPromptDialog openBoolean={logOpen} />}
    </>
  );
});

export default RoomlistMain;

// src/sections/section-voice/voice-room-stage/room-stage-main.tsx

import { useTracks, VideoTrack } from '@livekit/components-react';
import { Avatar, Box, Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Track } from 'livekit-client';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Columns,
  Grid,
  Maximize,
  Minimize,
  Monitor,
  PanelBottom,
  Tv,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useRoomTools } from '@/core/slices';
import { useResponsive } from '@/hooks/use-responsive';
import { CompactRoomHeader } from '../voice-room-header/room-header-compact';
import { RoomStageListener } from '../voice-room-listener-stage';
import { RoomControlDock } from './room-stage-control-dock';
import { EmptySlotTile } from './room-stage-empty-slot-tile';
import RoomStageParticipants from './room-stage-participants';

export type RoomAudioStageProps = {
  onBack?: () => void;
  onSettingsClick?: () => void;
  onShareClick?: () => void;
  topicPrompt?: string;
  onChangePrompt?: () => void;
  handRaised?: boolean;
  raisedHandsSet?: Set<string>;
  participantReactions?: Record<string, string>;
  onToggleRaiseHand?: () => void;
  onToggleScreenShare?: () => void;
  onSendReaction?: (emoji: string) => void;
  onToggleChat?: () => void;
  onLeave?: () => void;
};

type StageLayoutMode = 'sidebar' | 'bottom' | 'cinema';

export const RoomAudioStage: React.FC<RoomAudioStageProps> = ({
  onBack,
  onShareClick,
  topicPrompt = '',
  onChangePrompt,
  handRaised = false,
  raisedHandsSet = new Set(),
  participantReactions = {},
  onToggleRaiseHand,
  onToggleScreenShare,
  onSendReaction,
  onToggleChat,
  onLeave,
  onSettingsClick,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const isMobile = useResponsive('down', 'sm');
  const isTablet = useResponsive('down', 'md');

  const { room, participants } = useRoomTools();

  // Element Refs
  const screenShareContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Multi-Screen & Layout States
  const [selectedTrackSid, setSelectedTrackSid] = useState<string | null>(null);
  const [showAllScreensGrid, setShowAllScreensGrid] = useState(false);
  const [stageLayout, setStageLayout] = useState<StageLayoutMode>('sidebar');
  const [videoFit, setVideoFit] = useState<'contain' | 'cover'>('contain');
  const [isElementFullscreen, setIsElementFullscreen] = useState(false);

  // LiveKit Screen Share Subscriptions (Supports Multiple Simultaneous Presenters)
  const rawScreenShareTracks = useTracks([Track.Source.ScreenShare]);

  const activeScreenShareTracks = useMemo(
    () =>
      rawScreenShareTracks.filter(
        (t) => Boolean(t?.publication && t?.publication?.isSubscribed)
      ),
    [rawScreenShareTracks]
  );

  const hasScreenShare = activeScreenShareTracks.length > 0;
  const maxParticipants = Number(room?.max_participants) || 0;

  const isLocalScreenSharing = useMemo(
    () => rawScreenShareTracks.some((t) => t.participant.isLocal),
    [rawScreenShareTracks]
  );

  // Keep selected screen share valid as presenters start/stop sharing
  useEffect(() => {
    if (!hasScreenShare) {
      setSelectedTrackSid(null);
      setShowAllScreensGrid(false);
      return;
    }

    const stillExists = activeScreenShareTracks.some(
      (t) => t.publication.trackSid === selectedTrackSid
    );

    if (!stillExists) {
      setSelectedTrackSid(activeScreenShareTracks[0]?.publication?.trackSid || null);
    }

    if (activeScreenShareTracks.length <= 1 && showAllScreensGrid) {
      setShowAllScreensGrid(false);
    }
  }, [hasScreenShare, activeScreenShareTracks, selectedTrackSid, showAllScreensGrid]);

  // Default to bottom strip on mobile/tablet when screen sharing starts
  const effectiveLayout: StageLayoutMode =
    isTablet && stageLayout === 'sidebar' ? 'bottom' : stageLayout;

  const focusedScreenShare = useMemo(
    () =>
      activeScreenShareTracks.find((t) => t.publication.trackSid === selectedTrackSid) ||
      activeScreenShareTracks[0],
    [activeScreenShareTracks, selectedTrackSid]
  );

  // Track native fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsElementFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleElementFullscreen = async () => {
    try {
      if (!document.fullscreenElement && screenShareContainerRef.current) {
        await screenShareContainerRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Native fullscreen request blocked:', err);
    }
  };

  const handleScroll = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!scrollContainerRef.current) return;
    const amount = 240;
    if (direction === 'left' || direction === 'right') {
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    } else {
      scrollContainerRef.current.scrollBy({
        top: direction === 'up' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };

  const openSlots = useMemo(
    () => Math.max(0, maxParticipants - (participants?.length || 0)),
    [maxParticipants, participants?.length]
  );

  const hudGlassButtonSx = (active = false) => ({
    minWidth: 0,
    height: 30,
    px: 1.1,
    borderRadius: 1,
    fontSize: 11.5,
    fontWeight: 700,
    textTransform: 'none',
    backdropFilter: 'blur(10px)',
    bgcolor: active ? 'primary.main' : alpha('#181c26', 0.82),
    color: '#ffffff',
    border: '1px solid',
    borderColor: active ? 'primary.light' : alpha('#ffffff', 0.14),
    transition: 'all 0.15s ease',
    '&:hover': {
      bgcolor: active ? 'primary.dark' : alpha('#181c26', 0.95),
      borderColor: active ? 'primary.main' : alpha('#ffffff', 0.28),
    },
  });

  // Subtle custom scrollbar so users can always drag/scroll vertically or horizontally
  const scrollableSx = {
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'thin',
    scrollbarColor: `${isDark ? alpha('#fff', 0.18) : '#cbd5e1'} transparent`,
    '&::-webkit-scrollbar': {
      width: 5,
      height: 5,
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: isDark ? alpha('#fff', 0.18) : '#cbd5e1',
      borderRadius: 4,
    },
  };

  return (
    <>
      <RoomStageListener />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          width: '100%',
          height: '100%',
          minHeight: 0,
          minWidth: 0,
          bgcolor: isMobile ? 'transparent' : isDark ? '#12151e' : '#f8fafc',
          borderRadius: isMobile ? 0 : 1,
          border: isMobile ? 'none' : '1px solid',
          borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Header */}
        {room && (
          <CompactRoomHeader
            room={room}
            onBack={onBack}
            onSettingsClick={onSettingsClick}
            onShareClick={onShareClick}
          />
        )}

        {/* Main Stage Workspace (Flex Row for Sidebar Mode, Column for Bottom/Standard Mode) */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            display: 'flex',
            flexDirection:
              hasScreenShare && effectiveLayout === 'sidebar' ? 'row' : 'column',
            overflow: 'hidden',
          }}
        >
          {/* ── 1. SCREEN SHARE STAGE CANVAS ── */}
          {hasScreenShare && focusedScreenShare && (
            <Box
              ref={screenShareContainerRef}
              sx={{
                flex:
                  effectiveLayout === 'cinema' || effectiveLayout === 'sidebar'
                    ? 1
                    : 'none',
                height:
                  effectiveLayout === 'cinema' || effectiveLayout === 'sidebar'
                    ? '100%'
                    : { xs: '50%', sm: '58%', md: '62%' },
                width: '100%',
                minHeight: 0,
                minWidth: 0,
                position: 'relative',
                bgcolor: '#090b10',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                borderBottom:
                  effectiveLayout === 'bottom'
                    ? `1px solid ${isDark ? alpha('#fff', 0.08) : '#e2e8f0'}`
                    : 'none',
                borderRight:
                  effectiveLayout === 'sidebar'
                    ? `1px solid ${isDark ? alpha('#fff', 0.08) : '#e2e8f0'}`
                    : 'none',
              }}
            >
              {/* TOP-LEFT HUD: Multi-Presenter Stream Switcher Bar */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.75}
                sx={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  right: { xs: 12, sm: 240 },
                  zIndex: 4,
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': { display: 'none' },
                  py: 0.25,
                }}
              >
                {activeScreenShareTracks.map((trackRef, idx) => {
                  const sid = trackRef.publication.trackSid;
                  const presenterName =
                    trackRef.participant.name ||
                    trackRef.participant.identity ||
                    `Screen ${idx + 1}`;
                  const isSelected =
                    !showAllScreensGrid &&
                    focusedScreenShare?.publication?.trackSid === sid;

                  return (
                    <Button
                      key={sid}
                      size="small"
                      onClick={() => {
                        setShowAllScreensGrid(false);
                        setSelectedTrackSid(sid);
                      }}
                      sx={{
                        ...hudGlassButtonSx(isSelected),
                        pl: 0.75,
                        pr: 1.25,
                        gap: 0.75,
                        flexShrink: 0,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 18,
                          height: 18,
                          fontSize: 10,
                          fontWeight: 800,
                          bgcolor: isSelected ? '#ffffff' : 'primary.main',
                          color: isSelected ? 'primary.main' : '#ffffff',
                        }}
                      >
                        {presenterName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography
                        noWrap
                        sx={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          maxWidth: 120,
                          color: 'inherit',
                        }}
                      >
                        {trackRef.participant.isLocal ? 'Your Screen' : presenterName}
                      </Typography>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: isSelected ? '#4ade80' : alpha('#ffffff', 0.45),
                        }}
                      />
                    </Button>
                  );
                })}

                {/* Multi-Stream Split Grid Toggle (Only shows when 2+ users share screens) */}
                {activeScreenShareTracks.length > 1 && (
                  <Tooltip title="Watch all shared screens side-by-side" arrow>
                    <Button
                      size="small"
                      onClick={() => setShowAllScreensGrid((prev) => !prev)}
                      startIcon={<Grid size={13} />}
                      sx={{
                        ...hudGlassButtonSx(showAllScreensGrid),
                        flexShrink: 0,
                      }}
                    >
                      All Screens ({activeScreenShareTracks.length})
                    </Button>
                  </Tooltip>
                )}
              </Stack>

              {/* TOP-RIGHT HUD: Layout & Video Controls */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.75}
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  zIndex: 4,
                }}
              >
                {/* Layout Switcher Group (Desktop) */}
                {!isTablet && (
                  <Stack
                    direction="row"
                    spacing={0.4}
                    sx={{
                      p: 0.35,
                      borderRadius: 1,
                      bgcolor: alpha('#181c26', 0.82),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha('#fff', 0.14)}`,
                    }}
                  >
                    <Tooltip title="Sidebar View (Google Meet style)" arrow>
                      <IconButton
                        size="small"
                        onClick={() => setStageLayout('sidebar')}
                        sx={{
                          p: 0.5,
                          borderRadius: 0.75,
                          color: effectiveLayout === 'sidebar' ? '#fff' : alpha('#fff', 0.6),
                          bgcolor: effectiveLayout === 'sidebar' ? 'primary.main' : 'transparent',
                          '&:hover': {
                            bgcolor:
                              effectiveLayout === 'sidebar'
                                ? 'primary.dark'
                                : alpha('#fff', 0.08),
                          },
                        }}
                      >
                        <Columns size={14} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Bottom Strip View (Discord style)" arrow>
                      <IconButton
                        size="small"
                        onClick={() => setStageLayout('bottom')}
                        sx={{
                          p: 0.5,
                          borderRadius: 0.75,
                          color: effectiveLayout === 'bottom' ? '#fff' : alpha('#fff', 0.6),
                          bgcolor: effectiveLayout === 'bottom' ? 'primary.main' : 'transparent',
                          '&:hover': {
                            bgcolor:
                              effectiveLayout === 'bottom'
                                ? 'primary.dark'
                                : alpha('#fff', 0.08),
                          },
                        }}
                      >
                        <PanelBottom size={14} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Cinema Mode (Hide participants)" arrow>
                      <IconButton
                        size="small"
                        onClick={() => setStageLayout('cinema')}
                        sx={{
                          p: 0.5,
                          borderRadius: 0.75,
                          color: effectiveLayout === 'cinema' ? '#fff' : alpha('#fff', 0.6),
                          bgcolor: effectiveLayout === 'cinema' ? 'primary.main' : 'transparent',
                          '&:hover': {
                            bgcolor:
                              effectiveLayout === 'cinema'
                                ? 'primary.dark'
                                : alpha('#fff', 0.08),
                          },
                        }}
                      >
                        <Tv size={14} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                )}

                {/* Mobile/Tablet Cinema Toggle */}
                {isTablet && (
                  <Button
                    size="small"
                    onClick={() =>
                      setStageLayout((prev) => (prev === 'cinema' ? 'bottom' : 'cinema'))
                    }
                    startIcon={<Tv size={13} />}
                    sx={hudGlassButtonSx(effectiveLayout === 'cinema')}
                  >
                    {effectiveLayout === 'cinema' ? 'Show Speakers' : 'Cinema'}
                  </Button>
                )}

                {/* Distinct Zoom In / Zoom Out Toggle (Uses ZoomIn / ZoomOut icons) */}
                {!showAllScreensGrid && (
                  <Tooltip
                    title={
                      videoFit === 'contain'
                        ? 'Zoom In (Fill screen)'
                        : 'Zoom Out (Fit entire screen)'
                    }
                    arrow
                  >
                    <IconButton
                      size="small"
                      onClick={() =>
                        setVideoFit((prev) => (prev === 'contain' ? 'cover' : 'contain'))
                      }
                      sx={{
                        ...hudGlassButtonSx(videoFit === 'cover'),
                        width: 30,
                        px: 0,
                      }}
                    >
                      {videoFit === 'contain' ? <ZoomIn size={14} /> : <ZoomOut size={14} />}
                    </IconButton>
                  </Tooltip>
                )}

                {/* Native Fullscreen Toggle (Uses Maximize / Minimize icons) */}
                <Tooltip
                  title={isElementFullscreen ? 'Exit Fullscreen' : 'Fullscreen Presentation'}
                  arrow
                >
                  <IconButton
                    size="small"
                    onClick={handleToggleElementFullscreen}
                    sx={{
                      ...hudGlassButtonSx(isElementFullscreen),
                      width: 30,
                      px: 0,
                    }}
                  >
                    {isElementFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                  </IconButton>
                </Tooltip>
              </Stack>

              {/* VIDEO RENDERING AREA: Single Focused Stream OR Multi-Stream Grid */}
              {showAllScreensGrid && activeScreenShareTracks.length > 1 ? (
                <Box
                  sx={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                    minHeight: 0,
                    p: 1.5,
                    pt: 6,
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: activeScreenShareTracks.length >= 2 ? 'repeat(2, 1fr)' : '1fr',
                    },
                    gap: 1.5,
                    overflowY: 'auto',
                    ...scrollableSx,
                  }}
                >
                  {activeScreenShareTracks.map((trackRef) => {
                    const sid = trackRef.publication.trackSid;
                    const pName = trackRef.participant.name || 'Participant';

                    return (
                      <Box
                        key={sid}
                        onClick={() => {
                          setSelectedTrackSid(sid);
                          setShowAllScreensGrid(false);
                        }}
                        sx={{
                          position: 'relative',
                          borderRadius: 1,
                          overflow: 'hidden',
                          bgcolor: '#12151e',
                          border: '1.5px solid',
                          borderColor: alpha('#fff', 0.12),
                          cursor: 'pointer',
                          minHeight: 180,
                          transition: 'all 0.18s ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <VideoTrack
                          trackRef={trackRef}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            left: 8,
                            px: 1,
                            py: 0.35,
                            borderRadius: 1,
                            bgcolor: alpha('#181c26', 0.88),
                            backdropFilter: 'blur(6px)',
                            border: `1px solid ${alpha('#fff', 0.12)}`,
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.6,
                          }}
                        >
                          <Monitor size={12} />
                          {pName} • Click to focus
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box
                  sx={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                    minHeight: 0,
                    position: 'relative',
                  }}
                >
                  <VideoTrack
                    trackRef={focusedScreenShare}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: videoFit,
                    }}
                  />

                  {/* Bottom-Left Active Stream Label */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 12,
                      left: 12,
                      bgcolor: alpha('#181c26', 0.88),
                      backdropFilter: 'blur(8px)',
                      border: `1px solid ${alpha('#fff', 0.12)}`,
                      color: '#fff',
                      px: 1.25,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: 11.5,
                      fontWeight: 700,
                      zIndex: 3,
                      pointerEvents: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.75,
                    }}
                  >
                    <Monitor size={13} color={theme.palette.primary.main} />
                    <span>
                      {focusedScreenShare.participant.name || 'Participant'}&apos;s Screen
                    </span>
                    {activeScreenShareTracks.length > 1 && (
                      <Typography
                        component="span"
                        sx={{
                          ml: 0.5,
                          px: 0.6,
                          py: 0.1,
                          borderRadius: 0.75,
                          bgcolor: alpha(theme.palette.primary.main, 0.25),
                          color: 'primary.light',
                          fontSize: 10,
                          fontWeight: 800,
                        }}
                      >
                        1 of {activeScreenShareTracks.length} live
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* ── 2. PARTICIPANT TILES DOCK (Sidebar / Bottom Filmstrip / Standard Grid) ── */}
          {(!hasScreenShare || effectiveLayout !== 'cinema') && (
            <>
              {hasScreenShare && effectiveLayout === 'sidebar' ? (
                /* MODE A: Right Vertical Scrollable Sidebar Dock (Google Meet Style) */
                <Box
                  sx={{
                    width: { md: 210, lg: 228 },
                    minWidth: { md: 210, lg: 228 },
                    height: '100%',
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: isDark ? '#151922' : '#f1f5f9',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Sidebar Header with Up/Down Scroll Controls */}
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.85,
                      flexShrink: 0,
                      borderBottom: '1px solid',
                      borderColor: isDark ? alpha('#fff', 0.06) : '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        color: isDark ? 'text.secondary' : '#475569',
                      }}
                    >
                      Stage ({participants?.length || 0}/{maxParticipants || '∞'})
                    </Typography>

                    <Stack direction="row" spacing={0.25}>
                      <IconButton
                        size="small"
                        onClick={() => handleScroll('up')}
                        sx={{
                          p: 0.25,
                          borderRadius: 0.75,
                          color: isDark ? 'text.secondary' : '#64748b',
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        <ChevronUp size={14} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleScroll('down')}
                        sx={{
                          p: 0.25,
                          borderRadius: 0.75,
                          color: isDark ? 'text.secondary' : '#64748b',
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        <ChevronDown size={14} />
                      </IconButton>
                    </Stack>
                  </Box>

                  {/* Vertical Scrolling Participant Column */}
                  <Box
                    ref={scrollContainerRef}
                    sx={{
                      flex: 1,
                      minHeight: 0,
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      p: 1.25,
                      display: 'flex',
                      flexDirection: 'column',
                      flexWrap: 'nowrap',
                      gap: 1.25,
                      ...scrollableSx,
                    }}
                  >
                    <RoomStageParticipants
                      participants={participants}
                      raisedHandsSet={raisedHandsSet}
                      participantReactions={participantReactions}
                      sx={{
                        width: '100% !important',
                        minWidth: '100%',
                        minHeight: 136,
                        height: 136,
                        flexShrink: 0,
                      }}
                    />

                    {openSlots > 0 && (
                      <Box sx={{ width: '100%', height: 124, minHeight: 124, flexShrink: 0 }}>
                        <EmptySlotTile openSlots={openSlots} maxParticipants={maxParticipants} />
                      </Box>
                    )}
                  </Box>
                </Box>
              ) : hasScreenShare && effectiveLayout === 'bottom' ? (
                /* MODE B: Bottom Horizontal Scrollable Filmstrip (Discord Style) */
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    minWidth: 0,
                    flex: 1,
                    minHeight: 148,
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: isDark ? '#151922' : '#f1f5f9',
                    overflow: 'hidden',
                  }}
                >
                  <IconButton
                    onClick={() => handleScroll('left')}
                    sx={{
                      display: 'flex',
                      position: 'absolute',
                      left: 6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 5,
                      width: 30,
                      height: 30,
                      borderRadius: 1,
                      bgcolor: isDark ? alpha('#181c26', 0.9) : alpha('#ffffff', 0.92),
                      border: '1px solid',
                      borderColor: isDark ? alpha('#fff', 0.12) : '#e2e8f0',
                      boxShadow: theme.shadows[4],
                      '&:hover': { bgcolor: isDark ? '#222836' : '#ffffff' },
                    }}
                  >
                    <ChevronLeft size={16} />
                  </IconButton>

                  <Box
                    ref={scrollContainerRef}
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'nowrap',
                      alignItems: 'center',
                      gap: 1.5,
                      px: { xs: 2, md: 3 },
                      py: 1.25,
                      width: '100%',
                      minWidth: 0,
                      height: '100%',
                      overflowX: 'auto',
                      overflowY: 'hidden',
                      ...scrollableSx,
                    }}
                  >
                    <RoomStageParticipants
                      participants={participants}
                      raisedHandsSet={raisedHandsSet}
                      participantReactions={participantReactions}
                      sx={{
                        width: { xs: 128, sm: 140 },
                        minWidth: { xs: 128, sm: 140 },
                        height: 132,
                        minHeight: 132,
                        flexShrink: 0,
                      }}
                    />

                    {openSlots > 0 && (
                      <Box
                        sx={{
                          width: { xs: 128, sm: 140 },
                          minWidth: { xs: 128, sm: 140 },
                          height: 132,
                          minHeight: 132,
                          flexShrink: 0,
                        }}
                      >
                        <EmptySlotTile openSlots={openSlots} maxParticipants={maxParticipants} />
                      </Box>
                    )}
                  </Box>

                  <IconButton
                    onClick={() => handleScroll('right')}
                    sx={{
                      display: 'flex',
                      position: 'absolute',
                      right: 6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 5,
                      width: 30,
                      height: 30,
                      borderRadius: 1,
                      bgcolor: isDark ? alpha('#181c26', 0.9) : alpha('#ffffff', 0.92),
                      border: '1px solid',
                      borderColor: isDark ? alpha('#fff', 0.12) : '#e2e8f0',
                      boxShadow: theme.shadows[4],
                      '&:hover': { bgcolor: isDark ? '#222836' : '#ffffff' },
                    }}
                  >
                    <ChevronRight size={16} />
                  </IconButton>
                </Box>
              ) : (
                /* MODE C: Standard Full-Stage Scrollable Speaker Grid (No Screen Share) */
                <Box
                  ref={scrollContainerRef}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                    minWidth: 0,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    p: { xs: 2, sm: 3 },
                    ...scrollableSx,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      alignItems: 'stretch',
                      gap: 2,
                      maxWidth: 1200,
                      width: '100%',
                      m: 'auto',
                    }}
                  >
                    <RoomStageParticipants
                      participants={participants}
                      raisedHandsSet={raisedHandsSet}
                      participantReactions={participantReactions}
                      sx={{
                        flexShrink: 0,
                      }}
                    />

                    {openSlots > 0 && (
                      <Box
                        sx={{
                          width: { xs: 'calc(50% - 8px)', sm: 148, md: 168 },
                          minHeight: 168,
                          flexShrink: 0,
                        }}
                      >
                        <EmptySlotTile openSlots={openSlots} maxParticipants={maxParticipants} />
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Persistent Bottom Controls */}
        <RoomControlDock
          handRaised={handRaised}
          isScreenSharing={isLocalScreenSharing}
          onToggleRaiseHand={onToggleRaiseHand || (() => { })}
          onToggleScreenShare={onToggleScreenShare}
          onSendReaction={onSendReaction}
          onToggleChat={onToggleChat}
          onLeave={onLeave}
        />
      </Box>
    </>
  );
};

export default RoomAudioStage;

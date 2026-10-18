// src/sections/section-voice/voice-room-stage/room-stage-desktop-view.tsx

import { VideoTrack } from '@livekit/components-react';
import { Avatar, Box, Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Columns,
  Eye,
  EyeOff,
  Grid,
  Maximize,
  Minimize,
  Monitor,
  PanelBottom,
  PictureInPicture2,
  Tv,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import React, { useRef, useState } from 'react';

import { getCachedUserInfo } from '@/utils/user-cache';
import RoomStageParticipants from './room-stage-participants';
import {
  getHudGlassButtonSx,
  getScrollableSx,
  type SharedStageViewProps,
  type StageLayoutMode,
} from './room-stage-type';

export const RoomStageDesktopView: React.FC<SharedStageViewProps> = ({
  participants,
  openSlots,
  maxParticipants,
  raisedHandsSet,
  participantReactions,
  hasScreenShare,
  isDisplayingScreenShare,
  showScreenShareView,
  setShowScreenShareView,
  activeScreenShareTracks,
  focusedScreenShare,
  setSelectedTrackSid,
  showAllScreensGrid,
  setShowAllScreensGrid,
  videoFit,
  setVideoFit,
  isElementFullscreen,
  onToggleFullscreen,
  screenShareContainerRef,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const scrollableSx = getScrollableSx(isDark);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [stageLayout, setStageLayout] = useState<StageLayoutMode>('sidebar');

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

  // Toggle Native Picture-in-Picture Floating Window
  const handleTogglePiP = async (containerElement: HTMLElement | null) => {
    try {
      const videoEl = containerElement?.querySelector('video');
      if (!videoEl) return;

      if (document.pictureInPictureElement === videoEl) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoEl.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('Picture-in-Picture error:', err);
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: isDisplayingScreenShare && stageLayout === 'sidebar' ? 'row' : 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── 1. DESKTOP SCREEN SHARE STAGE CANVAS ── */}
      {isDisplayingScreenShare && focusedScreenShare?.publication && (
        <Box
          ref={screenShareContainerRef}
          sx={{
            flex: stageLayout === 'cinema' || stageLayout === 'sidebar' ? 1 : 'none',
            height: stageLayout === 'cinema' || stageLayout === 'sidebar' ? '100%' : '62%',
            width: '100%',
            minHeight: 0,
            minWidth: 0,
            position: 'relative',
            bgcolor: '#090b10',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            borderBottom:
              stageLayout === 'bottom'
                ? `1px solid ${isDark ? alpha('#fff', 0.08) : '#e2e8f0'}`
                : 'none',
            borderRight:
              stageLayout === 'sidebar'
                ? `1px solid ${isDark ? alpha('#fff', 0.08) : '#e2e8f0'}`
                : 'none',
          }}
        >
          {/* Top-Left HUD: Focused Screen Name Banner (Hidden in All Screens Grid) */}
          {!showAllScreensGrid && (
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                zIndex: 4,
                bgcolor: alpha('#181c26', 0.88),
                backdropFilter: 'blur(8px)',
                border: `1px solid ${alpha('#fff', 0.12)}`,
                color: '#fff',
                px: 1.25,
                py: 0.5,
                borderRadius: 1,
                fontSize: 11.5,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                pointerEvents: 'none',
              }}
            >
              <Monitor size={13} color={theme.palette.primary.main} />
              <span>{focusedScreenShare.participant.name || 'Participant'}&apos;s Screen</span>
            </Box>
          )}

          {/* Top HUD for "All Screens": Kept cleanly between Top-Left and Top-Right buttons */}
          {showAllScreensGrid && (
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                left: 140,
                right: 260,
                zIndex: 4,
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'nowrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                overflowX: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                py: 0.25,
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 800, color: '#fff', letterSpacing: 0.5 }}
              >
                ALL ACTIVE SHARES ({activeScreenShareTracks.length})
              </Typography>
            </Box>
          )}

          {/* Bottom HUD: Multi-Presenter Switcher in a Single Scrolling Row */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              right: 12,
              zIndex: 6,
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'nowrap',
              alignItems: 'center',
              gap: 0.75,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              py: 0.25,
            }}
          >
            {activeScreenShareTracks.map((trackRef, idx) => {
              const publication = trackRef.publication;
              if (!publication) return null;

              const sid = publication.trackSid;
              const presenterName =
                trackRef.participant.name || trackRef.participant.identity || `Screen ${idx + 1}`;
              const isSelected =
                !showAllScreensGrid && focusedScreenShare?.publication?.trackSid === sid;
              const userCache = getCachedUserInfo(trackRef.participant.identity);

              return (
                <Button
                  key={sid}
                  size="small"
                  onClick={() => {
                    setShowAllScreensGrid(false);
                    setSelectedTrackSid(sid);
                  }}
                  sx={{
                    ...getHudGlassButtonSx(isSelected),
                    pl: 0.75,
                    pr: 1.25,
                    gap: 0.75,
                    flexShrink: 0,
                  }}
                >
                  <Avatar
                    src={userCache?.avatarUrl}
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
                  <Typography noWrap sx={{ fontSize: 11.5, fontWeight: 700, maxWidth: 120 }}>
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

            {activeScreenShareTracks.length > 1 && (
              <Tooltip title="Watch all shared screens side-by-side" arrow>
                <Button
                  size="small"
                  onClick={() => setShowAllScreensGrid((prev) => !prev)}
                  startIcon={<Grid size={13} />}
                  sx={{ ...getHudGlassButtonSx(showAllScreensGrid), flexShrink: 0 }}
                >
                  All Screens ({activeScreenShareTracks.length})
                </Button>
              </Tooltip>
            )}
          </Box>

          {/* Top-Right HUD: Layout & Video Controls */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            sx={{ position: 'absolute', top: 12, right: 12, zIndex: 7 }}
          >
            <Tooltip title="Hide screen share and view speaker grid" arrow>
              <Button
                size="small"
                onClick={() => setShowScreenShareView(false)}
                startIcon={<EyeOff size={13} />}
                sx={getHudGlassButtonSx(false)}
              >
                Hide Share
              </Button>
            </Tooltip>

            {/* Floating Window / Picture-in-Picture Button */}
            <Tooltip title="Pop out into floating window (PiP)" arrow>
              <IconButton
                size="small"
                onClick={() => handleTogglePiP(screenShareContainerRef.current)}
                sx={{ ...getHudGlassButtonSx(false), width: 30, px: 0 }}
              >
                <PictureInPicture2 size={14} />
              </IconButton>
            </Tooltip>

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
                    color: stageLayout === 'sidebar' ? '#fff' : alpha('#fff', 0.6),
                    bgcolor: stageLayout === 'sidebar' ? 'primary.main' : 'transparent',
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
                    color: stageLayout === 'bottom' ? '#fff' : alpha('#fff', 0.6),
                    bgcolor: stageLayout === 'bottom' ? 'primary.main' : 'transparent',
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
                    color: stageLayout === 'cinema' ? '#fff' : alpha('#fff', 0.6),
                    bgcolor: stageLayout === 'cinema' ? 'primary.main' : 'transparent',
                  }}
                >
                  <Tv size={14} />
                </IconButton>
              </Tooltip>
            </Stack>

            {!showAllScreensGrid && (
              <Tooltip title={videoFit === 'contain' ? 'Zoom In (Fill)' : 'Zoom Out (Fit)'} arrow>
                <IconButton
                  size="small"
                  onClick={() => setVideoFit((prev) => (prev === 'contain' ? 'cover' : 'contain'))}
                  sx={{ ...getHudGlassButtonSx(videoFit === 'cover'), width: 30, px: 0 }}
                >
                  {videoFit === 'contain' ? <ZoomIn size={14} /> : <ZoomOut size={14} />}
                </IconButton>
              </Tooltip>
            )}

            <Tooltip
              title={isElementFullscreen ? 'Exit Fullscreen' : 'Fullscreen Presentation'}
              arrow
            >
              <IconButton
                size="small"
                onClick={onToggleFullscreen}
                sx={{ ...getHudGlassButtonSx(isElementFullscreen), width: 30, px: 0 }}
              >
                {isElementFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Video Rendering Area */}
          {showAllScreensGrid && activeScreenShareTracks.length > 1 ? (
            <Box
              sx={{
                flex: 1,
                width: '100%',
                height: '100%',
                minHeight: 0,
                p: 1.5,
                pt: 6.5,
                pb: 7.5, // Leaves clearance for the bottom presenter switcher HUD
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 1.5,
                overflowY: 'auto',
                ...scrollableSx,
              }}
            >
              {activeScreenShareTracks.map((trackRef) => {
                if (!trackRef.publication) return null;

                const sid = trackRef.publication.trackSid;
                const pName = trackRef.participant.name || 'Participant';
                const isSelected = focusedScreenShare?.publication?.trackSid === sid;

                return (
                  <Box
                    key={sid}
                    onClick={() => {
                      setSelectedTrackSid(sid);
                      setShowAllScreensGrid(false);
                    }}
                    sx={{
                      position: 'relative',
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      bgcolor: '#12151e',
                      border: '2px solid',
                      borderColor: isSelected ? 'primary.main' : alpha('#fff', 0.12),
                      cursor: 'pointer',
                      minHeight: 180,
                      transition: 'all 0.18s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {/* Live Video Thumbnail Preview */}
                    <VideoTrack
                      trackRef={trackRef}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />

                    {/* Pop out PiP Button */}
                    <Tooltip title="Pop out thumbnail" arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          const cardEl = e.currentTarget.closest('.MuiBox-root');
                          handleTogglePiP(cardEl as HTMLElement);
                        }}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 3,
                          ...getHudGlassButtonSx(false),
                          width: 28,
                          height: 28,
                          px: 0,
                        }}
                      >
                        <PictureInPicture2 size={13} />
                      </IconButton>
                    </Tooltip>

                    {/* Presenter Name Tag */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        maxWidth: 'calc(100% - 16px)',
                        zIndex: 3,
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: alpha('#181c26', 0.9),
                        backdropFilter: 'blur(6px)',
                        border: `1px solid ${alpha('#fff', 0.14)}`,
                        color: '#fff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.75,
                      }}
                    >
                      <Monitor size={13} color={theme.palette.primary.main} />
                      <Typography
                        noWrap
                        variant="caption"
                        sx={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          lineHeight: 1.2,
                        }}
                      >
                        {trackRef.participant.isLocal ? 'Your Screen' : pName}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Box
              sx={{ flex: 1, width: '100%', height: '100%', minHeight: 0, position: 'relative' }}
            >
              <VideoTrack
                trackRef={focusedScreenShare}
                style={{ width: '100%', height: '100%', objectFit: videoFit }}
              />
            </Box>
          )}
        </Box>
      )}

      {/* ── 2. DESKTOP PARTICIPANT TILES DOCK ── */}
      {(!isDisplayingScreenShare || stageLayout !== 'cinema') && (
        <>
          {hasScreenShare && !showScreenShareView && (
            <Box
              sx={{
                width: '100%',
                p: 1.25,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Monitor size={16} color={theme.palette.primary.main} />
                <Typography variant="caption" fontWeight={700} color="text.primary">
                  Someone is sharing their screen in this room.
                </Typography>
              </Stack>
              <Button
                size="small"
                variant="contained"
                disableElevation
                onClick={() => setShowScreenShareView(true)}
                startIcon={<Eye size={13} />}
                sx={{ borderRadius: 1, textTransform: 'none', fontSize: 11.5, fontWeight: 700 }}
              >
                View Screen Share
              </Button>
            </Box>
          )}

          {isDisplayingScreenShare && stageLayout === 'sidebar' ? (
            /* MODE A: Right Vertical Scrollable Sidebar */
            <Box
              sx={{
                width: 200,
                minWidth: 200,
                height: '100%',
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: isDark ? '#151922' : '#f1f5f9',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 0.85,
                  borderBottom: `1px solid ${isDark ? alpha('#fff', 0.06) : '#e2e8f0'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 800, fontSize: '0.68rem', textTransform: 'uppercase' }}
                >
                  Stage ({participants?.length || 0}/{maxParticipants || '∞'})
                </Typography>
                <Stack direction="row" spacing={0.25}>
                  <IconButton size="small" onClick={() => handleScroll('up')} sx={{ p: 0.25 }}>
                    <ChevronUp size={14} />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleScroll('down')} sx={{ p: 0.25 }}>
                    <ChevronDown size={14} />
                  </IconButton>
                </Stack>
              </Box>

              <Box
                ref={scrollContainerRef}
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  p: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  ...scrollableSx,
                }}
              >
                <RoomStageParticipants
                  participants={participants}
                  raisedHandsSet={raisedHandsSet}
                  participantReactions={participantReactions}
                  openSlots={openSlots}
                  maxParticipants={maxParticipants}
                  sx={{ width: '100% !important', minHeight: 148, height: 148, flexShrink: 0 }}
                />
              </Box>
            </Box>
          ) : isDisplayingScreenShare && stageLayout === 'bottom' ? (
            /* MODE B: Bottom Horizontal Scrollable Filmstrip */
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                flex: 1,
                minHeight: 164,
                display: 'flex',
                alignItems: 'center',
                bgcolor: isDark ? '#151922' : '#f1f5f9',
                overflow: 'hidden',
              }}
            >
              <IconButton
                onClick={() => handleScroll('left')}
                sx={{
                  position: 'absolute',
                  left: 6,
                  zIndex: 5,
                  width: 30,
                  height: 30,
                  borderRadius: 1,
                  bgcolor: isDark ? alpha('#181c26', 0.9) : alpha('#ffffff', 0.92),
                }}
              >
                <ChevronLeft size={16} />
              </IconButton>

              <Box
                ref={scrollContainerRef}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 3,
                  py: 1,
                  width: '100%',
                  height: '100%',
                  overflowX: 'auto',
                  ...scrollableSx,
                }}
              >
                <RoomStageParticipants
                  participants={participants}
                  raisedHandsSet={raisedHandsSet}
                  participantReactions={participantReactions}
                  openSlots={openSlots}
                  maxParticipants={maxParticipants}
                  sx={{ width: 168, minWidth: 168, flexShrink: 0 }}
                />
              </Box>

              <IconButton
                onClick={() => handleScroll('right')}
                sx={{
                  position: 'absolute',
                  right: 6,
                  zIndex: 5,
                  width: 30,
                  height: 30,
                  borderRadius: 1,
                  bgcolor: isDark ? alpha('#181c26', 0.9) : alpha('#ffffff', 0.92),
                }}
              >
                <ChevronRight size={16} />
              </IconButton>
            </Box>
          ) : (
            <Box
              ref={scrollContainerRef}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                minHeight: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                p: { xs: 2, sm: 3 },
                ...scrollableSx,
              }}
            >
              <RoomStageParticipants
                participants={participants}
                raisedHandsSet={raisedHandsSet}
                participantReactions={participantReactions}
                openSlots={openSlots}
                maxParticipants={maxParticipants}
                sx={{
                  width: '100%',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  alignContent: 'flex-start',
                  gap: 1.5,
                  my: 'auto',
                }}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default RoomStageDesktopView;

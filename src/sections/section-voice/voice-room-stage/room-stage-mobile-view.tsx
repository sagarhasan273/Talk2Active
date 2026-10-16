// src/sections/section-voice/voice-room-stage/room-stage-mobile-view.tsx

import { VideoTrack } from '@livekit/components-react';
import { Avatar, Box, Button, IconButton, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Eye,
  EyeOff,
  Grid,
  Maximize,
  Minimize,
  Monitor,
  PictureInPicture2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import React from 'react';

import { getCachedUserInfo } from '@/utils/user-cache';
import RoomStageParticipants from './room-stage-participants';
import {
  getHudGlassButtonSx,
  getScrollableSx,
  type SharedStageViewProps,
} from './room-stage-type';

export const RoomStageMobileView: React.FC<SharedStageViewProps> = ({
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
      console.warn('PiP error:', err);
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── 1. SCREEN SHARE CANVAS SECTION (Takes full height when viewing share) ── */}
      {isDisplayingScreenShare && showScreenShareView && (
        <Box
          ref={screenShareContainerRef}
          sx={{
            flex: 1,
            width: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#090b10',
            position: 'relative',
          }}
        >
          {/* Top Control Strip: Top-Left status & Top-Right quick actions */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 0.75,
              px: 1,
              py: 0.75,
              bgcolor: '#10131c',
              borderBottom: `1px solid ${alpha('#fff', 0.08)}`,
              flexShrink: 0,
              zIndex: 4,
            }}
          >
            {/* Top-Left: Kept as is */}
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Monitor size={15} color={theme.palette.primary.main} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#fff', letterSpacing: 0.3 }}>
                {showAllScreensGrid
                  ? `ALL SHARES (${activeScreenShareTracks.length})`
                  : 'LIVE SCREEN'}
              </Typography>
            </Stack>

            {/* Top-Right: Video controls */}
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
              <IconButton
                size="small"
                onClick={() => setShowScreenShareView(false)}
                sx={{ ...getHudGlassButtonSx(false, true), width: 28, px: 0 }}
                title="Hide Share & View Speakers"
              >
                <EyeOff size={13} />
              </IconButton>

              <IconButton
                size="small"
                onClick={() => handleTogglePiP(screenShareContainerRef.current)}
                sx={{ ...getHudGlassButtonSx(false, true), width: 28, px: 0 }}
                title="Picture-in-Picture"
              >
                <PictureInPicture2 size={13} />
              </IconButton>

              <IconButton
                size="small"
                onClick={() =>
                  setVideoFit((prev) => (prev === 'contain' ? 'cover' : 'contain'))
                }
                sx={{ ...getHudGlassButtonSx(videoFit === 'cover', true), width: 28, px: 0 }}
                title="Toggle fit"
              >
                {videoFit === 'contain' ? <ZoomIn size={13} /> : <ZoomOut size={13} />}
              </IconButton>

              <IconButton
                size="small"
                onClick={onToggleFullscreen}
                sx={{ ...getHudGlassButtonSx(isElementFullscreen, true), width: 28, px: 0 }}
                title="Fullscreen"
              >
                {isElementFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
              </IconButton>
            </Stack>
          </Box>

          {/* Video Stream Output & HUD Overlays */}
          <Box sx={{ flex: 1, minHeight: 0, position: 'relative', width: '100%', overflow: 'hidden' }}>
            {/* Top-Right Overlay: Shared User Name Badge (hidden in all-screens grid) */}
            {!showAllScreensGrid && focusedScreenShare?.publication && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  bgcolor: alpha('#181c26', 0.88),
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${alpha('#fff', 0.12)}`,
                  color: '#fff',
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 1,
                  zIndex: 4,
                  pointerEvents: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  maxWidth: 'calc(100% - 20px)',
                }}
              >
                <Monitor size={12} color={theme.palette.primary.main} />
                <Typography noWrap sx={{ fontSize: 11, fontWeight: 700, maxWidth: 160 }}>
                  {focusedScreenShare?.participant?.name || 'Participant'}&apos;s Screen
                </Typography>
              </Box>
            )}

            {/* Video Canvas or Multi-grid View */}
            {showAllScreensGrid && activeScreenShareTracks.length > 1 ? (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  p: 1,
                  pb: 7.5, // Clearance for bottom switcher HUD
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: 1,
                  overflowY: 'auto',
                  ...scrollableSx,
                }}
              >
                {activeScreenShareTracks.map((trackRef) => {
                  if (!trackRef.publication) return null;
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
                        border: `1px solid ${alpha('#fff', 0.12)}`,
                        minHeight: 140,
                        cursor: 'pointer',
                      }}
                    >
                      <VideoTrack
                        trackRef={trackRef}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 6,
                          left: 6,
                          maxWidth: 'calc(100% - 12px)',
                          px: 0.8,
                          py: 0.25,
                          borderRadius: 0.75,
                          bgcolor: alpha('#181c26', 0.85),
                          color: '#fff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <Monitor size={11} color={theme.palette.primary.main} />
                        <Typography noWrap sx={{ fontSize: 10, fontWeight: 700 }}>
                          {trackRef.participant.isLocal ? 'You' : pName} · Tap to focus
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              focusedScreenShare?.publication && (
                <VideoTrack
                  trackRef={focusedScreenShare}
                  style={{ width: '100%', height: '100%', objectFit: videoFit }}
                />
              )
            )}

            {/* Bottom HUD: Desktop-Style Multi-Presenter Switcher in a Single Scrolling Row */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 10,
                left: 10,
                right: 10,
                zIndex: 5,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                overflowX: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                py: 0.25,
              }}
            >
              {activeScreenShareTracks.map((trackRef, idx) => {
                const sid = trackRef.publication?.trackSid;
                if (!sid) return null;
                const presenterName =
                  trackRef.participant.name ||
                  trackRef.participant.identity ||
                  `Screen ${idx + 1}`;
                const isSelected =
                  !showAllScreensGrid &&
                  focusedScreenShare?.publication?.trackSid === sid;
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
                      ...getHudGlassButtonSx(isSelected, true),
                      pl: 0.5,
                      pr: 0.85,
                      gap: 0.5,
                      flexShrink: 0,
                    }}
                  >
                    <Avatar
                      src={userCache?.avatarUrl}
                      sx={{
                        width: 16,
                        height: 16,
                        fontSize: 9,
                        fontWeight: 800,
                        bgcolor: isSelected ? '#ffffff' : 'primary.main',
                        color: isSelected ? 'primary.main' : '#ffffff',
                      }}
                    >
                      {presenterName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography noWrap sx={{ fontSize: 10.5, fontWeight: 700, maxWidth: 80 }}>
                      {trackRef.participant.isLocal ? 'You' : presenterName}
                    </Typography>
                  </Button>
                );
              })}

              {activeScreenShareTracks.length > 1 && (
                <Button
                  size="small"
                  onClick={() => setShowAllScreensGrid((prev) => !prev)}
                  startIcon={<Grid size={12} />}
                  sx={{ ...getHudGlassButtonSx(showAllScreensGrid, true), flexShrink: 0 }}
                >
                  All Screens ({activeScreenShareTracks.length})
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      )
      }

      {/* ── 2. SCREEN SHARE NOTIFICATION BANNER (When share is hidden) ── */}
      {
        hasScreenShare && !showScreenShareView && (
          <Box
            sx={{
              width: '100%',
              px: 1.5,
              py: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              flexShrink: 0,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
              <Monitor size={15} color={theme.palette.primary.main} style={{ flexShrink: 0 }} />
              <Typography variant="caption" fontWeight={700} color="text.primary" noWrap>
                Someone is sharing their screen in this room.
              </Typography>
            </Stack>
            <Button
              size="small"
              variant="contained"
              disableElevation
              onClick={() => setShowScreenShareView(true)}
              startIcon={<Eye size={13} />}
              sx={{
                borderRadius: 1,
                textTransform: 'none',
                fontSize: 11.5,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              View Screen Share
            </Button>
          </Box>
        )
      }

      {/* ── 3. MOBILE SPEAKER TILES (Shown only when screen share view is hidden) ── */}
      {
        (!isDisplayingScreenShare || !showScreenShareView) && (
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              overflowY: 'auto',
              p: 1.5,
              ...scrollableSx,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 1.5,
                width: '100%',
              }}
            >
              <RoomStageParticipants
                participants={participants}
                raisedHandsSet={raisedHandsSet}
                participantReactions={participantReactions}
                openSlots={openSlots}
                maxParticipants={maxParticipants}
                sx={{
                  width: 'calc(50% - 6px)',
                  minHeight: 140,
                  flexShrink: 0,
                }}
              />
            </Box>
          </Box>
        )
      }
    </Box >
  );
};

export default RoomStageMobileView;

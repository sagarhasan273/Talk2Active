// src/sections/section-voice-room/voice-room-workspace/room-audio-stage.tsx


import { useTracks, VideoTrack } from '@livekit/components-react';
import { Box, Button, IconButton, Stack, Tooltip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Track } from 'livekit-client';
import { ChevronLeft, ChevronRight, LayoutGrid, Maximize, Minimize, Tv } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { useLiveKitSession } from '@/core/contexts/livekit-context';
import { useRoomTools } from '@/core/slices';
import { CompactRoomHeader } from '../voice-room-header/room-header-compact';
import { RoomControlDock } from './room-control-dock';
import { EmptySlotTile } from './room-empty-slot-tile';
import { ParticipantTile } from './room-participant-tile';
import type { StageParticipant } from './types';

export type RoomAudioStageProps = {
  onBack?: () => void;
  onSettingsClick?: () => void;
  onShareClick?: () => void;
  topicPrompt: string;
  onChangePrompt?: () => void;
  participants: StageParticipant[];
  maxParticipants: number;
  micMuted?: boolean;
  deafened?: boolean;
  handRaised?: boolean;
  onToggleMic?: () => void;
  onToggleDeafen?: () => void;
  onToggleRaiseHand?: () => void;
  onToggleScreenShare?: () => void;
  onSendReaction?: (emoji: string) => void;
  onToggleChat?: () => void;
  onLeave?: () => void;
  onProfileClick?: (participant: StageParticipant) => void;
};

export const RoomAudioStage: React.FC<RoomAudioStageProps> = ({
  onBack,
  onShareClick,
  topicPrompt,
  onChangePrompt,
  participants,
  maxParticipants,
  micMuted = false,
  deafened = false,
  handRaised = false,
  onToggleMic,
  onToggleDeafen,
  onToggleRaiseHand,
  onToggleScreenShare,
  onSendReaction,
  onToggleChat,
  onLeave,
  onProfileClick,
  onSettingsClick,
}) => {
  const theme = useTheme();

  const { isInRoom } = useLiveKitSession();
  const { room } = useRoomTools();

  // Refs
  const screenShareContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // States
  const [presentationOnly, setPresentationOnly] = useState(false);
  const [isElementFullscreen, setIsElementFullscreen] = useState(false);

  // LiveKit Screen Share
  const screenShareTracks = useTracks([Track.Source.ScreenShare]);
  const activeScreenShare = screenShareTracks[0];
  const hasScreenShare = Boolean(activeScreenShare?.publication);

  // Auto-reset presentation-only if screen share ends
  useEffect(() => {
    if (!hasScreenShare) {
      setPresentationOnly(false);
    }
  }, [hasScreenShare]);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsElementFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
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

  // Horizontal Scroll Logic for Desktop
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const openSlots = Math.max(0, maxParticipants - participants.length);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ----------------- Top Header Placement ----------------- */}
      {isInRoom && room && (
        <CompactRoomHeader
          room={room}
          onBack={onBack}
          onSettingsClick={onSettingsClick}
          onShareClick={onShareClick}
        />
      )}

      {/* ----------------- Main Content Canvas ----------------- */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Screen Share Viewer */}
        {hasScreenShare && (
          <Box
            ref={screenShareContainerRef}
            sx={{
              flex: presentationOnly ? 1 : 'none',
              height: presentationOnly ? '100%' : { xs: 260, sm: 380, md: '60%' },
              width: '100%',
              position: 'relative',
              bgcolor: '#050505',
              overflow: 'hidden',
              transition: 'all 0.25s ease',
              borderBottom: !presentationOnly
                ? `1px solid ${alpha(theme.palette.divider, 0.1)}`
                : 'none',
            }}
          >
            <VideoTrack
              trackRef={activeScreenShare}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />

            {/* Presenter Name Badge */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                bgcolor: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                px: 1.25,
                py: 0.5,
                borderRadius: 1.25,
                fontSize: 12,
                fontWeight: 700,
                zIndex: 3,
              }}
            >
              {activeScreenShare.participant.name || 'Participant'}&apos;s Presentation
            </Box>

            {/* Screen Presentation Action Controls (Top Right) */}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 3,
              }}
            >
              <Button
                size="small"
                variant="contained"
                onClick={() => setPresentationOnly((prev) => !prev)}
                startIcon={presentationOnly ? <LayoutGrid size={14} /> : <Tv size={14} />}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(8px)',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 1.5,
                  border: '1px solid rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                }}
              >
                {presentationOnly ? 'Show Grid' : 'Presentation Only'}
              </Button>

              <Tooltip
                title={isElementFullscreen ? 'Exit Fullscreen' : 'Fullscreen Presentation'}
              >
                <IconButton
                  size="small"
                  onClick={handleToggleElementFullscreen}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(8px)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 1.5,
                    p: 0.75,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  }}
                >
                  {isElementFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        )}

        {/* ----------------- Participant Renders ----------------- */}
        {!presentationOnly && (
          <>
            {/* View A: Horizontal Scroll (Active when Screen Sharing) */}
            {hasScreenShare ? (
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  flexShrink: 0,
                  bgcolor: alpha(theme.palette.background.default, 0.4),
                }}
              >
                {/* Desktop Left Scroll Button */}
                <IconButton
                  onClick={() => handleScroll('left')}
                  sx={{
                    display: { xs: 'none', md: 'flex' },
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 5,
                    bgcolor: theme.palette.background.paper,
                    boxShadow: theme.shadows[4],
                    '&:hover': { bgcolor: theme.palette.background.neutral },
                  }}
                >
                  <ChevronLeft size={20} />
                </IconButton>

                {/* Horizontal Scroll Container */}
                <Box
                  ref={scrollContainerRef}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                  }}
                >
                  {participants.map((p) => (
                    <Box key={p.id} sx={{ width: 140, minWidth: 140, height: 140 }}>
                      <ParticipantTile
                        participant={p}
                        onClick={() => onProfileClick?.(p)}
                      />
                    </Box>
                  ))}

                  {openSlots > 0 && (
                    <Box sx={{ width: 140, minWidth: 140, height: 140 }}>
                      <EmptySlotTile openSlots={openSlots} maxParticipants={maxParticipants} />
                    </Box>
                  )}
                </Box>

                {/* Desktop Right Scroll Button */}
                <IconButton
                  onClick={() => handleScroll('right')}
                  sx={{
                    display: { xs: 'none', md: 'flex' },
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 5,
                    bgcolor: theme.palette.background.paper,
                    boxShadow: theme.shadows[4],
                    '&:hover': { bgcolor: theme.palette.background.neutral },
                  }}
                >
                  <ChevronRight size={20} />
                </IconButton>
              </Box>
            ) : (
              /* View B: Centered Grid (Active when NO Screen Share) */
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  p: { xs: 2, sm: 3 },
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
                  {participants.map((p) => (
                    <Box
                      key={p.id}
                      sx={{
                        width: { xs: 'calc(50% - 8px)', sm: 140, md: 160 },
                        minHeight: 160,
                      }}
                    >
                      <ParticipantTile
                        participant={p}
                        onClick={() => onProfileClick?.(p)}
                      />
                    </Box>
                  ))}

                  {openSlots > 0 && (
                    <Box
                      sx={{
                        width: { xs: 'calc(50% - 8px)', sm: 140, md: 160 },
                        minHeight: 160,
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

      {/* ----------------- Bottom Dock ----------------- */}
      <RoomControlDock
        micMuted={micMuted}
        deafened={deafened}
        handRaised={handRaised}
        isScreenSharing={Boolean(screenShareTracks.some((t) => t.participant.isLocal))}
        onToggleMic={onToggleMic || (() => { })}
        onToggleDeafen={onToggleDeafen || (() => { })}
        onToggleRaiseHand={onToggleRaiseHand || (() => { })}
        onToggleScreenShare={onToggleScreenShare}
        onSendReaction={onSendReaction}
        onToggleChat={onToggleChat}
        onLeave={onLeave}
      />
    </Box>

  );
};

export default RoomAudioStage;

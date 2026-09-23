import { ParticipantContext, useTracks, VideoTrack } from '@livekit/components-react';
import { Box, Button, IconButton, Stack, Tooltip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Track } from 'livekit-client';
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Maximize,
  Minimize,
  Tv,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useRoomTools } from '@/core/slices';

import { useRoomStage } from '@/core/contexts/context-room-stage';
import { ParticipantStageType } from '@/types/type-room';
import { CompactRoomHeader } from '../voice-room-header/room-header-compact';
import { RoomControlDock } from './room-stage-control-dock';
import { EmptySlotTile } from './room-stage-empty-slot-tile';
import { ParticipantTile } from './room-stage-participant-tile';


export type RoomAudioStageProps = {
  onBack?: () => void;
  onSettingsClick?: () => void;
  onShareClick?: () => void;
  topicPrompt?: string;
  onChangePrompt?: () => void;

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
  onProfileClick?: (participant: ParticipantStageType) => void;
};

export const RoomAudioStage: React.FC<RoomAudioStageProps> = ({
  onBack,
  onShareClick,
  topicPrompt = '',
  onChangePrompt,
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
  onSettingsClick,
}) => {
  const theme = useTheme();
  const { room } = useRoomTools();

  // 1. Consume Stage Context (Fallback to external prop if passed)
  const { participants } = useRoomStage();

  // Element Refs
  const screenShareContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Layout States
  const [presentationOnly, setPresentationOnly] = useState(false);
  const [isElementFullscreen, setIsElementFullscreen] = useState(false);

  // 2. LiveKit Screen Share Subscription
  const screenShareTracks = useTracks([Track.Source.ScreenShare]);
  const activeScreenShare = screenShareTracks[0];

  const hasScreenShare = Boolean(activeScreenShare?.publication && activeScreenShare?.publication?.isSubscribed);
  const maxParticipants = Number(room?.max_participants);

  const isLocalScreenSharing = useMemo(
    () => screenShareTracks.some((t) => t.participant.isLocal),
    [screenShareTracks]
  );

  // Auto-reset presentation-only mode when screen sharing stops
  useEffect(() => {
    if (!hasScreenShare) {
      setPresentationOnly(false);
    }
  }, [hasScreenShare]);

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

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const openSlots = useMemo(
    () => Math.max(0, maxParticipants - participants.length),
    [maxParticipants, participants.length]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        width: '100%',
        height: '100%',
        minHeight: 0,
        minWidth: 0,
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Header Placement */}
      {room && (
        <CompactRoomHeader
          room={room}
          onBack={onBack}
          onSettingsClick={onSettingsClick}
          onShareClick={onShareClick}
        />
      )}

      {/* Main Stage Canvas */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Screen Share Canvas */}
        {hasScreenShare && activeScreenShare && (
          <Box
            ref={screenShareContainerRef}
            sx={{
              flex: presentationOnly ? 1 : 'none',
              height: presentationOnly ? '100%' : { xs: 240, sm: 340, md: '55%' },
              width: '100%',
              minHeight: 0,
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
                pointerEvents: 'none',
              }}
            >
              {activeScreenShare.participant.name || 'Participant'}&apos;s Presentation
            </Box>

            {/* Presentation Controls */}
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

        {/* Participant Renders */}
        {!presentationOnly && (
          <>
            {hasScreenShare ? (
              /* Strip Row Layout during Presentation */
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: alpha(theme.palette.background.default, 0.4),
                }}
              >
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
                    '&:hover': { bgcolor: theme.palette.background.default },
                  }}
                >
                  <ChevronLeft size={20} />
                </IconButton>

                <Box
                  ref={scrollContainerRef}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    width: '100%',
                    height: '100%',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                  }}
                >
                  {participants.map((p: any) => (
                    <Box key={p.id} sx={{ width: 140, minWidth: 140, height: 140 }}>
                      <ParticipantContext.Provider value={p.rawParticipant}>
                        <ParticipantTile participant={p} />
                      </ParticipantContext.Provider>
                    </Box>
                  ))}

                  {openSlots > 0 && (
                    <Box sx={{ width: 140, minWidth: 140, height: 140 }}>
                      <EmptySlotTile openSlots={openSlots} maxParticipants={maxParticipants} />
                    </Box>
                  )}
                </Box>

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
                    '&:hover': { bgcolor: theme.palette.background.default },
                  }}
                >
                  <ChevronRight size={20} />
                </IconButton>
              </Box>
            ) : (
              /* Standard Stage Grid Layout */
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 0,
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
                  {participants.map((p: any) => (
                    <Box
                      key={p.id}
                      sx={{
                        width: { xs: 'calc(50% - 8px)', sm: 140, md: 160 },
                        minHeight: 160,
                      }}
                    >
                      <ParticipantContext.Provider value={p.rawParticipant}>
                        <ParticipantTile participant={p} />
                      </ParticipantContext.Provider>
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

      {/* Persistent Bottom Controls */}
      <RoomControlDock
        micMuted={micMuted}
        deafened={deafened}
        handRaised={handRaised}
        isScreenSharing={isLocalScreenSharing}
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
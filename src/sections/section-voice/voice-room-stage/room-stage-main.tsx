// src/sections/section-voice/voice-room-stage/room-stage-main.tsx

import { useTracks } from '@livekit/components-react';
import { Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Track } from 'livekit-client';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useRoomTools } from '@/core/slices';
import { useResponsive } from '@/hooks/use-responsive';
import { CompactRoomHeader } from '../voice-room-header/room-header-compact';
import { RoomControlDock } from './room-stage-control-dock';
import { RoomStageDesktopView } from './room-stage-desktop-view';
import { RoomStageMobileView } from './room-stage-mobile-view';

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
};

export const RoomAudioStage: React.FC<RoomAudioStageProps> = ({
  onBack,
  onShareClick,
  handRaised = false,
  raisedHandsSet = new Set(),
  participantReactions = {},
  onToggleRaiseHand,
  onToggleScreenShare,
  onSendReaction,
  onToggleChat,
  onSettingsClick,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const isMobile = useResponsive('down', 'sm');
  const isSmallScreen = useResponsive('down', 'md'); // Routes mobile & small tablets to MobileView

  const { room, participants } = useRoomTools();
  const screenShareContainerRef = useRef<HTMLDivElement | null>(null);

  const [selectedTrackSid, setSelectedTrackSid] = useState<string | null>(null);
  const [showAllScreensGrid, setShowAllScreensGrid] = useState(false);
  const [videoFit, setVideoFit] = useState<'contain' | 'cover'>('contain');
  const [isElementFullscreen, setIsElementFullscreen] = useState(false);
  const [showScreenShareView, setShowScreenShareView] = useState(true);

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

  const focusedScreenShare = useMemo(
    () =>
      activeScreenShareTracks.find((t) => t.publication.trackSid === selectedTrackSid) ||
      activeScreenShareTracks[0],
    [activeScreenShareTracks, selectedTrackSid]
  );

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

  const openSlots = useMemo(
    () => Math.max(0, maxParticipants - (participants?.length || 0)),
    [maxParticipants, participants?.length]
  );

  const sharedViewProps = {
    participants,
    openSlots,
    maxParticipants,
    raisedHandsSet,
    participantReactions,
    hasScreenShare,
    isDisplayingScreenShare: hasScreenShare && showScreenShareView,
    showScreenShareView,
    setShowScreenShareView,
    activeScreenShareTracks,
    focusedScreenShare,
    selectedTrackSid,
    setSelectedTrackSid,
    showAllScreensGrid,
    setShowAllScreensGrid,
    videoFit,
    setVideoFit,
    isElementFullscreen,
    onToggleFullscreen: handleToggleElementFullscreen,
    screenShareContainerRef,
  };

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
        bgcolor: isMobile ? 'transparent' : 'background.default',
        borderRadius: isMobile ? 0 : 1,
        border: isMobile ? 'none' : '1px solid',
        borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {room && (
        <CompactRoomHeader
          room={room}
          onBack={onBack}
          onSettingsClick={onSettingsClick}
          onShareClick={onShareClick}
        />
      )}

      {isSmallScreen ? (
        <RoomStageMobileView {...sharedViewProps} />
      ) : (
        <RoomStageDesktopView {...sharedViewProps} />
      )}

      <RoomControlDock
        handRaised={handRaised}
        isScreenSharing={isLocalScreenSharing}
        onToggleRaiseHand={onToggleRaiseHand || (() => { })}
        onToggleScreenShare={onToggleScreenShare}
        onSendReaction={onSendReaction}
        onToggleChat={onToggleChat}
      />
    </Box>
  );
};

export default RoomAudioStage;

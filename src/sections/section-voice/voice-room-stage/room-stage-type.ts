// src/sections/section-voice/voice-room-stage/room-stage-types.ts

import type { RoomParticipantType } from '@/types/type-room';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-react';
import { alpha } from '@mui/material/styles';

export type StageLayoutMode = 'sidebar' | 'bottom' | 'cinema';

export interface SharedStageViewProps {
  participants: RoomParticipantType[];
  openSlots: number;
  maxParticipants: number;
  raisedHandsSet: Set<string>;
  participantReactions: Record<string, string>;
  hasScreenShare: boolean;
  isDisplayingScreenShare: boolean;
  showScreenShareView: boolean;
  setShowScreenShareView: React.Dispatch<React.SetStateAction<boolean>>;
  activeScreenShareTracks: TrackReferenceOrPlaceholder[];
  focusedScreenShare?: TrackReferenceOrPlaceholder;
  selectedTrackSid: string | null;
  setSelectedTrackSid: React.Dispatch<React.SetStateAction<string | null>>;
  showAllScreensGrid: boolean;
  setShowAllScreensGrid: React.Dispatch<React.SetStateAction<boolean>>;
  videoFit: 'contain' | 'cover';
  setVideoFit: React.Dispatch<React.SetStateAction<'contain' | 'cover'>>;
  isElementFullscreen: boolean;
  onToggleFullscreen: () => void;
  screenShareContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const getHudGlassButtonSx = (active = false, isCompact = false) => ({
  minWidth: 0,
  height: isCompact ? 28 : 30,
  px: isCompact ? 0.85 : 1.1,
  borderRadius: 1,
  fontSize: isCompact ? 11 : 11.5,
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

export const getScrollableSx = (isDark: boolean) => ({
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'thin',
  scrollbarColor: `${isDark ? alpha('#fff', 0.18) : '#cbd5e1'} transparent`,
  '&::-webkit-scrollbar': {
    width: 6,
    height: 6,
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: isDark ? alpha('#fff', 0.18) : '#cbd5e1',
    borderRadius: 4,
  },
});

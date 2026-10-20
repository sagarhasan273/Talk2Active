import type { LocalParticipant, Participant, RemoteParticipant } from 'livekit-client';
import type { LucideIcon } from 'lucide-react';
import type {
  RoomCreateSchema,
  RoomJoinSchema,
  RoomLeaveSchema,
  RoomParticipantSchema,
  RoomSchema,
  RoomUpdateSchema
} from 'src/schemas/schema-chat';
import type { z } from 'zod';


import { TrackReferenceOrPlaceholder } from '@livekit/components-react';
import type { UserType } from './type-user';

export type RoomType = z.infer<typeof RoomSchema>;
export type RoomParticipantType = z.infer<typeof RoomParticipantSchema>;
export type CreateRoomInput = z.infer<typeof RoomCreateSchema>;
export type UpdateRoomInput = z.infer<typeof RoomUpdateSchema>;
export type RoomJoinInput = z.infer<typeof RoomJoinSchema>;
export type RoomLeaveInput = z.infer<typeof RoomLeaveSchema>;

export type SelectedTabType = 'room-list' | 'room-space';

export type ChatUserStatusName =
  | 'online'
  | 'busy'
  | 'brb'
  | 'afk'
  | 'zzz'
  | 'offline';

export type ChatUserStatusColor =
  | 'success.main'
  | 'error.light'
  | 'warning.main'
  | 'yellow.main'
  | 'orange.main'
  | 'stone.main'
  | 'stone.dark';

export type ChatUserStatusBgColor =
  | 'success'
  | 'error'
  | 'warning'
  | 'yellow'
  | 'orange'
  | 'stone'
  | 'grey';

export type ChatUserStatusBgChannel =
  | 'mainChannel'
  | 'lightChannel'
  | 'lighterChannel'
  | 'darkChannel'
  | 'darkerChannel';

export interface ChatUserStatus {
  name: ChatUserStatusName;
  label: string;
  icon: LucideIcon;
  color: ChatUserStatusColor;
  bgColor: ChatUserStatusBgColor;
  bgColorChannel: ChatUserStatusBgChannel;
}
export type JoinRoomUserInput = {
  roomId: string;
  socketId: string;
  userId: string;
  name: string;
  profilePhoto: string;
  isMuted: boolean;
  status: string;
  userType: 'host' | 'guest';
  verified: UserType['verified'];
  accountType: UserType['accountType'];
};

export type LeaveRoomUserInput = {
  roomId: string;
  userId: string;
  kicked?: boolean;
};

export interface ParticipantMetadataType {
  name?: string;
  username?: string;
  verified?: boolean;
  profilePhoto?: string;
  genUserId?: string;
  accountType?: 'user' | 'creator' | 'admin' | 'guest' | string;
  isHost?: boolean;
  status?: 'online' | 'busy' | 'brb' | 'afk' | 'zzz' | 'offline' | string;
  [key: string]: unknown;
}

export type ParticipantRoomRole = 'host' | 'co-host' | 'speaker' | 'listener';

export type ParticipantAudioState = 'speaking' | 'unmuted' | 'muted' | 'listening';

export type ParticipantStageType = Omit<
  RoomParticipantType,
  'name' | 'username' | 'joinedAt'
> & {
  id: string;
  name: string;
  username: string;
  joinedAt: string;
  status?: string;
  role: ParticipantRoomRole;
  handRaised: boolean;
  activeReactionEmoji: string | null;
  rawParticipant?: Participant | RemoteParticipant | LocalParticipant;
  isGhost?: boolean;
};

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


export interface ChatReaction {
  emoji: string;
  count: number;
  reactedBySelf?: boolean;
  userIds?: string[];
}

export interface ChatMessage {
  id: string;
  authorId: string;
  authorName: string;
  avatarUrl?: string;
  text: string;
  imageUrl?: string;
  timestamp: string;
  editedAt?: string;
  replyToId?: string;
  isSelf?: boolean;
  privateTo?: { id: string; name: string };
  reactions?: ChatReaction[];
  isSystem?: boolean;
  systemType?: 'info' | 'success' | 'warning' | 'error';
}

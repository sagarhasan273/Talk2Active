import { UserType } from "@/types/type-user";

export type AudioState = 'speaking' | 'unmuted' | 'muted' | 'listening';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'failed' | null;

export type ParticipantStageType = {
  id: string;

  userId?: string;
  name?: string;
  username?: string;
  profilePhoto?: string;
  accountType?: UserType['accountType'];
  verified?: string;
  isHost?: boolean;

  level?: string;
  audioState: AudioState;
  isSelf?: boolean;
  handRaised?: boolean;
  isSpeaking?: boolean;
  isDeafened?: boolean;
  volume?: number;
  activeReactionEmoji?: string | null;
  connectionStatus?: ConnectionStatus
};

export type MessageReaction = {
  emoji: string;
  count: number;
  reactedBySelf: boolean;
};

export type ChatMessage = {
  id: string;
  authorId: string;
  authorName: string;
  avatarUrl?: string;
  imageUrl?: string;
  text: string;
  timestamp?: string;
  isSelf?: boolean;
  editedAt?: string;
  replyToId?: string;
  reactions?: MessageReaction[];
  privateTo?: { id: string; name: string } | null;
  isSystem?: boolean; // Added system message flag
  systemType?: 'info' | 'warning' | 'success' | 'error'; // Added system message type
};

export type RoomAudioStageProps = {
  topicPrompt: string;
  onChangePrompt?: () => void;
  participants: ParticipantStageType[];
  maxParticipants: number;
  onInviteSlot?: () => void;
  onLeave?: () => void;
  onOpenReactions?: () => void;
  onToggleChat?: () => void;
  /** Called with the *next* muted state after the mic button is pressed. */
  onToggleMic?: (muted: boolean) => void;
  /** Called with the *next* deafened state after the button is pressed. */
  onToggleDeafen?: (deafened: boolean) => void;
  /** Called with the *next* raised state after the button is pressed. */
  onToggleRaiseHand?: (raised: boolean) => void;
  onProfileClick?: (participant: ParticipantStageType) => void;
};

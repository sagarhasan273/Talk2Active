export type AudioState = 'speaking' | 'unmuted' | 'muted' | 'listening';

export type ParticipantStageType = {
  id: string;
  level?: string;
  audioState: AudioState;
  isSelf?: boolean;
  handRaised?: boolean;
  isSpeaking?: boolean;
  role?: 'host' | 'speaker' | 'moderator' | 'listener';
  isDeafened?: boolean;
  volume?: number;
  activeReactionEmoji?: string | null;
  connectionStatus?: 'connecting' | 'connected' | 'disconnected' | 'failed' | null;
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
  /** URL of the uploaded image attachment, if any. */
  imageUrl?: string;
  text: string;
  timestamp?: string;
  isSelf?: boolean;
  /** Set when the message has been edited after sending. */
  editedAt?: string;
  /** id of the message this one is replying to, if any. */
  replyToId?: string;
  reactions?: MessageReaction[];
  /**
   * When set, this is a private (whisper) message meant only for the sender
   * and this one recipient — even inside a group chat. Consumers should
   * only render a private message if the viewer is the sender or the
   * recipient (see filterVisibleMessages in messages-data.ts).
   */
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

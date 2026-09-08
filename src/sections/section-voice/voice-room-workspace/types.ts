export type AudioState = 'speaking' | 'unmuted' | 'muted' | 'listening';

export type StageParticipant = {
  id: string;
  name: string;
  avatarUrl: string;
  /** Shown as the small subtitle line, e.g. "Fluent (C1)", "Learner (B1)". */
  level?: string;
  audioState: AudioState;
  isHost?: boolean;
  isSelf?: boolean;
  handRaised?: boolean;
};

export type ChatMessage = {
  id: string;
  authorName: string;
  avatarUrl?: string;
  text: string;
  timestamp?: string;
  isSelf?: boolean;
};

export type RoomAudioStageProps = {
  topicPrompt: string;
  onChangePrompt?: () => void;
  participants: StageParticipant[];
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
  onProfileClick?: (participant: StageParticipant) => void;
};

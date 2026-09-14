
export type SelectedTabType = 'find' | 'enter';

export interface VoiceParticipant {
  id?: string;
  userId?: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  profilePhoto?: string;
  isSpeaking?: boolean;
  audioState?: 'speaking' | 'unmuted' | 'muted' | 'listening';
  isMuted?: boolean;
  role?: string;
  level?: string;
  handRaised?: boolean;
  user?: {
    userId?: string;
    id?: string;
    name?: string;
    profilePhoto?: string;
    verified?: boolean;
    accountType?: string;
  };
}

export type ChatReaction = {
  emoji: string;
  count: number;
  reactedBySelf?: boolean;
};

export type ChatMessage = {
  id: string;
  authorId: string;
  authorName: string;
  avatarUrl?: string;
  imageUrl?: string;
  text: string;
  timestamp?: string;
  createdAt?: string;
  editedAt?: string;
  replyToId?: string;
  isSelf?: boolean;
  privateTo?: {
    id: string;
    name: string;
  };
  reactions?: ChatReaction[];
  isSystem?: boolean;
  systemType?: 'info' | 'success' | 'warning' | 'error';
};

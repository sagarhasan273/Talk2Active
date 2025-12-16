import type { LucideIcon } from 'lucide-react';
import type { UserType } from 'src/types/type-user';

// Updated participant type
export type Participant = UserType & {
  socketId: string;
  status: UserType['status'];
  isMuted: boolean;
  isSpeaking: boolean;
  userType?: string;
};

export interface CreateRoomData {
  name: string;
  language: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  tags: string[];
  maxParticipants: number;
  roomType: 'conversation' | 'pronunciation' | 'grammar';
}

export interface SocketUser {
  userId: string;
  socketId: string;
  userName: string;
}

export interface WebRTCOffer {
  target: string;
  offer: RTCSessionDescriptionInit;
}

export interface WebRTCAnswer {
  target: string;
  answer: RTCSessionDescriptionInit;
}

export interface IceCandidate {
  target: string;
  candidate: RTCIceCandidateInit;
}

export interface ChatUserStatus {
  name: UserType['status'];
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

// Types
export type AudioQuality = 'low' | 'medium' | 'high';

export type ChatUserCardAudioSettings = {
  noiseSuppression: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
  volume: number;
  audioQuality: AudioQuality;
};

export type ChatRoomMessage = {
  id?: number;
  text: string;
  sender: 'me' | 'them';
  time: string;
  name: string;
  avatar?: string;
  userId: string;
  isUnread: boolean;
  isPrivate: boolean;
  senderSocketId?: string;
  targetSocketId?: string;
  mentions: {
    userId: string;
    name: string;
  }[];
};

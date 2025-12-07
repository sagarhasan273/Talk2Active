import type { LucideIcon } from 'lucide-react';
import type { UserType } from 'src/types/type-user';

export interface LearningLanguage {
  language: string;
  level: string;
}

export interface Room {
  _id: string;
  name: string;
  language: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  tags: string[];
  host: UserType;
  currentParticipants: Participant[];
  maxParticipants: number;
  isActive: boolean;
  roomType: 'conversation' | 'pronunciation' | 'grammar';
  createdAt: string;
  updatedAt: string;
}

// Updated participant type
export type Participant = UserType & {
  socketId: string;
  status: UserType['status'];
  isMuted: boolean;
  isSpeaking: boolean;
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

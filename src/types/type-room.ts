import type { UserType } from './type-user';

export interface Language {
  code: string;
  name: string;
  flag: string;
  nativeSpeakers: number;
}

export interface Reaction {
  emoji: string;
  userId: string;
  userName?: string;
  timestamp: Date;
}

export type Message = {
  id?: number;
  text: string;
  sender: 'me' | 'them';
  time: string;
  isUnread: boolean;
  startOfUnread?: boolean;
  isPrivate: boolean;
  senderSocketId?: string;
  targetSocketId?: string;
  type: 'system' | 'message';
  systemMessageType?: 'user-joined' | 'you-joined' | 'user-left';
  userInfo: {
    userId: string;
    name: string;
    avatar?: string;
  };
  targetUserInfo?: {
    socketId: string;
    userId: string;
    name: string;
    avatar?: string;
  };
  mentions: {
    userId: string;
    name: string;
    avatar?: string;
  }[];
  isEdited?: boolean;
  reactions?: Reaction[];
};

// Updated participant type
export type Participant = UserType & {
  socketId: string;
  status: UserType['status'];
  isMuted: boolean;
  isSpeaking: boolean;
  userType?: string;
};

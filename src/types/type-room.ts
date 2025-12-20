import type { UserType } from './type-user';

export interface Language {
  code: string;
  name: string;
  flag: string;
  nativeSpeakers: number;
}

export type Message = {
  id?: number;
  text: string;
  sender: 'me' | 'them';
  time: string;
  isUnread: boolean;
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
  mentions: {
    userId: string;
    name: string;
    avatar?: string;
  }[];
};

// Updated participant type
export type Participant = UserType & {
  socketId: string;
  status: UserType['status'];
  isMuted: boolean;
  isSpeaking: boolean;
  userType?: string;
};

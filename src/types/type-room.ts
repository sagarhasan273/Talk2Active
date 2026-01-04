import type { UserType } from './type-user';

export interface Language {
  code: string;
  name: string;
  flag: string;
  nativeSpeakers: number;
}

export type Reaction = {
  emoji: string;
  userId: string;
  name?: string;
  timestamp?: Date;
};

export type Message = {
  id?: string;
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
  isDeleted?: boolean;
  reactions?: Reaction[];
  messageRepliedOf?: MessageOnReply;
};

export type MessageOnReply = {
  id: Message['id'];
  text: Message['text'];
  name: Message['userInfo']['name'];
};

export type ReactionMessageData = {
  roomId: string;
  messageId: Message['id'];
  reaction: Reaction;
};

// Updated participant type
export type Participant = UserType & {
  socketId: string;
  status: UserType['status'];
  isMuted: boolean;
  isSpeaking: boolean;
  userType?: string;
};

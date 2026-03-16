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
};

export type Message = {
  id?: string;
  conversationId?: string;
  text: string;
  sender: 'me' | 'them';
  time: Date | string;
  isUnread: boolean;
  startOfUnread?: boolean;
  isPrivate?: boolean;
  senderSocketId?: string;
  receiverSocketId?: string;
  type: 'system' | 'message';
  systemMessageType?: 'user-joined' | 'you-joined' | 'user-left' | 'user-kicked' | 'mic-force-mute';
  senderInfo?: Partial<UserType>;
  receiverInfo?: Partial<UserType>;
  mentions?: {
    userId: string;
    name: string;
    avatar?: string;
  }[];
  isEdited?: boolean;
  isDeleted?: boolean;
  reactions?: Reaction[];
  messageRepliedOf?: Partial<Message>;
  parentMessage?: string | Partial<Message>; // For threading
};

export type MessageOnReply = {
  id: Message['id'];
  text: Message['text'];
  name: UserType['name'];
  targetSocketId?: Message['receiverSocketId'];
};

export type ReactionMessageData = {
  userId: string;
  senderId?: string;
  receiverId?: string;
  roomId: string;
  messageId: Message['id'];
  reaction: Reaction;
};

// Updated participant type
export type Participant = {
  socketId: string;
  isLocal: boolean;
  userId: UserType['id'];
  name: UserType['name'];
  profilePhoto: UserType['profilePhoto'];
  accountType: UserType['accountType'];
  status: UserType['status'];
  isSpeaking: boolean;
  isMuted: boolean;
  volume?: number;
  userType?: string;
  verified?: UserType['verified'];
  hasJoin?: boolean;
};

export type PrivateParticipantProps = {
  socketId: string;
  userId: UserType['id'];
  name: UserType['name'];
  profilePhoto?: UserType['profilePhoto'];
};

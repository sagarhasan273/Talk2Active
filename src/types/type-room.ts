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
  systemMessageType?: 'user-joined' | 'you-joined' | 'user-left';
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
export type Participant = UserType & {
  socketId: string;
  status: UserType['status'];
  isMuted?: boolean;
  isSpeaking?: boolean;
  userType?: string;
  stream: MediaStream | null;
  isLocal: boolean;
};

export type PrivateParticipantProps = {
  socketId: string;
  userId: UserType['userId'];
  name: UserType['name'];
  profilePhoto?: UserType['profilePhoto'];
};

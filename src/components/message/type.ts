import type { SxProps } from '@mui/material';
import type { Message, Participant, MessageOnReply } from 'src/types/type-room';

export type MessageAvatarsProps = {
  message: Message;
};

export type MessageContainerProps = {
  messages: Message[];
  onReaction: (message: Message, emoji: string) => void;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  isEditing?: boolean;
};

export type MessageReplyInfoProps = {
  replyMessage: MessageOnReply;
  cancelReplyMessage?: () => void;
  sx?: SxProps;
};

export type MessageTextProps = {
  message: Message;
  onReaction?: (message: Message, emoji: string) => void;
};
export type MessageMentionProps = {
  message: Message;
};

export type MessageInputProps = {
  participants: Participant[];
  onSendMessage: (
    isPrivate: boolean,
    targetUserInfo?: Message['targetUserInfo'],
    mentions?: Message['mentions']
  ) => void;
  isEditing?: boolean;
  placeholder?: string;
  replyMessage?: MessageOnReply;
  cancelReplyMessage?: () => void;
  cancelEditMessage?: () => void;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  isPrivateMessage: boolean;
  setIsPrivateMessage: React.Dispatch<React.SetStateAction<boolean>>;
};

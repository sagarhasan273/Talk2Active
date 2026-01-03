import type { SxProps } from '@mui/material';
import type { Message, Participant, MessageOnReply } from 'src/types/type-room';

export type MessageAvatarsProps = {
  message: Message;
};

export type MessageContainerProps = {
  messages: Message[];
  onReaction: (message: Message, emoji: string) => void;
  onReply: (message: MessageOnReply) => void;
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
    isPrivateMessage: boolean,
    targetUserInfo?: Message['targetUserInfo'],
    mentions?: Message['mentions']
  ) => void;
  placeholder?: string;
  replyMessage?: MessageOnReply;
  cancelReplyMessage?: () => void;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
};

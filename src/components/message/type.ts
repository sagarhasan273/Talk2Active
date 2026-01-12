import type { SxProps } from '@mui/material';
import type { Message, Participant, PrivateParticipantProps } from 'src/types/type-room';

export type MessageAvatarsProps = {
  message: Message;
};

export type MessageContainerProps = {
  messages: Message[];
  onReaction: (message: Message, emoji: string) => void;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
  isEditing?: boolean;
};

export type MessageReplyInfoProps = {
  replyMessage: Partial<Message>;
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
  inputFor?: 'individual' | 'group';
  participants?: Participant[];
  onSendMessage: (
    isPrivate: boolean,
    targetUserInfo?: Message['targetUserInfo'],
    mentions?: Message['mentions']
  ) => void;
  isEditing?: boolean;
  placeholder?: string;
  replyMessage?: Partial<Message>;
  cancelReplyMessage?: () => void;
  cancelEditMessage?: () => void;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  isPrivateMessage: boolean;
  setIsPrivateMessage: React.Dispatch<React.SetStateAction<boolean>>;
  privateRecipient?: PrivateParticipantProps | null;
  setPrivateRecipient?: React.Dispatch<React.SetStateAction<PrivateParticipantProps | null>>;
};

import type { Message } from 'src/types/type-room';

export type MessageAvatarsProps = {
  message: Message;
  targetUser: {
    name: string;
    profilePhoto: string;
  };
};

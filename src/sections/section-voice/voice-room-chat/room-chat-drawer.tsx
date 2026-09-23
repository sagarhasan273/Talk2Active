import { Drawer } from '@mui/material';

import { ChatMessage, RoomParticipantType } from '@/types/type-room';
import { RoomChatPanel } from './room-chat-panel';

type ChatDrawerProps = {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  currentUserId: string;
  participants?: RoomParticipantType[];
  onSendMessage?: (
    text: string,
    replyToId?: string,
    privateTo?: { id: string; name: string }
  ) => void;
  onEditMessage?: (id: string, text: string) => void;
  onReactMessage?: (id: string, emoji: string) => void;
};

export const RoomChatDrawer = ({
  open,
  onClose,
  messages,
  currentUserId,
  participants = [],
  onSendMessage,
  onEditMessage,
  onReactMessage,
}: ChatDrawerProps) => (
  <Drawer
    anchor="bottom"
    open={open}
    onClose={onClose}
    ModalProps={{ keepMounted: true }}
    PaperProps={{
      sx: {
        height: '75vh',
        maxHeight: 750,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottom: 'none',
      },
    }}
  >
    <RoomChatPanel
      messages={messages}
      currentUserId={currentUserId}
      participants={participants}
      onSendMessage={onSendMessage}
      onEditMessage={onEditMessage}
      onReactMessage={onReactMessage}
      onClose={onClose}
    />
  </Drawer>
);

export default RoomChatDrawer;

// src/sections/section-voice/voice-room-chat/room-chat-drawer.tsx
import { Drawer } from '@mui/material';

import { RoomParticipantType } from '@/types/type-room';

import { useRoomChat } from '@/core/contexts/context-room-chat';
import { RoomChatPanel } from './room-chat-panel';

type ChatDrawerProps = {
  open?: boolean;
  onClose?: () => void;
  currentUserId?: string;
  participants?: RoomParticipantType[];
  onSendMessage?: (
    text: string,
    replyToId?: string,
    privateTo?: { id: string; name: string },
    imageUrl?: string
  ) => void;
  onEditMessage?: (id: string, text: string) => void;
  onReactMessage?: (id: string, emoji: string) => void;
};

export const RoomChatDrawer = ({
  open,
  onClose,
  currentUserId,
  onSendMessage,
  onEditMessage,
  onReactMessage,
}: ChatDrawerProps) => {
  const chatContext = useRoomChat();

  const isOpen = open ?? chatContext.chatOpen;
  const handleClose = onClose ?? (() => chatContext.setChatOpen(false));

  return (
    <Drawer
      anchor="bottom"
      open={isOpen}
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', md: 'none' },
      }}
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
        currentUserId={currentUserId ?? chatContext.currentUserId}
        onSendMessage={onSendMessage ?? chatContext.handleSendMessage}
        onEditMessage={onEditMessage ?? chatContext.handleEditMessage}
        onReactMessage={onReactMessage ?? chatContext.handleReactMessage}
        onClose={handleClose}
      />
    </Drawer>
  );
};

export default RoomChatDrawer;

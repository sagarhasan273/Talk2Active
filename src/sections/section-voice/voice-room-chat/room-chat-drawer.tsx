// src/sections/section-voice/voice-room-chat/room-chat-drawer.tsx

import { Drawer } from '@mui/material';

import { RoomParticipantType } from '@/types/type-room';


import { useVoiceRoomSetting, useVoiceRoomStorage } from '@/core/contexts';
import { useCredentials } from '@/core/slices';
import { RoomChatPanel } from './room-chat-panel';

type ChatDrawerProps = {
  open?: boolean;
  onClose?: () => void;
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
  onSendMessage,
  onEditMessage,
  onReactMessage,
}: ChatDrawerProps) => {
  const { currentUserId } = useCredentials();

  const chatContext = useVoiceRoomSetting();
  const chatStorage = useVoiceRoomStorage();

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
          borderTopLeftRadius: 1,
          borderTopRightRadius: 1,
          borderBottom: 'none',
        },
      }}
    >
      <RoomChatPanel
        currentUserId={currentUserId as string}
        onSendMessage={onSendMessage ?? chatStorage.handleSendMessage}
        onEditMessage={onEditMessage ?? chatStorage.handleEditMessage}
        onReactMessage={onReactMessage ?? chatStorage.handleReactMessage}
        onClose={handleClose}
      />
    </Drawer>
  );
};

export default RoomChatDrawer;

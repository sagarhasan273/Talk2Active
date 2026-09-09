import React from 'react';

import { Drawer } from '@mui/material';

import { slate } from './theme-tokens';
import { RoomChatPanel } from './room-chat-panel';

import type { ChatMessage } from './types';

type ChatDrawerProps = {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage?: (text: string, replyToId?: string) => void;
  onEditMessage?: (id: string, text: string) => void;
  onReactMessage?: (id: string, emoji: string) => void;
};

/** Mobile-only bottom sheet — desktop uses ResizableSidebar instead. */
export const RoomChatDrawer = ({
  open,
  onClose,
  messages,
  currentUserId,
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
        maxHeight: 640,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        bgcolor: slate[900],
        border: `1px solid ${slate[800]}`,
        borderBottom: 'none',
      },
    }}
  >
    <RoomChatPanel
      messages={messages}
      currentUserId={currentUserId}
      onSendMessage={onSendMessage}
      onEditMessage={onEditMessage}
      onReactMessage={onReactMessage}
      onClose={onClose}
    />
  </Drawer>
);

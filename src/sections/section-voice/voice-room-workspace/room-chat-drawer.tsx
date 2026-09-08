import React from 'react';

import { Drawer } from '@mui/material';

import { slate } from './theme-tokens';
import { ChatPanel } from './room-chat-panel';

import type { ChatMessage } from './types';

type ChatDrawerProps = {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage?: (text: string) => void;
};

/** Mobile-only bottom sheet — desktop uses ResizableSidebar instead. */
export const ChatDrawer = ({ open, onClose, messages, onSendMessage }: ChatDrawerProps) => (
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
    <ChatPanel messages={messages} onSendMessage={onSendMessage} onClose={onClose} />
  </Drawer>
);

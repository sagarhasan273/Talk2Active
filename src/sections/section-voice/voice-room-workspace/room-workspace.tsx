import React, { useState } from 'react';

import { Box } from '@mui/material';

import { ChatPanel } from './room-chat-panel';
import { ChatDrawer } from './room-chat-drawer';
import { RoomAudioStage } from './room-audio-stage';
import { ResizableSidebar } from './ResizableSidebar';

import type { ChatMessage, StageParticipant } from './types';

type RoomWorkspaceProps = {
  participants: StageParticipant[];
  maxParticipants: number;
  topicPrompt: string;
  onChangePrompt?: () => void;
  onToggleMic?: (muted: boolean) => void;
  onToggleDeafen?: (deafened: boolean) => void;
  onToggleRaiseHand?: (raised: boolean) => void;
  onOpenReactions?: () => void;
  onLeave?: () => void;
  initialMessages?: ChatMessage[];
  onSendMessage?: (text: string) => void;
};

const DEFAULT_SIDEBAR_WIDTH = 320;
const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 600;

/**
 * Composes RoomAudioStage with a chat panel:
 * - Desktop (lg+): chat sits in a ResizableSidebar next to the stage —
 *   drag the thin handle on its left edge to resize.
 * - Mobile: the sidebar is hidden; ControlDock's chat icon opens the same
 *   chat content in a bottom-sheet ChatDrawer instead.
 */
export const RoomWorkspace = ({
  participants,
  maxParticipants,
  topicPrompt,
  onChangePrompt,
  onToggleMic,
  onToggleDeafen,
  onToggleRaiseHand,
  onOpenReactions,
  onLeave,
  initialMessages = [],
  onSendMessage,
}: RoomWorkspaceProps) => {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const handleSend = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, authorName: 'You', text, isSelf: true },
    ]);
    onSendMessage?.(text);
  };

  const handleSidebarResize = (newWidth: number) => {
    // Clamp the width between min and max
    const clampedWidth = Math.min(Math.max(newWidth, MIN_SIDEBAR_WIDTH), MAX_SIDEBAR_WIDTH);
    setSidebarWidth(clampedWidth);
  };

  return (
    <Box sx={{ minHeight: 'fit-content', borderRadius: 1, width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: 'stretch',
          minHeight: { md: 560 },
          width: '100%', // Ensure the container takes full width
        }}
      >
        {/* RoomAudioStage container - will shrink/grow based on sidebar width */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0, // Prevents overflow
            display: 'flex',
            width: '100%', // Take remaining space
          }}
        >
          <RoomAudioStage
            participants={participants}
            maxParticipants={maxParticipants}
            topicPrompt={topicPrompt}
            onChangePrompt={onChangePrompt}
            onToggleMic={onToggleMic}
            onToggleDeafen={onToggleDeafen}
            onToggleRaiseHand={onToggleRaiseHand}
            onOpenReactions={onOpenReactions}
            onToggleChat={() => setChatOpen(true)}
            onLeave={onLeave}
          />
        </Box>

        {/* Desktop sidebar — hidden below the lg breakpoint */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexShrink: 0, // Prevent sidebar from shrinking
          }}
        >
          <ResizableSidebar
            width={sidebarWidth}
            onWidthChange={handleSidebarResize}
            minWidth={MIN_SIDEBAR_WIDTH}
            maxWidth={MAX_SIDEBAR_WIDTH}
          >
            <ChatPanel messages={messages} onSendMessage={handleSend} />
          </ResizableSidebar>
        </Box>
      </Box>

      {/* Mobile chat — opened via the chat icon in ControlDock */}
      <ChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={messages}
        onSendMessage={handleSend}
      />
    </Box>
  );
};

export default RoomWorkspace;

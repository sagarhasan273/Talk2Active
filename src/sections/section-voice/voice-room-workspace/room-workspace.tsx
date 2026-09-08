import React, { useState } from 'react';

import { Box } from '@mui/material';

import { ChatPanel } from './room-chat-panel';
import { ChatDrawer } from './room-chat-drawer';
import { RoomAudioStage } from './room-audio-stage';
import { ResizableSidebar } from './ResizableSidebar';
import { UserProfileDrawer } from '../voice-user-profile-drawer';

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

  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleSend = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, authorName: 'You', text, isSelf: true },
    ]);
    onSendMessage?.(text);
  };

  const handleProfileClick = (participant: any) => {
    setSelectedUser(participant);
    console.log('Profile clicked for participant:', participant);
    setProfileDrawerOpen(true);
  };

  const handleProfileClose = () => {
    setProfileDrawerOpen(false);
    setSelectedUser(null);
  };

  // Audio control handlers
  const handleVolumeChange = (userId: string, volume: number) => {
    // Update user's volume in your state/context
    console.log(`Volume for ${userId}: ${volume}`);
  };

  const handleToggleMute = (userId?: string) => {
    // Toggle mute for user
    console.log(`Toggle mute for ${userId}`);
  };

  const handleToggleDeafen = (userId?: string) => {
    // Toggle deafen for user
    console.log(`Toggle deafen for ${userId}`);
  };

  const handleFollow = (userId?: string) => {
    console.log(`Follow ${userId}`);
  };

  const handleUnfollow = (userId?: string) => {
    console.log(`Unfollow ${userId}`);
  };

  const handleBlock = (userId?: string) => {
    console.log(`Block ${userId}`);
  };

  const handleReport = (userId?: string) => {
    console.log(`Report ${userId}`);
  };

  const handleShare = (userId?: string) => {
    console.log(`Share ${userId}`);
  };

  return (
    <>
      <Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 1,
            alignItems: 'stretch',
            minHeight: { lg: 560 },
            width: '100%',
          }}
        >
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              width: '100%',
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
              onProfileClick={handleProfileClick} // Pass this down
            />
          </Box>

          {/* Desktop sidebar */}
          <Box
            sx={{
              display: { xs: 'none', lg: 'flex' },
              flexShrink: 0,
            }}
          >
            <ResizableSidebar
              width={sidebarWidth}
              onWidthChange={setSidebarWidth}
              minWidth={MIN_SIDEBAR_WIDTH}
              maxWidth={MAX_SIDEBAR_WIDTH}
            >
              <ChatPanel messages={messages} onSendMessage={handleSend} />
            </ResizableSidebar>
          </Box>
        </Box>

        {/* Mobile chat */}
        <ChatDrawer
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          messages={messages}
          onSendMessage={handleSend}
        />
      </Box>

      {/* User Profile Drawer */}
      <UserProfileDrawer
        open={profileDrawerOpen}
        onClose={handleProfileClose}
        user={selectedUser}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        onBlock={handleBlock}
        onReport={handleReport}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onToggleDeafen={handleToggleDeafen}
        onShare={handleShare}
      />
    </>
  );
};
export default RoomWorkspace;

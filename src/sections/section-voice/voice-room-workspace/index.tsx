import React, { useState } from 'react';
import { ResizeWidthLeft } from '@/components/resizeable-container';

import { Box } from '@mui/material';

import { RoomChatPanel } from './room-chat-panel';
import { RoomAudioStage } from './room-audio-stage';
import { RoomChatDrawer } from './room-chat-drawer';
import { VoiceRoomUserProfile } from '../voice-room-user-profile';

import type { ChatMessage, StageParticipant } from './types';

type RoomWorkspaceProps = {
  participants: StageParticipant[];
  maxParticipants: number;
  topicPrompt: string;
  /** Id and name of the person viewing this workspace — used to resolve
   * private (whisper) message visibility and to tag messages they send. */
  currentUserId: string;
  currentUserName: string;
  onChangePrompt?: () => void;
  onToggleMic?: (muted: boolean) => void;
  onToggleDeafen?: (deafened: boolean) => void;
  onToggleRaiseHand?: (raised: boolean) => void;
  onOpenReactions?: () => void;
  onLeave?: () => void;
  initialMessages?: ChatMessage[];
  onSendMessage?: (text: string, replyToId?: string) => void;
};

const DEFAULT_SIDEBAR_WIDTH = 320;
const MIN_SIDEBAR_WIDTH = 300;
const MAX_SIDEBAR_WIDTH = 600;

export const VoiceRoomWorkspace = ({
  participants,
  maxParticipants,
  topicPrompt,
  currentUserId,
  currentUserName,
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

  const handleSend = (text: string, replyToId?: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        authorId: currentUserId,
        authorName: currentUserName,
        text,
        isSelf: true,
        replyToId,
      },
    ]);
    onSendMessage?.(text, replyToId);
  };

  const handleEditMessage = (id: string, text: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, text, editedAt: new Date().toISOString() } : m))
    );
  };

  const handleReactMessage = (id: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const existing = m.reactions ?? [];
        const current = existing.find((r) => r.emoji === emoji);

        if (!current) {
          return { ...m, reactions: [...existing, { emoji, count: 1, reactedBySelf: true }] };
        }

        const nextCount = current.reactedBySelf ? current.count - 1 : current.count + 1;
        const nextReactions =
          nextCount <= 0
            ? existing.filter((r) => r.emoji !== emoji)
            : existing.map((r) =>
                r.emoji === emoji
                  ? { ...r, count: nextCount, reactedBySelf: !current.reactedBySelf }
                  : r
              );

        return { ...m, reactions: nextReactions };
      })
    );
  };

  const handleProfileClick = (participant: StageParticipant) => {
    setSelectedUser(participant);
    setProfileDrawerOpen(true);
  };

  const handleProfileClose = () => {
    setProfileDrawerOpen(false);
    setSelectedUser(null);
  };

  // --- Per-participant local playback controls (how *you* hear someone) ---
  // These are distinct from onToggleMic/onToggleDeafen above, which control
  // your own mic/audio session. TODO: wire these to your audio/session layer.
  const handleVolumeChange = (userId: string, volume: number) => {
    console.log(`Volume for ${userId}: ${volume}`);
  };

  const handleToggleParticipantMute = (userId?: string) => {
    console.log(`Toggle local mute for ${userId}`);
  };

  const handleToggleParticipantDeafen = (userId?: string) => {
    console.log(`Toggle local deafen for ${userId}`);
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
            flexDirection: { xs: 'column', md: 'row' },
            gap: 1,
            alignItems: 'stretch',
            width: '100%',
            minHeight: { md: '60vh' },
            maxHeight: { md: '70vh' },
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
              onProfileClick={handleProfileClick}
            />
          </Box>

          {/* Desktop sidebar — hidden below the md breakpoint */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexShrink: 0,
            }}
          >
            <ResizeWidthLeft
              width={sidebarWidth}
              onWidthChange={setSidebarWidth}
              minWidth={MIN_SIDEBAR_WIDTH}
              maxWidth={MAX_SIDEBAR_WIDTH}
            >
              <RoomChatPanel
                messages={messages}
                currentUserId={currentUserId}
                onSendMessage={handleSend}
                onEditMessage={handleEditMessage}
                onReactMessage={handleReactMessage}
              />
            </ResizeWidthLeft>
          </Box>
        </Box>

        {/* Mobile chat — opened via the chat icon in the control dock */}
        <RoomChatDrawer
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          messages={messages}
          currentUserId={currentUserId}
          onSendMessage={handleSend}
          onEditMessage={handleEditMessage}
          onReactMessage={handleReactMessage}
        />
      </Box>

      {/* User profile drawer */}
      <VoiceRoomUserProfile
        open={profileDrawerOpen}
        onClose={handleProfileClose}
        user={selectedUser}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        onBlock={handleBlock}
        onReport={handleReport}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleParticipantMute}
        onToggleDeafen={handleToggleParticipantDeafen}
        onShare={handleShare}
      />
    </>
  );
};

export default VoiceRoomWorkspace;

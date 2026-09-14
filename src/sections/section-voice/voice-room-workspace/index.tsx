import { ResizeWidthLeft } from '@/components/resizeable-container';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';

import { useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';

import { VoiceRoomUserProfile } from '../voice-room-user-profile';
import { RoomAudioStage } from './room-audio-stage';
import { RoomChatDrawer } from './room-chat-drawer';
import { RoomChatPanel } from './room-chat-panel';

import type { ChatMessage, StageParticipant } from './types';

type RoomWorkspaceProps = {
  participants: StageParticipant[];
  maxParticipants: number;
  topicPrompt: string;
  currentUserId: string;
  currentUserName: string;
  onChangePrompt?: () => void;
  onToggleMic?: (muted: boolean) => void;
  onToggleDeafen?: (deafened: boolean) => void;
  onToggleRaiseHand?: (raised: boolean) => void;
  onOpenReactions?: () => void;
  onLeave?: () => void;
  initialMessages?: ChatMessage[];
  onSendMessage?: (
    text: string,
    replyToId?: string,
    privateTo?: { id: string; name: string }
  ) => void;
  onEditMessage?: (id: string, text: string) => void;
  onReactMessage?: (id: string, emoji: string) => void;
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
  onEditMessage,
  onReactMessage,
}: RoomWorkspaceProps) => {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StageParticipant | null>(null);

  const audioTracks = useTracks([Track.Source.Microphone]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const handleSend = (
    text: string,
    replyToId?: string,
    privateTo?: { id: string; name: string }
  ) => {
    onSendMessage?.(text, replyToId, privateTo);
  };

  const handleEdit = (id: string, text: string) => {
    onEditMessage?.(id, text);
  };

  const handleReact = (id: string, emoji: string) => {
    onReactMessage?.(id, emoji);
  };

  const handleProfileClick = (participant: StageParticipant) => {
    setSelectedUser(participant);
    setProfileDrawerOpen(true);
  };

  const handleProfileClose = () => {
    setProfileDrawerOpen(false);
    setSelectedUser(null);
  };

  const handleVolumeChange = (userId: string, volume: number) => {
    const targetTrack = audioTracks.find((t) => t.participant.identity === userId);
    const track = targetTrack?.publication?.track;
    if (track && 'setVolume' in track) {
      (track as any).setVolume(volume);
    }
  };

  const handleToggleParticipantMute = (userId?: string) => {
    if (!userId) return;
    const targetTrack = audioTracks.find((t) => t.participant.identity === userId);
    const track = targetTrack?.publication?.track;
    if (track && 'setVolume' in track) {
      const currentVol = (track as any).volume ?? 1;
      (track as any).setVolume(currentVol > 0 ? 0 : 1);
    }
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
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', width: '100%' }}>
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

          {/* Desktop sidebar */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, flexShrink: 0 }}>
            <ResizeWidthLeft
              width={sidebarWidth}
              onWidthChange={setSidebarWidth}
              minWidth={MIN_SIDEBAR_WIDTH}
              maxWidth={MAX_SIDEBAR_WIDTH}
            >
              <RoomChatPanel
                messages={messages}
                currentUserId={currentUserId}
                participants={participants}
                onSendMessage={handleSend}
                onEditMessage={handleEdit}
                onReactMessage={handleReact}
              />
            </ResizeWidthLeft>
          </Box>
        </Box>

        {/* Mobile chat drawer */}
        <RoomChatDrawer
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          messages={messages}
          currentUserId={currentUserId}
          participants={participants}
          onSendMessage={handleSend}
          onEditMessage={handleEdit}
          onReactMessage={handleReact}
        />
      </Box>

      {/* User profile drawer */}
      <VoiceRoomUserProfile
        open={profileDrawerOpen}
        onClose={handleProfileClose}
        user={selectedUser}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleParticipantMute}
      />
    </>
  );
};

export default VoiceRoomWorkspace;

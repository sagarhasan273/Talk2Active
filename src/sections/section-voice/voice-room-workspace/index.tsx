import { ResizeWidthLeft } from '@/components/resizeable-container';
import { useTracks } from '@livekit/components-react';
import { Box, Tooltip, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Track } from 'livekit-client';
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { VoiceRoomUserProfile } from '../voice-room-user-profile';
import { RoomAudioStage } from './room-audio-stage';
import { RoomChatDrawer } from './room-chat-drawer';
import { RoomChatPanel } from './room-chat-panel';

import type { ChatMessage, ParticipantStageType } from './types';

type RoomWorkspaceProps = {
  participants: ParticipantStageType[];
  maxParticipants: number;
  topicPrompt: string;
  currentUserId: string;
  currentUserName: string;
  micMuted?: boolean;
  deafened?: boolean;
  handRaised?: boolean;
  onChangePrompt?: () => void;
  onToggleMic?: () => void;
  onToggleDeafen?: () => void;
  onToggleRaiseHand?: () => void;
  onToggleScreenShare?: () => void;
  onSendReaction?: (emoji: string) => void;
  onLeave?: () => void;
  initialMessages?: ChatMessage[];
  onSendMessage?: (
    text: string,
    replyToId?: string,
    privateTo?: { id: string; name: string },
    imageUrl?: string
  ) => void;
  onEditMessage?: (id: string, text: string) => void;
  onReactMessage?: (id: string, emoji: string) => void;
  onSettingsClick?: () => void;
  onBack?: () => void;
};

const DEFAULT_SIDEBAR_WIDTH = 340;
const MIN_SIDEBAR_WIDTH = 300;
const MAX_SIDEBAR_WIDTH = 580;

export const VoiceRoomWorkspace: React.FC<RoomWorkspaceProps> = ({
  participants,
  maxParticipants,
  topicPrompt,
  currentUserId,
  micMuted = false,
  deafened = false,
  handRaised = false,
  onChangePrompt,
  onToggleMic,
  onToggleDeafen,
  onToggleRaiseHand,
  onToggleScreenShare,
  onSendReaction,
  onLeave,
  initialMessages = [],
  onSendMessage,
  onEditMessage,
  onReactMessage,
  onSettingsClick,
  onBack
}) => {
  const theme = useTheme();

  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [chatOpen, setChatOpen] = useState(false);

  // Collapse state for presentation screen
  const [chatCollapsed, setChatCollapsed] = useState(false);

  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ParticipantStageType | null>(null);

  // Detect active screen shares
  const screenShareTracks = useTracks([Track.Source.ScreenShare]);
  const isPresenting = Boolean(screenShareTracks[0]?.publication);

  // Auto-collapse chat when presentation starts to give room to the screen
  useEffect(() => {
    if (isPresenting) {
      setChatCollapsed(true);
    }
  }, [isPresenting]);

  return (
    <>
      <Box
        sx={{
          width: 1,
          height: 1,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 1,
            alignItems: 'stretch',
            width: 1,
            height: { xs: 1, md: '75vh' },
            minHeight: { md: '65vh' },
          }}
        >
          {/* Main Voice, Presentation & Video Stage */}
          <RoomAudioStage
            participants={participants}
            maxParticipants={maxParticipants}
            topicPrompt={topicPrompt}
            micMuted={micMuted}
            deafened={deafened}
            handRaised={handRaised}
            onChangePrompt={onChangePrompt}
            onToggleMic={onToggleMic}
            onToggleDeafen={onToggleDeafen}
            onToggleRaiseHand={onToggleRaiseHand}
            onToggleScreenShare={onToggleScreenShare}
            onSendReaction={onSendReaction}
            onToggleChat={() => {
              setChatCollapsed((prev) => !prev);
              setChatOpen(true);
            }}
            onLeave={onLeave}
            onProfileClick={(p) => {
              setSelectedUser({ ...p });
              setProfileDrawerOpen(true);
            }}
            onSettingsClick={onSettingsClick}
            onBack={onBack}
          />


          {/* Desktop Chat: Expanded vs 20px Collapsed Rail */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexShrink: 0,
              height: '100%',
              alignItems: 'stretch',
            }}
          >
            {chatCollapsed ? (
              /* 20px Collapsed Rail Trigger */
              <Tooltip title="Expand chat" placement="left">
                <Box
                  onClick={() => setChatCollapsed(false)}
                  sx={{
                    width: 30,
                    height: '100%',
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    color: 'text.secondary',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: 'primary.main',
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                    },
                  }}
                >
                  <ChevronLeft size={18} />
                  <MessageSquare size={18} style={{ transform: 'rotate(90deg)' }} />
                  <ChevronLeft size={18} />
                </Box>
              </Tooltip>
            ) : (
              /* Expanded Resizable Chat Panel with Collapse Button */
              <Box sx={{ position: 'relative', display: 'flex', height: '100%' }}>
                <ResizeWidthLeft
                  width={sidebarWidth}
                  onWidthChange={setSidebarWidth}
                  minWidth={MIN_SIDEBAR_WIDTH}
                  maxWidth={MAX_SIDEBAR_WIDTH}
                >
                  <RoomChatPanel
                    messages={initialMessages}
                    currentUserId={currentUserId}
                    topicContext={topicPrompt}
                    participants={participants}
                    onSendMessage={onSendMessage}
                    onEditMessage={onEditMessage}
                    onReactMessage={onReactMessage}
                    onClose={() => setChatCollapsed(true)}
                  />
                </ResizeWidthLeft>

                {/* Quick Collapse Arrow Indicator */}
                {isPresenting && (
                  <Tooltip title="Collapse chat for presentation" placement="left">
                    <Box
                      onClick={() => setChatCollapsed(true)}
                      sx={{
                        position: 'absolute',
                        top: 14,
                        left: -12,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: 'background.paper',
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: theme.shadows[2],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        color: 'text.secondary',
                        '&:hover': {
                          color: 'primary.main',
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                    >
                      <ChevronRight size={14} />
                    </Box>
                  </Tooltip>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* Mobile Bottom Chat Sheet */}
        <RoomChatDrawer
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          messages={initialMessages}
          currentUserId={currentUserId}
          participants={participants}
          onSendMessage={onSendMessage}
          onEditMessage={onEditMessage}
          onReactMessage={onReactMessage}
        />
      </Box>

      {/* User Profile Modal Drawer */}
      <VoiceRoomUserProfile
        open={profileDrawerOpen}
        onClose={() => {
          setProfileDrawerOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </>
  );
};

export default VoiceRoomWorkspace;

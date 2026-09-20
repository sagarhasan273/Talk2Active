import { ResizeWidthLeft } from "@/components/resizeable-container";
import { useTracks } from "@livekit/components-react";

import { UseBooleanReturn } from "@/hooks/use-boolean";
import { alpha, Box, Tooltip, useTheme } from "@mui/material";
import { Track } from "livekit-client";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import RoomChatPanel from "../voice-room-audio-stage/room-chat-panel";
import { ChatMessage, ParticipantStageType } from "../voice-room-audio-stage/types";


const DEFAULT_SIDEBAR_WIDTH = 340;
const MIN_SIDEBAR_WIDTH = 300;
const MAX_SIDEBAR_WIDTH = 580;

type VoiceRoomChatProps = {
  messages: ChatMessage[];
  currentUserId: string;
  topicContext?: string;
  participants?: ParticipantStageType[];
  onSendMessage?: (
    text: string,
    replyToId?: string,
    privateTo?: { id: string; name: string },
    imageUrl?: string
  ) => void;
  onEditMessage?: (id: string, text: string) => void;
  onReactMessage?: (id: string, emoji: string) => void;
  onClose?: () => void;
  title?: string;
  collapsedBoolean: UseBooleanReturn
}
export function VoiceRoomChat({
  messages,
  currentUserId,
  topicContext = '',
  participants = [],
  collapsedBoolean,
  onSendMessage,
  onEditMessage,
  onReactMessage,
}: VoiceRoomChatProps) {
  const theme = useTheme();

  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);

  // Detect active screen shares
  const screenShareTracks = useTracks([Track.Source.ScreenShare]);
  const isPresenting = Boolean(screenShareTracks[0]?.publication);

  // Auto-collapse chat when presentation starts to give room to the screen
  useEffect(() => {
    if (isPresenting) {
      collapsedBoolean.onTrue();
    }
  }, [isPresenting]);

  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        flexShrink: 0,
        height: '100%',
        alignItems: 'stretch',
      }}
    >
      {collapsedBoolean.value ? (
        /* 20px Collapsed Rail Trigger */
        <Tooltip title="Expand chat" placement="left">
          <Box
            onClick={() => collapsedBoolean.onFalse()}
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
              messages={messages}
              currentUserId={currentUserId}
              topicContext={''}
              participants={participants}
              onSendMessage={onSendMessage}
              onEditMessage={onEditMessage}
              onReactMessage={onReactMessage}

              onClose={() => collapsedBoolean.onTrue()}
            />
          </ResizeWidthLeft>

          {/* Quick Collapse Arrow Indicator */}
          {isPresenting && (
            <Tooltip title="Collapse chat for presentation" placement="left">
              <Box
                onClick={() => collapsedBoolean.onTrue()}
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
  )
}

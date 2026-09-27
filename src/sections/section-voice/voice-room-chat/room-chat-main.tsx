import { useTracks } from '@livekit/components-react';
import { Badge, Box, Tooltip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Track } from 'livekit-client';
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ResizeWidthLeft } from '@/components/resizeable-container';

import RoomChatPanel from './room-chat-panel';
import { useRoomChat } from '@/core/contexts/context-room-chat';

const DEFAULT_SIDEBAR_WIDTH = 340;
const MIN_SIDEBAR_WIDTH = 300;
const MAX_SIDEBAR_WIDTH = 580;

export type RoomChatMainProps = {
  topicContext?: string;
  title?: string;
};

export function RoomChatMain({ topicContext = '', title }: RoomChatMainProps) {
  const theme = useTheme();
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);

  const {
    messages,
    currentUserId,
    unreadCount,
    isUnreadMessage,
    chatCollapsedBoolean,
    markAllAsRead,
    handleSendMessage,
    handleEditMessage,
    handleReactMessage,
  } = useRoomChat();

  // Detect active screen shares
  const screenShareTracks = useTracks([Track.Source.ScreenShare]);
  const isPresenting = Boolean(screenShareTracks[0]?.publication);

  // Auto-collapse chat rail when presentation mode begins
  useEffect(() => {
    if (isPresenting) {
      chatCollapsedBoolean.onTrue();
    }
  }, [isPresenting, chatCollapsedBoolean]);

  const handleExpand = () => {
    chatCollapsedBoolean.onFalse();
    markAllAsRead();
  };

  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        flexShrink: 0,
        height: '100%',
        minHeight: 0,
        alignItems: 'stretch',
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        position: 'relative',
      }}
    >
      {chatCollapsedBoolean.value ? (
        /* Collapsed Icon Rail */
        <Tooltip title="Expand chat" placement="left">
          <Box
            onClick={handleExpand}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleExpand();
            }}
            sx={{
              width: 32,
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
            <Badge
              badgeContent={unreadCount}
              color="error"
              invisible={!isUnreadMessage}
              max={99}
            >
              <MessageSquare size={18} style={{ transform: 'rotate(90deg)' }} />
            </Badge>
            <ChevronLeft size={18} />
          </Box>
        </Tooltip>
      ) : (
        /* Expanded Resizable Chat Panel */
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            height: '100%',
            minHeight: 0,
          }}
        >
          <ResizeWidthLeft
            width={sidebarWidth}
            onWidthChange={setSidebarWidth}
            minWidth={MIN_SIDEBAR_WIDTH}
            maxWidth={MAX_SIDEBAR_WIDTH}
          >
            <RoomChatPanel
              currentUserId={currentUserId}
              topicContext={topicContext}
              title={title}
              onSendMessage={handleSendMessage}
              onEditMessage={handleEditMessage}
              onReactMessage={handleReactMessage}
              onClose={() => chatCollapsedBoolean.onTrue()}
            />
          </ResizeWidthLeft>

          {/* Quick Collapse Arrow Indicator for presentations */}
          {isPresenting && (
            <Tooltip title="Collapse chat for presentation" placement="left">
              <Box
                onClick={() => chatCollapsedBoolean.onTrue()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') chatCollapsedBoolean.onTrue();
                }}
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
  );
}

export default RoomChatMain;

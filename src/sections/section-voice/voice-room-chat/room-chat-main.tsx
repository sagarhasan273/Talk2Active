// src/sections/section-voice/voice-room-chat/room-chat-main.tsx

import { Badge, Box, Tooltip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { useState } from 'react';

import { ResizeWidthLeft } from '@/components/resizeable-container';

import { useVoiceRoomSetting, useVoiceRoomStorage } from '@/core/contexts';
import { useCredentials } from '@/core/slices';
import RoomChatPanel from './room-chat-panel';

const DEFAULT_SIDEBAR_WIDTH = 340;
const MIN_SIDEBAR_WIDTH = 300;
const MAX_SIDEBAR_WIDTH = 580;

export type RoomChatMainProps = {
  topicContext?: string;
  title?: string;
};

export function RoomChatMain({ topicContext = '', title }: RoomChatMainProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);

  const { user } = useCredentials();
  const currentUserId = user?.userId || '';

  const {
    unreadCount,
    isUnreadMessage,
    markAllAsRead,
    handleSendMessage,
    handleEditMessage,
    handleReactMessage,
  } = useVoiceRoomStorage();
  const { chatCollapsedBoolean } = useVoiceRoomSetting();

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
        bgcolor: 'background.default',
        borderRadius: 1,
        border: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
        position: 'relative',
      }}
    >
      {chatCollapsedBoolean.value ? (
        /* Collapsed Icon Rail */
        <Tooltip title="Expand chat" placement="left" arrow>
          <Box
            onClick={handleExpand}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleExpand();
            }}
            sx={{
              width: 34,
              height: '100%',
              borderRadius: 1,
              bgcolor: isDark ? '#181c26' : '#ffffff',
              borderRight: '1px solid',
              borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              color: isDark ? 'text.secondary' : '#64748b',
              '&:hover': {
                bgcolor: isDark ? alpha('#fff', 0.04) : '#f8fafc',
                color: 'primary.main',
              },
            }}
          >
            <ChevronLeft size={16} />
            <Badge
              badgeContent={unreadCount}
              color="error"
              invisible={!isUnreadMessage}
              max={99}
              sx={{
                '& .MuiBadge-badge': {
                  borderRadius: 0.75,
                  fontSize: 9,
                  fontWeight: 800,
                },
              }}
            >
              <MessageSquare size={16} style={{ transform: 'rotate(90deg)' }} />
            </Badge>
            <ChevronLeft size={16} />
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

          {/* Quick Collapse Arrow Indicator */}
          <Tooltip title="Collapse chat" placement="left" arrow>
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
                borderRadius: 1,
                bgcolor: isDark ? '#181c26' : '#ffffff',
                border: '1px solid',
                borderColor: isDark ? alpha('#fff', 0.12) : '#e2e8f0',
                boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.5)' : '0 2px 6px rgba(15,23,42,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
                color: isDark ? 'text.secondary' : '#64748b',
                transition: 'all 0.15s ease',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: isDark ? alpha('#fff', 0.08) : '#f8fafc',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <ChevronRight size={14} />
            </Box>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
}

export default RoomChatMain;

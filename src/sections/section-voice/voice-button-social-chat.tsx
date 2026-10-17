// src/sections/section-voice/voice-button-social-chat.tsx

import React, { useEffect, useRef, useState } from 'react';

import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import {
  alpha,
  Badge,
  Box,
  IconButton,
  type SxProps,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { useSocialChat } from '@/core/contexts/context-social-chat';
import { useCredentials } from '@/core/slices';
import { SocialChatMain } from '../section-common/social-chat-main';

/* ------------------------------------------------------------------ */
/* Resize limits                                                       */
/* ------------------------------------------------------------------ */
const MIN_WIDTH = 280;
const MAX_WIDTH = 500;
const MIN_HEIGHT = 350;
const MAX_HEIGHT = 650;
const DEFAULT_WIDTH = 360;
const DEFAULT_HEIGHT = 550;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
const VoiceButtonSocialChat = ({ sx, onJoinRoom }: { sx?: SxProps, onJoinRoom: (roomId: string) => void }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { user, followers, following, friends } = useCredentials();

  // Pull live unread metrics from SocialChatContext
  const { unreadFriendsCount, hasUnreadMessages } = useSocialChat();

  const currentUserId = user?.userId || '';
  const currentUserName = user?.name || user?.username || 'You';

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [chatWidth, setChatWidth] = useState(DEFAULT_WIDTH);
  const [chatHeight, setChatHeight] = useState(DEFAULT_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);
  const [open, setOpen] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  const resizeDirection = useRef<'left' | 'top' | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const startWidth = useRef(DEFAULT_WIDTH);
  const startHeight = useRef(DEFAULT_HEIGHT);

  /* ------------------------------------------------------------------ */
  /* Resize Handlers (Expanding to the Left and Top)                    */
  /* ------------------------------------------------------------------ */
  const startResize = (
    direction: 'left' | 'top',
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (isMobile) return;
    event.preventDefault();
    event.stopPropagation();
    resizeDirection.current = direction;
    startX.current = event.clientX;
    startY.current = event.clientY;
    startWidth.current = chatWidth;
    startHeight.current = chatHeight;
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return undefined;

    const handleMouseMove = (event: MouseEvent) => {
      const direction = resizeDirection.current;
      if (!direction) return;

      if (direction === 'left') {
        const deltaX = startX.current - event.clientX;
        const newWidth = startWidth.current + deltaX;
        const maxAvailableWidth = Math.min(MAX_WIDTH, window.innerWidth - 32);

        setChatWidth(Math.min(Math.max(MIN_WIDTH, newWidth), maxAvailableWidth));
      }

      if (direction === 'top') {
        const deltaY = startY.current - event.clientY;
        const newHeight = startHeight.current + deltaY;
        const maxAvailableHeight = Math.min(MAX_HEIGHT, window.innerHeight - 32);

        setChatHeight(Math.min(maxAvailableHeight, Math.max(MIN_HEIGHT, newHeight)));
      }
    };

    const handleMouseUp = () => {
      resizeDirection.current = null;
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  /* ------------------------------------------------------------------ */
  /* Click Outside Listener                                             */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!open || isResizing) return;

      const target = event.target as Element;

      if (chatContainerRef.current?.contains(target)) return;
      if (buttonContainerRef.current?.contains(target)) return;
      if (target.closest('.MuiPopover-root') || target.closest('.MuiPopper-root')) return;

      setOpen(false);
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside, true);
      document.addEventListener('touchstart', handleClickOutside, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [open, isResizing]);

  return (
    <Box
      sx={{
        position: 'fixed',
        zIndex: (muiTheme) =>
          open ? muiTheme.zIndex.modal : muiTheme.zIndex.appBar + 10,
        bottom: { xs: 16, sm: 20 },
        right: { xs: 16, sm: 20 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      {/* ── Chat Window (Renders above the Button, anchored on the right) ── */}
      {open && (
        <Box
          ref={chatContainerRef}
          sx={{
            position: { xs: 'fixed', sm: 'relative' },
            top: { xs: 0, sm: 'auto' },
            left: { xs: 0, sm: 'auto' },
            right: { xs: 0, sm: 60 },
            bottom: { xs: 0, sm: -45 },
            width: { xs: '100vw', sm: `${chatWidth}px` },
            height: { xs: '100dvh', sm: `${chatHeight}px` },
            zIndex: 2,
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            minHeight: 0,
          }}
        >
          {/* Top Resize Handle */}
          <Box
            onMouseDown={(e) => startResize('top', e)}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              position: 'absolute',
              top: -5,
              left: 0,
              right: 0,
              height: 10,
              zIndex: 3,
              cursor: 'ns-resize',
              justifyContent: 'center',
              alignItems: 'center',
              '&::after': {
                content: '""',
                width: 48,
                height: 3,
                borderRadius: 1,
                backgroundColor: 'transparent',
                transition: 'background-color 0.15s ease',
              },
              '&:hover::after': { backgroundColor: 'primary.main' },
            }}
          />

          {/* Left Resize Handle */}
          <Box
            onMouseDown={(e) => startResize('left', e)}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              position: 'absolute',
              left: -5,
              top: 0,
              bottom: 0,
              width: 10,
              zIndex: 3,
              cursor: 'ew-resize',
              justifyContent: 'center',
              alignItems: 'center',
              '&::after': {
                content: '""',
                width: 3,
                height: 48,
                borderRadius: 1,
                backgroundColor: 'transparent',
                transition: 'background-color 0.15s ease',
              },
              '&:hover::after': { backgroundColor: 'primary.main' },
            }}
          />

          {/* Inner Chat Box */}
          <Box
            sx={{
              width: '100%',
              height: '100%',
              minWidth: 0,
              minHeight: 0,
              overflow: 'hidden',
              bgcolor: isDark ? '#181c26' : '#ffffff',
              borderRadius: { xs: 0, sm: 1 },
              border: '1px solid',
              borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
              boxShadow: isDark
                ? '0 24px 56px -8px rgba(0, 0, 0, 0.75)'
                : '0 20px 48px -8px rgba(15, 23, 42, 0.18)',
              ...(isResizing && { transition: 'none !important' }),
            }}
          >
            <SocialChatMain
              friends={friends}
              followers={followers}
              following={following}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              isLoading={false}
              onJoinRoom={onJoinRoom}
              onClose={() => setOpen(false)}
            />
          </Box>
        </Box>
      )}

      {/* ── Fixed Bottom-Right Trigger Button ── */}
      <Box
        ref={buttonContainerRef}
        sx={{
          display: { xs: open ? 'none' : 'inline-flex', sm: 'inline-flex' },
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Badge
          color="error"
          badgeContent={unreadFriendsCount}
          invisible={!hasUnreadMessages}
          max={99}
          overlap="circular" // 1. Changed to 'circular' to match the round button
        >
          <IconButton
            size="medium"
            onClick={() => setOpen((prev) => !prev)}
            sx={{
              pointerEvents: 'auto',
              bgcolor: isDark ? alpha('#181c26', 0.9) : '#ffffff',
              border: '1px solid',
              borderColor: isDark ? alpha('#fff', 0.12) : '#e2e8f0',
              boxShadow: theme.customShadows?.z8 || '0 4px 14px rgba(0,0,0,0.1)',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: isDark ? '#252b3b' : '#f8fafc',
                transform: 'translateY(-2px)'
              },
              ...sx,
            }}
          >
            {/* 4. Changed to a new chat/social icon */}
            <ForumRoundedIcon fontSize="medium" />
          </IconButton>
        </Badge>
      </Box>
    </Box >
  );
};

export default VoiceButtonSocialChat;

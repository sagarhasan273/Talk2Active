import React, { useEffect, useRef, useState } from 'react';

import Diversity2Icon from '@mui/icons-material/Diversity2';
import { alpha, Badge, Box, IconButton, type SxProps, useMediaQuery, useTheme } from '@mui/material';

import { useCredentials } from '@/core/slices';
import SocialChat from '@/sections/section-common/social-chat';

/* ------------------------------------------------------------------ */
/* Resize limits                                                      */
/* ------------------------------------------------------------------ */
const MIN_WIDTH = 280;
const MAX_WIDTH = 500;
const MIN_HEIGHT = 350;
const MAX_HEIGHT = 650;
const DEFAULT_WIDTH = 360;
const DEFAULT_HEIGHT = 550;

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
const VoiceButtonSocialChat = ({ sx }: { sx?: SxProps }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { user, followers, following, friends } = useCredentials();

  const currentUserId = user?.userId || '';
  const currentUserName = user?.name || user?.username || 'You';

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(DEFAULT_WIDTH);
  const [chatHeight, setChatHeight] = useState(DEFAULT_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);

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
        // Dragging left increases width because the panel is anchored on the right
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
        zIndex: (muiTheme) => (open ? muiTheme.zIndex.modal : muiTheme.zIndex.speedDial),
        // Anchored strictly to the bottom-right corner
        bottom: { xs: 16, sm: 20 },
        right: { xs: 16, sm: 20 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 1.5,
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
            right: { xs: 0, sm: 110 },
            bottom: { xs: 0, sm: -45 },
            width: { xs: '100vw', sm: `${chatWidth}px` },
            height: { xs: '100dvh', sm: `${chatHeight}px` },
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            minHeight: 0,
            filter: isDark
              ? 'drop-shadow(0 20px 48px rgba(0, 0, 0, 0.75))'
              : `drop-shadow(0 20px 40px ${alpha(theme.palette.common.black, 0.18)})`,
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
              zIndex: 1500,
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

          {/* Left Resize Handle (Expands width toward the left) */}
          <Box
            onMouseDown={(e) => startResize('left', e)}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              position: 'absolute',
              left: -5,
              top: 0,
              bottom: 0,
              width: 10,
              zIndex: 1500,
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
              bgcolor: 'background.paper',
              borderRadius: { xs: 0, sm: 1 },
              border: '1px solid',
              borderColor: isDark
                ? alpha(theme.palette.common.white, 0.12)
                : alpha(theme.palette.common.black, 0.1),
              boxShadow: isDark
                ? '0 28px 64px -8px rgba(0, 0, 0, 0.85), 0 12px 24px -4px rgba(0, 0, 0, 0.55)'
                : `0 24px 56px -8px ${alpha(theme.palette.common.black, 0.48)}, 0 10px 20px -4px ${alpha(theme.palette.common.black, 0.28)}`,
              ...(isResizing && { transition: 'none !important' }),
            }}
          >
            <SocialChat
              friends={friends}
              followers={followers}
              following={following}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              isLoading={false}
              onClose={() => setOpen(false)}
            />
          </Box>
        </Box>
      )}

      {/* ── Fixed Bottom-Right Trigger Button ── */}
      <Box
        ref={buttonContainerRef}
        sx={{
          display: { xs: 'none', sm: 'inline-flex' },
          pointerEvents: 'auto',
          position: 'relative',
        }}
      >
        <Badge color="error" badgeContent={0} overlap="circular">
          <IconButton
            onClick={() => setOpen((prev) => !prev)}
            size="small"
            sx={{
              bgcolor: 'primary.main',
              color: '#fff',
              borderRadius: 1.5,
              px: 2.25,
              py: 1,
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: isDark
                ? '0 8px 24px rgba(0, 0, 0, 0.55)'
                : `0 8px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
              '&:hover': {
                bgcolor: 'primary.dark',
                boxShadow: isDark
                  ? '0 12px 28px rgba(0, 0, 0, 0.7)'
                  : `0 12px 28px ${alpha(theme.palette.primary.main, 0.45)}`,
              },
              ...sx,
            }}
          >
            <Diversity2Icon style={{ fontSize: 18, marginRight: 8 }} /> Social
          </IconButton>
        </Badge>
      </Box>
    </Box>
  );
};

export default VoiceButtonSocialChat;

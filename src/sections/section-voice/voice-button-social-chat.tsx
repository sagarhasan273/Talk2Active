import React, { useRef, useState, useEffect } from 'react';
import SocialChat from '@/sections/section-common/social-chat';

import Diversity2Icon from '@mui/icons-material/Diversity2';
import { Box, Badge, IconButton, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material';

/* ------------------------------------------------------------------ */ /* Resize limits */ /* ------------------------------------------------------------------ */ const MIN_WIDTH = 280;
const MAX_WIDTH = 500;
const MIN_HEIGHT = 350;
const MAX_HEIGHT = 650;
const DEFAULT_WIDTH = 360;
const DEFAULT_HEIGHT = 550;
/* ------------------------------------------------------------------ */ /* Component */ /* ------------------------------------------------------------------ */
const VoiceButtonSocialChat = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);
  /* ---------------------------------------------------------------- */ /* Size */ /* ---------------------------------------------------------------- */ const [
    chatWidth,
    setChatWidth,
  ] = useState(DEFAULT_WIDTH);
  const [chatHeight, setChatHeight] = useState(DEFAULT_HEIGHT);
  /* ---------------------------------------------------------------- */ /* Resize state */ /* ---------------------------------------------------------------- */ const [
    isResizing,
    setIsResizing,
  ] = useState(false);
  const resizeDirection = useRef<'left' | 'right' | 'top' | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const startWidth = useRef(DEFAULT_WIDTH);
  const startHeight = useRef(DEFAULT_HEIGHT);
  const totalUnreadFriends = 1;
  /* ------------------------------------------------------------------ */ /* Start resize */ /* ------------------------------------------------------------------ */ const startResize =
    (direction: 'left' | 'right' | 'top', event: React.MouseEvent<HTMLDivElement>) => {
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
  /* ------------------------------------------------------------------ */ /* Resize */ /* ------------------------------------------------------------------ */ useEffect(() => {
      if (!isResizing) return undefined;
      const handleMouseMove = (event: MouseEvent) => {
        const direction = resizeDirection.current;
        if (!direction) return;
      /* -------------------------------------------------------------- */ /* Width */ /* -------------------------------------------------------------- */ if (
          direction === 'left' ||
          direction === 'right'
        ) {
          const deltaX = event.clientX - startX.current;
          let newWidth = startWidth.current;
          if (direction === 'left') {
          /* * Left edge: * Moving left -> wider * Moving right -> narrower */ newWidth =
              startWidth.current - deltaX;
          } else {
          /* * Right edge: * Moving right -> wider * Moving left -> narrower */ newWidth =
              startWidth.current + deltaX;
          }
          const maxAllowedWidth = Math.min(MAX_WIDTH, window.innerWidth - 32);
          newWidth = Math.min(Math.max(MIN_WIDTH, newWidth), maxAllowedWidth);
          setChatWidth(newWidth);
        }
      /* -------------------------------------------------------------- */ /* Height */ /* -------------------------------------------------------------- */ if (
          direction === 'top'
        ) {
        /* * Because the bottom is fixed: * * Moving top upward -> taller * Moving top downward -> shorter */ const deltaY =
            startY.current - event.clientY;

          let newHeight = startHeight.current + deltaY;
          newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, newHeight));
          setChatHeight(newHeight);
        }
      };
      const handleMouseUp = () => {
        resizeDirection.current = null;
        setIsResizing(false);
      };
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'ew-resize';
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }, [isResizing, chatWidth, chatHeight, isMobile]);
  /* ------------------------------------------------------------------ */ /* Render */ /* ------------------------------------------------------------------ */ return (
    <Box
      sx={{
        position: 'absolute',
        right: { xs: 0, sm: 24 },
        bottom: { xs: 0, sm: 24 },
        top: {
          xs: 0,
          sm: 'auto',
        },
        left: { xs: 0, sm: 'auto' },
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 1.5,
        /* * Width changes with resize. */ width: { xs: '100%', sm: `${chatWidth}px` },
        /* * Chat height is resizable between * 35vh and 65vh. */ height: {
          xs: '100%',
          sm: `${chatHeight}px`,
        },
        pointerEvents: 'none',
      }}
    >
      {/* ============================================================ */} {/* CHAT */}
      {/* ============================================================ */}
      {open && (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            minHeight: 0,
          }}
        >
          {/* ======================================================== */}
          {/* TOP RESIZE HANDLE */}
          {/* ======================================================== */}
          <Box
            onMouseDown={(event) => startResize('top', event)}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              position: 'absolute',
              top: -5,
              left: 0,
              right: 0,
              height: 10,
              zIndex: 1500,
              cursor: 'ns-resize',
              alignItems: 'center',
              justifyContent: 'center',
              '&::after': {
                content: '""',
                width: 48,
                height: 3,
                borderRadius: 3,
                backgroundColor: 'transparent',
                transition: 'background-color 0.15s ease',
              },
              '&:hover::after': { backgroundColor: 'primary.main' },
            }}
          />
          {/* ======================================================== */}
          {/* LEFT RESIZE HANDLE */}
          {/* ======================================================== */}
          <Box
            onMouseDown={(event) => startResize('left', event)}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              position: 'absolute',
              left: -5,
              top: 0,
              bottom: 0,
              width: 10,
              zIndex: 1500,
              cursor: 'ew-resize',
              alignItems: 'center',
              justifyContent: 'center',
              '&::after': {
                content: '""',
                width: 3,
                height: 48,
                borderRadius: 3,
                backgroundColor: 'transparent',
                transition: 'background-color 0.15s ease',
              },
              '&:hover::after': { backgroundColor: 'primary.main' },
            }}
          />{' '}
          {/* ======================================================== */} {/* CHAT CONTENT */}{' '}
          {/* ======================================================== */}{' '}
          <Box
            sx={{
              width: '100%',
              height: '100%',
              minWidth: 0,
              minHeight: 0,
              overflow: 'hidden',
              ...(isResizing && { transition: 'none !important' }),
            }}
          >
            {' '}
            <SocialChat
              onClose={() => {
                setOpen(false);
              }}
            />{' '}
          </Box>
          {/* ======================================================== */}
          {/* RIGHT RESIZE HANDLE */}
          {/* ======================================================== */}
          <Box
            onMouseDown={(event) => startResize('right', event)}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              position: 'absolute',
              right: -5,
              top: 0,
              bottom: 0,
              width: 10,
              zIndex: 1500,
              cursor: 'ew-resize',
              alignItems: 'center',
              justifyContent: 'center',
              '&::after': {
                content: '""',
                width: 3,
                height: 48,
                borderRadius: 3,
                backgroundColor: 'transparent',
                transition: 'background-color 0.15s ease',
              },
              '&:hover::after': { backgroundColor: 'primary.main' },
            }}
          />
        </Box>
      )}
      {/* ============================================================ */} {/* SOCIAL BUTTON */}
      {/* ============================================================ */}
      {!open && (
        <Badge
          color="error"
          badgeContent={totalUnreadFriends}
          overlap="circular"
          sx={{
            pointerEvents: 'auto',
            position: 'absolute',
            right: { xs: 0, sm: 0 },
            bottom: { xs: 0, sm: 0 },
            top: { xs: 0, sm: 'auto' },
            left: { xs: 0, sm: 'auto' },
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <IconButton
            onClick={() => setOpen((value) => !value)}
            size="small"
            sx={{
              bgcolor: 'primary.main',
              color: '#fff',
              textTransform: 'none',
              fontSize: 18,
              borderRadius: 1,
              px: 2,
              py: 1.5,
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            <Diversity2Icon style={{ fontSize: 18, marginRight: 8 }} /> Social
          </IconButton>
        </Badge>
      )}
    </Box>
  );
};
export default VoiceButtonSocialChat;

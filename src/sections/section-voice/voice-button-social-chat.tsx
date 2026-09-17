import React, { useEffect, useRef, useState } from 'react';

import Diversity2Icon from '@mui/icons-material/Diversity2';
import { Badge, Box, CircularProgress, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Socket } from 'socket.io-client';

import { useGetFollowersQuery, useGetFollowingQuery, useGetFriendsQuery } from '@/core/apis';
import { useCredentials } from '@/core/slices';
import { connectSocket } from '@/core/socket';
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
const VoiceButtonSocialChat = () => {
  const theme = useTheme();
  const { user } = useCredentials();

  const currentUserId = user?.userId || '';
  const currentUserName = user?.name || user?.username || 'You';

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(DEFAULT_WIDTH);
  const [chatHeight, setChatHeight] = useState(DEFAULT_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  const resizeDirection = useRef<'left' | 'right' | 'top' | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const startWidth = useRef(DEFAULT_WIDTH);
  const startHeight = useRef(DEFAULT_HEIGHT);

  // Queries
  const { data: friendsData, isLoading: loadingFriends } = useGetFriendsQuery(currentUserId, {
    skip: !currentUserId,
  });
  const { data: followersData, isLoading: loadingFollowers } = useGetFollowersQuery(currentUserId, {
    skip: !currentUserId,
  });
  const { data: followingData, isLoading: loadingFollowing } = useGetFollowingQuery(currentUserId, {
    skip: !currentUserId,
  });

  const friends = (friendsData as any)?.data || [];
  const followers = (followersData as any)?.data || [];
  const following = (followingData as any)?.data || [];

  const isAnyLoading = loadingFriends || loadingFollowers || loadingFollowing;

  /* ------------------------------------------------------------------ */
  /* Socket Setup                                                       */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!currentUserId) return;

    const s = connectSocket(currentUserId);
    setSocketInstance(s);

    const onReconnect = () => {
      s.emit('join_global_chat', currentUserId);
    };

    s.on('connect', onReconnect);

    return () => {
      s.off('connect', onReconnect);
    };
  }, [currentUserId]);

  /* ------------------------------------------------------------------ */
  /* Resize Handlers                                                    */
  /* ------------------------------------------------------------------ */
  const startResize = (
    direction: 'left' | 'right' | 'top',
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

      if (direction === 'left' || direction === 'right') {
        const deltaX = event.clientX - startX.current;
        let newWidth = startWidth.current;
        newWidth = direction === 'left' ? startWidth.current - deltaX : startWidth.current + deltaX;

        const maxAllowedWidth = Math.min(MAX_WIDTH, window.innerWidth - 32);
        setChatWidth(Math.min(Math.max(MIN_WIDTH, newWidth), maxAllowedWidth));
      }

      if (direction === 'top') {
        const deltaY = startY.current - event.clientY;
        const newHeight = startHeight.current + deltaY;
        setChatHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, newHeight)));
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

  return (
    <Box
      sx={{
        position: 'absolute',
        right: { xs: 0, sm: 10 },
        bottom: { xs: 0, sm: 0 },
        top: { xs: 0, sm: 'auto' },
        left: { xs: 0, sm: 'auto' },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 1.5,
        width: { xs: '100%', sm: `${chatWidth}px` },
        height: { xs: '100%', sm: `${chatHeight}px` },
        pointerEvents: 'none',
      }}
    >
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
                borderRadius: 3,
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
              zIndex: 1500,
              cursor: 'ew-resize',
              justifyContent: 'center',
              alignItems: 'center',
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

          {/* Inner Chat Box */}
          <Box
            sx={{
              width: '100%',
              height: '100%',
              minWidth: 0,
              minHeight: 0,
              overflow: 'hidden',
              bgcolor: 'background.paper',
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
              ...(isResizing && { transition: 'none !important' }),
            }}
          >
            {isAnyLoading && !friends.length && !followers.length && !following.length ? (
              <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size={26} />
              </Box>
            ) : (
              <SocialChat
                socket={socketInstance}
                friends={friends}
                followers={followers}
                following={following}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                isLoading={isAnyLoading}
                onClose={() => setOpen(false)}
              />
            )}
          </Box>

          {/* Right Resize Handle */}
          <Box
            onMouseDown={(e) => startResize('right', e)}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              position: 'absolute',
              right: -5,
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
                borderRadius: 3,
                backgroundColor: 'transparent',
                transition: 'background-color 0.15s ease',
              },
              '&:hover::after': { backgroundColor: 'primary.main' },
            }}
          />
        </Box>
      )}

      {/* Floating Action Badge */}
      {!open && (
        <Badge
          color="error"
          badgeContent={0}
          overlap="circular"
          sx={{
            pointerEvents: 'auto',
            position: 'absolute',
            right: { xs: 0, sm: 0 },
            bottom: { xs: 0, sm: 0 },
            display: { xs: 'none', sm: 'flex' },
          }}
        >
          <IconButton
            onClick={() => setOpen(true)}
            size="small"
            sx={{
              bgcolor: 'primary.main',
              color: '#fff',
              borderRadius: 1,
              px: 3,
              py: 1,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            <Diversity2Icon style={{ fontSize: 16, marginRight: 8 }} /> Social Messages
          </IconButton>
        </Badge>
      )}
    </Box>
  );
};

export default VoiceButtonSocialChat;
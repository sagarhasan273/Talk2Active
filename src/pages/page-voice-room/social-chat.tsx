// SocialChat.tsx

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Send, Move, Users, Search, MoreVertical, MessageCircle } from 'lucide-react';

import { styled } from '@mui/material/styles';
import {
  Box,
  Tab,
  Tabs,
  List,
  Chip,
  Fade,
  Zoom,
  alpha,
  Badge,
  Paper,
  Avatar,
  Tooltip,
  useTheme,
  TextField,
  IconButton,
  Typography,
  ListItemText,
  InputAdornment,
  ListItemAvatar,
  ListItemButton,
} from '@mui/material';

// Mock data - replace with real data from your backend
interface UserType {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
  mutualFriends?: number;
  isFollowed?: boolean;
  isFollowing?: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
  reactions?: { emoji: string; count: number; reactedBySelf: boolean }[];
}

interface Chat {
  userId: string;
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

const mockUsers: UserType[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    status: 'online',
    mutualFriends: 12,
    isFollowed: true,
    isFollowing: true,
  },
  {
    id: '2',
    name: 'Michael Chen',
    avatar: 'https://i.pravatar.cc/150?img=2',
    status: 'online',
    mutualFriends: 8,
    isFollowed: true,
    isFollowing: true,
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    avatar: 'https://i.pravatar.cc/150?img=3',
    status: 'offline',
    lastSeen: '2 hours ago',
    mutualFriends: 5,
    isFollowed: true,
    isFollowing: false,
  },
  {
    id: '4',
    name: 'David Kim',
    avatar: 'https://i.pravatar.cc/150?img=4',
    status: 'away',
    lastSeen: '1 hour ago',
    mutualFriends: 3,
    isFollowed: false,
    isFollowing: true,
  },
  {
    id: '5',
    name: 'Lisa Wang',
    avatar: 'https://i.pravatar.cc/150?img=5',
    status: 'online',
    mutualFriends: 15,
    isFollowed: true,
    isFollowing: true,
  },
  {
    id: '6',
    name: 'James Wilson',
    avatar: 'https://i.pravatar.cc/150?img=6',
    status: 'offline',
    lastSeen: '5 hours ago',
    mutualFriends: 2,
    isFollowed: false,
    isFollowing: false,
  },
];

// Mock chat data
const mockChats: Record<string, Chat> = {
  '1': {
    userId: '1',
    messages: [
      {
        id: 'm1',
        userId: '1',
        text: 'Hey! How are you doing?',
        timestamp: '10:30 AM',
        isSelf: false,
      },
      {
        id: 'm2',
        userId: 'current',
        text: "I'm good! Just working on the new project.",
        timestamp: '10:32 AM',
        isSelf: true,
      },
      {
        id: 'm3',
        userId: '1',
        text: 'That sounds exciting! Need any help?',
        timestamp: '10:35 AM',
        isSelf: false,
      },
    ],
    unreadCount: 1,
  },
  '2': {
    userId: '2',
    messages: [
      {
        id: 'm4',
        userId: '2',
        text: 'The meeting is at 3 PM today.',
        timestamp: '9:00 AM',
        isSelf: false,
      },
      {
        id: 'm5',
        userId: 'current',
        text: "Got it, I'll be there.",
        timestamp: '9:05 AM',
        isSelf: true,
      },
    ],
    unreadCount: 0,
  },
  '5': {
    userId: '5',
    messages: [
      {
        id: 'm6',
        userId: '5',
        text: 'Love your latest post!',
        timestamp: 'Yesterday',
        isSelf: false,
      },
    ],
    unreadCount: 2,
  },
};

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

// Resize Handle Component
//
// IMPORTANT:
// - Uses pointer events instead of mouse movementX/movementY.
// - Uses clientX/clientY deltas so resizing is stable even when the pointer
//   moves quickly or crosses children.
// - The handle reports the delta in SIZE, not raw pointer direction.
//   For example, dragging the LEFT handle to the right makes width smaller.
// - Handles are kept inside the window so they are not clipped by overflow.
const ResizeHandle = ({
  onResize,
  position = 'bottom-right',
  onResizeStart,
  onResizeEnd,
}: {
  onResize: (deltaX: number, deltaY: number) => void;
  position:
    | 'bottom-right'
    | 'bottom-left'
    | 'top-right'
    | 'top-left'
    | 'right'
    | 'bottom'
    | 'left'
    | 'top';
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}) => {
  const draggingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  const cursor =
    position === 'left' || position === 'right'
      ? 'ew-resize'
      : position === 'top' || position === 'bottom'
        ? 'ns-resize'
        : position === 'bottom-right' || position === 'top-left'
          ? 'nwse-resize'
          : 'nesw-resize';

  const getDelta = (event: PointerEvent) => {
    const dx = event.clientX - lastPointRef.current.x;
    const dy = event.clientY - lastPointRef.current.y;
    lastPointRef.current = { x: event.clientX, y: event.clientY };

    let deltaX = 0;
    let deltaY = 0;

    if (position.includes('right')) deltaX = dx;
    if (position.includes('left')) deltaX = -dx;
    if (position.includes('bottom')) deltaY = dy;
    if (position.includes('top')) deltaY = -dy;

    if (position === 'right' || position === 'left') deltaY = 0;
    if (position === 'top' || position === 'bottom') deltaX = 0;

    return { deltaX, deltaY };
  };

  const stop = useCallback(() => {
    if (!draggingRef.current) return;

    draggingRef.current = false;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    onResizeEnd?.();
  }, [onResizeEnd]);

  useEffect(
    () => () => {
      draggingRef.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    },
    []
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();

    draggingRef.current = true;
    lastPointRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    document.body.style.userSelect = 'none';
    document.body.style.cursor = cursor;

    // Use window-level listeners while dragging. This prevents the resize
    // from getting stuck when the pointer leaves the small resize handle.
    const handleMove = (moveEvent: PointerEvent) => {
      if (!draggingRef.current) return;

      moveEvent.preventDefault();

      const { deltaX, deltaY } = getDelta(moveEvent);

      if (deltaX !== 0 || deltaY !== 0) {
        onResize(deltaX, deltaY);
      }
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
      stop();
    };

    window.addEventListener('pointermove', handleMove, { passive: false });
    window.addEventListener('pointerup', handleUp, { once: true });
    window.addEventListener('pointercancel', handleUp, { once: true });

    onResizeStart?.();
  };

  const edgeStyles: React.CSSProperties = {
    position: 'absolute',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    touchAction: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    cursor,
  };

  if (position === 'right') {
    Object.assign(edgeStyles, { right: -5, top: 0, width: 12, height: '100%' });
  } else if (position === 'left') {
    Object.assign(edgeStyles, { left: -5, top: 0, width: 12, height: '100%' });
  } else if (position === 'bottom') {
    Object.assign(edgeStyles, { left: 0, bottom: -5, width: '100%', height: 12 });
  } else if (position === 'top') {
    Object.assign(edgeStyles, { left: 0, top: -5, width: '100%', height: 12 });
  } else if (position === 'bottom-right') {
    Object.assign(edgeStyles, { right: -7, bottom: -7, width: 24, height: 24 });
  } else if (position === 'bottom-left') {
    Object.assign(edgeStyles, { left: -7, bottom: -7, width: 24, height: 24 });
  } else if (position === 'top-right') {
    Object.assign(edgeStyles, { right: -7, top: -7, width: 24, height: 24 });
  } else {
    Object.assign(edgeStyles, { left: -7, top: -7, width: 24, height: 24 });
  }

  const isVertical = position === 'left' || position === 'right';
  const isHorizontal = position === 'top' || position === 'bottom';

  return (
    <Box
      onPointerDown={handlePointerDown}
      sx={{
        ...edgeStyles,
        '& .resize-indicator': {
          pointerEvents: 'none',
          opacity: 0.45,
          backgroundColor: alpha('#1976d2', 0.55),
          borderRadius: 2,
          transition: 'opacity 0.12s ease, transform 0.12s ease',
        },
        '&:hover .resize-indicator': {
          opacity: 1,
          transform: 'scale(1.15)',
        },
        ...(isVertical && {
          '& .resize-indicator': { width: 3, height: 36 },
        }),
        ...(isHorizontal && {
          '& .resize-indicator': { width: 36, height: 3 },
        }),
        ...(!isVertical &&
          !isHorizontal && {
            '& .resize-indicator': {
              width: 11,
              height: 11,
              borderRadius: 2,
            },
          }),
      }}
    >
      <Box className="resize-indicator" />
    </Box>
  );
};

// Stable divider between the user list and message panel.
const SplitResizeHandle = ({
  containerRef,
  leftPercent,
  onResize,
  onResizeStart,
  onResizeEnd,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  leftPercent: number;
  onResize: (clientX: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}) => {
  const draggingRef = useRef(false);
  const moveRef = useRef<(e: PointerEvent) => void>(() => {});
  const upRef = useRef<() => void>(() => {});

  useEffect(
    () => () => {
      draggingRef.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('pointermove', moveRef.current);
      window.removeEventListener('pointerup', upRef.current);
      window.removeEventListener('pointercancel', upRef.current);
    },
    []
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !containerRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';
    onResizeStart?.();

    const move = (event: PointerEvent) => {
      if (!draggingRef.current) return;
      event.preventDefault();
      onResize(event.clientX);
    };
    const up = () => {
      draggingRef.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      onResizeEnd?.();
    };
    moveRef.current = move;
    upRef.current = up;
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  return (
    <Box
      onPointerDown={handlePointerDown}
      sx={{
        position: 'absolute',
        left: `${leftPercent}%`,
        top: 0,
        bottom: 0,
        width: 18,
        transform: 'translateX(-50%)',
        zIndex: 100,
        cursor: 'ew-resize',
        touchAction: 'none',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{ width: 3, height: '100%', bgcolor: alpha('#1976d2', 0.25), pointerEvents: 'none' }}
      />
    </Box>
  );
};

// Message Bubble Component
const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        alignSelf: message.isSelf ? 'flex-end' : 'flex-start',
        maxWidth: '80%',
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 1,
          borderRadius: 1,
          fontSize: 13,
          lineHeight: 1.4,
          color: message.isSelf ? '#fff' : theme.palette.text.primary,
          bgcolor: message.isSelf ? theme.palette.primary.main : 'background.neutral',
          border: message.isSelf ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.3)}`,
          boxShadow: message.isSelf
            ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
            : `0 1px 4px ${alpha(theme.palette.common.black, 0.04)}`,
          wordBreak: 'break-word',
        }}
      >
        {message.text}
        <Box
          component="span"
          sx={{
            display: 'block',
            mt: 0.25,
            fontSize: 9,
            opacity: 0.7,
            textAlign: 'right',
            color: message.isSelf ? alpha('#fff', 0.8) : theme.palette.text.secondary,
          }}
        >
          {message.timestamp}
        </Box>
      </Box>
    </Box>
  );
};

// Main Social Chat Component
export const SocialChat = () => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Container position state
  const [containerPosition, setContainerPosition] = useState(() => ({
    top: typeof window !== 'undefined' ? Math.max(10, window.innerHeight - 600 - 20) : 100,
    left: typeof window !== 'undefined' ? Math.max(10, window.innerWidth - 420 - 20) : 100,
  }));

  // Container resize state
  const [containerSize, setContainerSize] = useState({
    width: 420,
    height: 600,
  });

  // Split resize state - start with wider user list
  const [splitWidth, setSplitWidth] = useState(45);

  const containerRef = useRef<HTMLDivElement>(null);

  // Update position on window resize
  useEffect(() => {
    const handleResize = () => {
      setContainerPosition((prev) => ({
        top: Math.min(prev.top, window.innerHeight - containerSize.height - 20),
        left: Math.min(prev.left, window.innerWidth - containerSize.width - 20),
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [containerSize]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSelectedUser(null);
  };

  const getFilteredUsers = useCallback(() => {
    let users = mockUsers;

    switch (activeTab) {
      case 0:
        users = users.filter((u) => u.isFollowed && u.isFollowing);
        break;
      case 1:
        users = users.filter((u) => u.isFollowed);
        break;
      case 2:
        users = users.filter((u) => u.isFollowing);
        break;
      default:
        break;
    }

    if (searchQuery) {
      users = users.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return users;
  }, [activeTab, searchQuery]);

  const filteredUsers = getFilteredUsers();
  const currentChat = selectedUser ? mockChats[selectedUser.id] : null;

  const sendMessage = () => {
    if (!messageDraft.trim() || !selectedUser) return;
    setMessageDraft('');
  };

  // Handle container drag
  const handleContainerDrag = useCallback(
    (deltaX: number, deltaY: number) => {
      setContainerPosition((prev) => ({
        top: Math.max(
          10,
          Math.min(window.innerHeight - containerSize.height - 10, prev.top + deltaY)
        ),
        left: Math.max(
          10,
          Math.min(window.innerWidth - containerSize.width - 10, prev.left + deltaX)
        ),
      }));
    },
    [containerSize.height, containerSize.width]
  );

  type ResizeParameters = {
    position:
      | 'bottom-right'
      | 'bottom-left'
      | 'top-right'
      | 'top-left'
      | 'right'
      | 'bottom'
      | 'left'
      | 'top';
  };

  // Handle container resize.
  //
  // ResizeHandle already converts pointer movement into a SIZE delta.
  // This function therefore only has to apply the delta and keep the
  // opposite edge anchored for left/top resizing.
  const handleContainerResize = useCallback(
    (deltaX: number, deltaY: number, position: ResizeParameters['position']) => {
      setContainerSize((prev) => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const minWidth = 320;
        const minHeight = 400;
        const maxWidth = Math.max(minWidth, Math.min(900, viewportWidth - 20));
        const maxHeight = Math.max(minHeight, Math.min(900, viewportHeight - 20));

        const width = Math.min(maxWidth, Math.max(minWidth, prev.width + deltaX));
        const height = Math.min(maxHeight, Math.max(minHeight, prev.height + deltaY));

        const appliedWidthDelta = width - prev.width;
        const appliedHeightDelta = height - prev.height;

        // Left/top edges move the popup while resizing so the opposite
        // edge remains anchored.
        if (position.includes('left') && appliedWidthDelta !== 0) {
          setContainerPosition((prevPosition) => ({
            ...prevPosition,
            left: prevPosition.left - appliedWidthDelta,
          }));
        }

        if (position.includes('top') && appliedHeightDelta !== 0) {
          setContainerPosition((prevPosition) => ({
            ...prevPosition,
            top: prevPosition.top - appliedHeightDelta,
          }));
        }

        // Keep the popup inside the viewport.
        setContainerPosition((prevPosition) => ({
          ...prevPosition,
          left: Math.max(10, Math.min(prevPosition.left, viewportWidth - width - 10)),
          top: Math.max(10, Math.min(prevPosition.top, viewportHeight - height - 10)),
        }));

        return { width, height };
      });
    },
    []
  );

  // Resize from the popup's actual left edge using the pointer's absolute X.
  const handleSplitResize = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const percent = ((clientX - rect.left) / rect.width) * 100;
    setSplitWidth(Math.min(70, Math.max(25, percent)));
  }, []);

  // Mouse down handler for dragging from the header.
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('.MuiTabs-root') ||
      target.closest('[data-no-drag="true"]')
    ) {
      return;
    }

    setIsDragging(true);
  };

  // Global mouse handlers for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleContainerDrag(e.movementX, e.movementY);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };

    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleContainerDrag]);

  return (
    <>
      {/* Social Chat Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <IconButton
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            width: 60,
            height: 60,
            bgcolor: theme.palette.primary.main,
            color: 'white',
            boxShadow: theme.shadows[8],
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
              transform: 'scale(1.05)',
              boxShadow: theme.shadows[12],
            },
            '& .MuiSvgIcon-root': {
              transition: 'transform 0.3s ease',
            },
            ...(isOpen && {
              bgcolor: theme.palette.error.main,
              '&:hover': {
                bgcolor: theme.palette.error.dark,
              },
              '& .MuiSvgIcon-root': {
                transform: 'rotate(90deg)',
              },
            }),
          }}
        >
          {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        </IconButton>
      </Box>

      {/* Chat Popup Container */}
      <Zoom in={isOpen} timeout={300}>
        <Paper
          ref={containerRef}
          elevation={24}
          sx={{
            position: 'fixed',
            top: containerPosition.top,
            left: containerPosition.left,
            width: containerSize.width,
            height: containerSize.height,
            minWidth: 320,
            minHeight: 400,
            boxSizing: 'border-box',
            maxHeight: typeof window !== 'undefined' ? window.innerHeight - 40 : '100vh',
            maxWidth: typeof window !== 'undefined' ? window.innerWidth - 40 : '100vw',
            borderRadius: 3,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: theme.shadows[24],
            transition: isDragging || isResizing ? 'none' : 'box-shadow 0.2s ease',
            cursor: isDragging ? 'grabbing' : 'default',
          }}
        >
          {/* Container Resize Handles */}
          <ResizeHandle
            onResize={(dx, dy) => handleContainerResize(dx, dy, 'bottom-right')}
            position="bottom-right"
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />
          <ResizeHandle
            onResize={(dx, dy) => handleContainerResize(dx, dy, 'bottom-left')}
            position="bottom-left"
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />
          <ResizeHandle
            onResize={(dx, dy) => handleContainerResize(dx, dy, 'top-right')}
            position="top-right"
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />
          <ResizeHandle
            onResize={(dx, dy) => handleContainerResize(dx, dy, 'top-left')}
            position="top-left"
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />
          <ResizeHandle
            onResize={(dx, dy) => handleContainerResize(dx, dy, 'right')}
            position="right"
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />
          <ResizeHandle
            onResize={(dx, dy) => handleContainerResize(dx, dy, 'left')}
            position="left"
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />
          <ResizeHandle
            onResize={(dx, dy) => handleContainerResize(dx, dy, 'bottom')}
            position="bottom"
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />
          <ResizeHandle
            onResize={(dx, dy) => handleContainerResize(dx, dy, 'top')}
            position="top"
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />

          {/* Header - Draggable */}
          <Box
            onMouseDown={handleHeaderMouseDown}
            sx={{
              cursor: isDragging ? 'grabbing' : 'grab',
              flexShrink: 0,
              position: 'relative',
              '&:hover': {
                '& .drag-indicator': {
                  opacity: 1,
                },
              },
            }}
          >
            {/* Drag indicator */}
            <Box
              className="drag-indicator"
              sx={{
                position: 'absolute',
                top: 4,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.text.secondary, 0.15),
                opacity: 0,
                transition: 'opacity 0.2s ease',
                zIndex: 5,
              }}
            />

            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.primary.main, 0.03),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Users size={20} color={theme.palette.primary.main} />
                  <Typography variant="h6" fontWeight={700}>
                    Social
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Drag to move">
                    <IconButton
                      size="small"
                      sx={{
                        color: theme.palette.text.secondary,
                        cursor: isDragging ? 'grabbing' : 'grab',
                      }}
                    >
                      <Move size={18} />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    size="small"
                    sx={{ color: theme.palette.text.secondary }}
                    onClick={() => setIsOpen(false)}
                  >
                    <X size={18} />
                  </IconButton>
                </Box>
              </Box>

              {/* Tabs */}
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  mt: 2,
                  minHeight: 36,
                  '& .MuiTab-root': {
                    minHeight: 36,
                    py: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: 'none',
                    color: theme.palette.text.secondary,
                    '&.Mui-selected': {
                      color: theme.palette.primary.main,
                    },
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                  },
                }}
              >
                <Tab
                  label={`Friends (${mockUsers.filter((u) => u.isFollowed && u.isFollowing).length})`}
                />
                <Tab label={`Followers (${mockUsers.filter((u) => u.isFollowed).length})`} />
                <Tab label={`Following (${mockUsers.filter((u) => u.isFollowing).length})`} />
              </Tabs>

              {/* Search */}
              <TextField
                size="small"
                placeholder="Search people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  mt: 1.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.common.black, 0.04),
                    '& fieldset': {
                      borderColor: 'transparent',
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.divider,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                  '& .MuiInputBase-input': {
                    fontSize: 13,
                    py: 0.5,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
            {/* Users List - Wider by default */}
            <Box
              sx={{
                width: selectedUser ? `${splitWidth}%` : '100%',
                borderRight: selectedUser ? `1px solid ${theme.palette.divider}` : 'none',
                overflowY: 'auto',
                transition: 'none',
                flexShrink: 0,
                minWidth: 0,
                '&::-webkit-scrollbar': {
                  width: 4,
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                  borderRadius: 4,
                },
              }}
            >
              <List sx={{ p: 0 }}>
                {filteredUsers.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No users found
                    </Typography>
                  </Box>
                ) : (
                  filteredUsers.map((user) => {
                    const chat = mockChats[user.id];
                    const isSelected = selectedUser?.id === user.id;

                    return (
                      <ListItemButton
                        key={user.id}
                        selected={isSelected}
                        onClick={() => setSelectedUser(user)}
                        sx={{
                          px: 2,
                          py: 1.5,
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                          '&.Mui-selected': {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.12),
                            },
                          },
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                          },
                        }}
                      >
                        <ListItemAvatar sx={{ minWidth: 44 }}>
                          <StyledBadge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            variant="dot"
                            invisible={user.status === 'offline'}
                            sx={{
                              '& .MuiBadge-badge': {
                                bgcolor: user.status === 'online' ? '#44b700' : '#ffb74d',
                                color: user.status === 'online' ? '#44b700' : '#ffb74d',
                              },
                            }}
                          >
                            <Avatar src={user.avatar} sx={{ width: 40, height: 40 }}>
                              {user.name.charAt(0)}
                            </Avatar>
                          </StyledBadge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" fontWeight={600} noWrap>
                                {user.name}
                              </Typography>
                              {chat?.unreadCount > 0 && (
                                <Chip
                                  label={chat.unreadCount}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    minWidth: 18,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    bgcolor: theme.palette.primary.main,
                                    color: 'white',
                                    '& .MuiChip-label': {
                                      px: 0.5,
                                    },
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {chat?.lastMessage?.text || 'No messages yet'}
                              </Typography>
                              {user.mutualFriends && (
                                <Chip
                                  label={`${user.mutualFriends} mutual`}
                                  size="small"
                                  sx={{
                                    height: 16,
                                    fontSize: 9,
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                    color: theme.palette.primary.main,
                                    '& .MuiChip-label': {
                                      px: 0.5,
                                    },
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondaryTypographyProps={{
                            component: 'div',
                            sx: { mt: 0.25 },
                          }}
                        />
                        {user.status === 'offline' && user.lastSeen && (
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>
                            {user.lastSeen}
                          </Typography>
                        )}
                      </ListItemButton>
                    );
                  })
                )}
              </List>
            </Box>

            {selectedUser && (
              <SplitResizeHandle
                containerRef={containerRef}
                leftPercent={splitWidth}
                onResize={handleSplitResize}
                onResizeStart={() => setIsResizing(true)}
                onResizeEnd={() => setIsResizing(false)}
              />
            )}

            {/* Chat View */}
            {selectedUser && (
              <Fade in={!!selectedUser} timeout={200}>
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    position: 'relative',
                  }}
                >
                  {/* Chat Header */}
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      flexShrink: 0,
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                    }}
                  >
                    <Avatar src={selectedUser.avatar} sx={{ width: 32, height: 32 }}>
                      {selectedUser.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {selectedUser.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedUser.status === 'online'
                          ? 'Online'
                          : selectedUser.status === 'away'
                            ? 'Away'
                            : 'Offline'}
                      </Typography>
                    </Box>
                    <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                      <MoreVertical size={18} />
                    </IconButton>
                  </Box>

                  {/* Messages */}
                  <Box
                    sx={{
                      flex: 1,
                      overflowY: 'auto',
                      px: 2,
                      py: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.25,
                      bgcolor: alpha(theme.palette.background.default, 0.3),
                      '&::-webkit-scrollbar': {
                        width: 4,
                      },
                      '&::-webkit-scrollbar-thumb': {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                        borderRadius: 4,
                      },
                    }}
                  >
                    {currentChat?.messages.map((msg) => (
                      <MessageBubble key={msg.id} message={msg} />
                    ))}
                  </Box>

                  {/* Message Input */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderTop: `1px solid ${theme.palette.divider}`,
                      display: 'flex',
                      gap: 1,
                      flexShrink: 0,
                      bgcolor: theme.palette.background.paper,
                    }}
                  >
                    <TextField
                      size="small"
                      fullWidth
                      placeholder={`Message ${selectedUser.name}...`}
                      value={messageDraft}
                      onChange={(e) => setMessageDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.common.black, 0.03),
                          '& fieldset': {
                            borderColor: 'transparent',
                          },
                          '&:hover fieldset': {
                            borderColor: theme.palette.divider,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                        '& .MuiInputBase-input': {
                          fontSize: 13,
                        },
                      }}
                    />
                    <IconButton
                      onClick={sendMessage}
                      disabled={!messageDraft.trim()}
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: theme.palette.primary.dark,
                        },
                        '&.Mui-disabled': {
                          bgcolor: alpha(theme.palette.common.black, 0.08),
                          color: theme.palette.text.disabled,
                        },
                      }}
                    >
                      <Send size={18} />
                    </IconButton>
                  </Box>
                </Box>
              </Fade>
            )}
          </Box>
        </Paper>
      </Zoom>
    </>
  );
};

export default SocialChat;

// SocialChat.tsx

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Send, Users, Search, ChevronLeft, MoreVertical, MessageCircle } from 'lucide-react';

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
  useTheme,
  TextField,
  IconButton,
  Typography,
  ListItemText,
  useMediaQuery,
  InputAdornment,
  ListItemAvatar,
  ListItemButton,
} from '@mui/material';

// Mock data
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
}

interface Chat {
  userId: string;
  messages: ChatMessage[];
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

const initialMockChats: Record<string, Chat> = {
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
    '0%': { transform: 'scale(.8)', opacity: 1 },
    '100%': { transform: 'scale(2.4)', opacity: 0 },
  },
}));

// Resize Handle Component
const ResizeHandle = ({
  onResize,
  position = 'bottom-right',
  onResizeStart,
  onResizeEnd,
}: {
  onResize: (deltaX: number, deltaY: number) => void;
  position?:
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
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      let deltaX = e.movementX;
      let deltaY = e.movementY;

      if (position === 'left' || position === 'top-left' || position === 'bottom-left') {
        deltaX = -e.movementX;
      }
      if (position === 'top' || position === 'top-left' || position === 'top-right') {
        deltaY = -e.movementY;
      }
      if (position === 'right' || position === 'left') {
        deltaY = 0;
      } else if (position === 'top' || position === 'bottom') {
        deltaX = 0;
      }

      if (deltaX !== 0 || deltaY !== 0) {
        onResize(deltaX, deltaY);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        if (onResizeEnd) onResizeEnd();
      }
    };

    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = getCursorStyle(position);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, onResize, position, onResizeEnd]);

  const getCursorStyle = (pos: string): string => {
    const cursorMap: Record<string, string> = {
      right: 'col-resize',
      left: 'col-resize',
      top: 'row-resize',
      bottom: 'row-resize',
      'bottom-right': 'nwse-resize',
      'bottom-left': 'nesw-resize',
      'top-right': 'nesw-resize',
      'top-left': 'nwse-resize',
    };
    return cursorMap[pos] || 'default';
  };

  const getPositionStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {
      position: 'absolute',
      zIndex: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    if (position === 'right') {
      styles.right = -4;
      styles.top = '50%';
      styles.transform = 'translateY(-50%)';
      styles.width = 8;
      styles.height = 40;
      styles.cursor = 'col-resize';
    } else if (position === 'left') {
      styles.left = -4;
      styles.top = '50%';
      styles.transform = 'translateY(-50%)';
      styles.width = 8;
      styles.height = 40;
      styles.cursor = 'col-resize';
    } else if (position === 'bottom') {
      styles.bottom = -4;
      styles.left = '50%';
      styles.transform = 'translateX(-50%)';
      styles.width = 40;
      styles.height = 8;
      styles.cursor = 'row-resize';
    } else if (position === 'top') {
      styles.top = -4;
      styles.left = '50%';
      styles.transform = 'translateX(-50%)';
      styles.width = 40;
      styles.height = 8;
      styles.cursor = 'row-resize';
    } else {
      styles.width = 14;
      styles.height = 14;
      styles.cursor = getCursorStyle(position);

      if (position === 'bottom-right') {
        styles.right = -6;
        styles.bottom = -6;
      } else if (position === 'bottom-left') {
        styles.left = -6;
        styles.bottom = -6;
      } else if (position === 'top-right') {
        styles.right = -6;
        styles.top = -6;
      } else if (position === 'top-left') {
        styles.left = -6;
        styles.top = -6;
      }
    }

    return styles;
  };

  return (
    <Box
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        if (onResizeStart) onResizeStart();
      }}
      sx={{
        ...getPositionStyles(),
        '&:hover .resize-indicator': {
          backgroundColor: alpha('#1976d2', 0.6),
          transform: 'scale(1.2)',
        },
        '& .resize-indicator': {
          transition: 'all 0.15s ease',
          backgroundColor: alpha('#1976d2', 0.3),
          borderRadius: 2,
          ...(position === 'right' || position === 'left'
            ? { width: 3, height: 30 }
            : position === 'top' || position === 'bottom'
              ? { height: 3, width: 30 }
              : { width: 6, height: 6, borderRadius: '50%' }),
        },
        ...(isDragging && {
          '& .resize-indicator': {
            backgroundColor: alpha('#1976d2', 0.8),
            transform: 'scale(1.3)',
          },
        }),
      }}
    >
      <Box className="resize-indicator" />
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const [isResizing, setIsResizing] = useState(false);

  const [chats, setChats] = useState<Record<string, Chat>>(initialMockChats);
  const [containerSize, setContainerSize] = useState({ width: 420, height: 600 });
  const [splitWidth, setSplitWidth] = useState(180);

  const containerRef = useRef<HTMLDivElement>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Checks if the left sidebar is narrow enough to push usernames below avatars
  const isNarrowList = selectedUser && splitWidth < 170;

  useEffect(() => {
    if (isMobile) {
      setContainerSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, [isMobile]);

  useEffect(() => {
    if (selectedUser) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedUser, chats]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSelectedUser(null);
  };

  const handleSelectUser = (user: UserType) => {
    setSelectedUser(user);
    if (chats[user.id]?.unreadCount > 0) {
      setChats((prev) => ({
        ...prev,
        [user.id]: {
          ...prev[user.id],
          unreadCount: 0,
        },
      }));
    }
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
  const currentChat = selectedUser ? chats[selectedUser.id] : null;

  const sendMessage = () => {
    if (!messageDraft.trim() || !selectedUser) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: 'current',
      text: messageDraft.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
    };

    setChats((prev) => {
      const existingChat = prev[selectedUser.id] || {
        userId: selectedUser.id,
        messages: [],
        unreadCount: 0,
      };

      return {
        ...prev,
        [selectedUser.id]: {
          ...existingChat,
          messages: [...existingChat.messages, newMessage],
        },
      };
    });

    setMessageDraft('');
  };

  const handleContainerResize = (deltaX: number, deltaY: number) => {
    setContainerSize((prev) => {
      let newWidth = prev.width + deltaX;
      let newHeight = prev.height + deltaY;

      newWidth = Math.min(Math.max(320, newWidth), window.innerWidth - 32);
      newHeight = Math.min(Math.max(400, newHeight), window.innerHeight - 120);

      if (deltaX !== 0) {
        const maxSplitWidth = newWidth - 140;
        const minSplitWidth = 90;
        setSplitWidth((prevSplit) => Math.min(Math.max(minSplitWidth, prevSplit), maxSplitWidth));
      }

      return { width: newWidth, height: newHeight };
    });
  };

  const handleSplitResize = (deltaX: number) => {
    setSplitWidth((prevSplit) => {
      const maxSplitWidth = containerSize.width - 140;
      const minSplitWidth = 90;
      return Math.min(Math.max(minSplitWidth, prevSplit + deltaX), maxSplitWidth);
    });
  };

  return (
    <>
      {/* Social Chat Launcher Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          display: isOpen ? 'none' : 'flex',
        }}
      >
        <IconButton
          onClick={() => setIsOpen(true)}
          aria-label="Open social chat"
          sx={{
            width: 60,
            height: 60,
            bgcolor: theme.palette.primary.main,
            color: 'white',
            boxShadow: theme.shadows[8],
            transition: 'all 0.25s ease',
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
              transform: 'scale(1.05)',
              boxShadow: theme.shadows[12],
            },
          }}
        >
          <MessageCircle size={28} />
        </IconButton>
      </Box>

      {/* Main Social Panel */}
      <Zoom in={isOpen} timeout={300} unmountOnExit>
        <Paper
          ref={containerRef}
          elevation={24}
          sx={{
            position: 'fixed',
            ...(isMobile
              ? {
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  width: '100vw',
                  height: '100dvh',
                  borderRadius: 0,
                  border: 'none',
                  boxShadow: 'none',
                }
              : {
                  bottom: 100,
                  right: 24,
                  left: 'auto',
                  width: containerSize.width,
                  height: containerSize.height,
                  maxHeight: 'calc(100vh - 120px)',
                  maxWidth: 'calc(100vw - 48px)',
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  boxShadow: theme.shadows[24],
                }),
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: theme.palette.background.paper,
            transition: isResizing ? 'none' : 'box-shadow 0.2s ease',
          }}
        >
          {!isMobile && (
            <>
              <ResizeHandle
                onResize={handleContainerResize}
                position="bottom-left"
                onResizeStart={() => setIsResizing(true)}
                onResizeEnd={() => setIsResizing(false)}
              />
              <ResizeHandle
                onResize={handleContainerResize}
                position="top-right"
                onResizeStart={() => setIsResizing(true)}
                onResizeEnd={() => setIsResizing(false)}
              />
              <ResizeHandle
                onResize={handleContainerResize}
                position="top-left"
                onResizeStart={() => setIsResizing(true)}
                onResizeEnd={() => setIsResizing(false)}
              />
              <ResizeHandle
                onResize={handleContainerResize}
                position="left"
                onResizeStart={() => setIsResizing(true)}
                onResizeEnd={() => setIsResizing(false)}
              />
              <ResizeHandle
                onResize={handleContainerResize}
                position="top"
                onResizeStart={() => setIsResizing(true)}
                onResizeEnd={() => setIsResizing(false)}
              />
            </>
          )}

          {/* Header */}
          <Box sx={{ flexShrink: 0, position: 'relative' }}>
            <Box
              sx={{
                px: 2.5,
                pt: 2,
                pb: 1.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.primary.main, 0.03),
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Users size={20} color={theme.palette.primary.main} />
                  <Typography variant="h6" fontWeight={700}>
                    Social
                  </Typography>
                </Box>
              </Box>

              {/* Navigation Tabs with Right-Aligned Mobile Close Button */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant={isMobile ? 'scrollable' : 'standard'}
                  scrollButtons={isMobile ? 'auto' : false}
                  sx={{
                    flex: 1,
                    minHeight: 36,
                    '& .MuiTab-root': {
                      minHeight: 36,
                      py: 0,
                      px: 1.5,
                      fontSize: 13,
                      fontWeight: 600,
                      textTransform: 'none',
                      color: theme.palette.text.secondary,
                      '&.Mui-selected': { color: theme.palette.primary.main },
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

                {/* Cross/Close Button (Right side after tabs) */}
                <IconButton
                  size="small"
                  aria-label="Close social chat"
                  sx={{
                    color: theme.palette.text.secondary,
                    flexShrink: 0,
                    bgcolor: alpha(theme.palette.action.active, 0.05),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.action.active, 0.1),
                    },
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  <X size={18} />
                </IconButton>
              </Box>

              {/* Search Field */}
              <TextField
                size="small"
                placeholder="Search people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  mt: 1.5,
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.common.black, 0.04),
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: theme.palette.divider },
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                  },
                  '& .MuiInputBase-input': { fontSize: 13, py: 0.5 },
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

          {/* Main Body Area */}
          <Box sx={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
            {/* User List Sidebar */}
            {(!isMobile || !selectedUser) && (
              <Box
                sx={{
                  width: selectedUser ? `${splitWidth}px` : '100%',
                  borderRight: selectedUser ? `1px solid ${theme.palette.divider}` : 'none',
                  overflowY: 'auto',
                  flexShrink: 0,
                  minWidth: 0,
                  boxSizing: 'border-box',
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
                      const chat = chats[user.id];
                      const lastMsg = chat?.messages[chat.messages.length - 1];
                      const isSelected = selectedUser?.id === user.id;

                      return (
                        <ListItemButton
                          key={user.id}
                          selected={isSelected}
                          onClick={() => handleSelectUser(user)}
                          sx={{
                            px: isNarrowList ? 1 : 2,
                            py: 1.5,
                            display: 'flex',
                            flexDirection: isNarrowList ? 'column' : 'row',
                            alignItems: isNarrowList ? 'center' : 'flex-start',
                            justifyContent: isNarrowList ? 'center' : 'flex-start',
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                            '&.Mui-selected': {
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                              },
                            },
                          }}
                        >
                          <ListItemAvatar
                            sx={{
                              minWidth: isNarrowList ? 'auto' : 44,
                              mb: isNarrowList ? 0.75 : 0,
                            }}
                          >
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
                              <Avatar src={user.avatar} sx={{ width: 38, height: 38 }}>
                                {user.name.charAt(0)}
                              </Avatar>
                            </StyledBadge>
                          </ListItemAvatar>

                          <ListItemText
                            sx={{
                              minWidth: 0,
                              m: 0,
                              width: isNarrowList ? '100%' : 'auto',
                              textAlign: isNarrowList ? 'center' : 'left',
                            }}
                            primary={
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: isNarrowList ? 'column' : 'row',
                                  alignItems: 'center',
                                  justifyContent: isNarrowList ? 'center' : 'space-between',
                                  gap: 0.5,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  noWrap
                                  sx={{
                                    maxWidth: '100%',
                                    fontSize: isNarrowList ? 11 : 13,
                                  }}
                                >
                                  {user.name}
                                </Typography>
                                {chat?.unreadCount > 0 && (
                                  <Chip
                                    label={chat.unreadCount}
                                    size="small"
                                    sx={{
                                      height: 16,
                                      minWidth: 16,
                                      fontSize: 9,
                                      fontWeight: 700,
                                      bgcolor: theme.palette.primary.main,
                                      color: 'white',
                                      '& .MuiChip-label': { px: 0.5 },
                                    }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              !isNarrowList ? (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  noWrap
                                  display="block"
                                >
                                  {lastMsg?.text || 'No messages yet'}
                                </Typography>
                              ) : undefined
                            }
                          />
                        </ListItemButton>
                      );
                    })
                  )}
                </List>
              </Box>
            )}

            {/* Middle Drag Resizer */}
            {selectedUser && !isMobile && (
              <Box
                sx={{
                  position: 'absolute',
                  left: `${splitWidth}px`,
                  top: 0,
                  bottom: 0,
                  width: 0,
                  zIndex: 15,
                }}
              >
                <ResizeHandle
                  onResize={(dX) => handleSplitResize(dX)}
                  position="right"
                  onResizeStart={() => setIsResizing(true)}
                  onResizeEnd={() => setIsResizing(false)}
                />
              </Box>
            )}

            {/* Message / Chat Pane */}
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
                  {/* Active Chat Bar Header */}
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
                    {isMobile && (
                      <IconButton
                        size="small"
                        onClick={() => setSelectedUser(null)}
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        <ChevronLeft size={20} />
                      </IconButton>
                    )}
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

                  {/* Messages Feed */}
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
                    }}
                  >
                    {currentChat?.messages.map((msg) => (
                      <MessageBubble key={msg.id} message={msg} />
                    ))}
                    <div ref={chatMessagesEndRef} />
                  </Box>

                  {/* Input Box */}
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
                          '& fieldset': { borderColor: 'transparent' },
                          '&:hover fieldset': { borderColor: theme.palette.divider },
                          '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                        },
                        '& .MuiInputBase-input': { fontSize: 13 },
                      }}
                    />
                    <IconButton
                      onClick={sendMessage}
                      disabled={!messageDraft.trim()}
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        borderRadius: 2,
                        '&:hover': { bgcolor: theme.palette.primary.dark },
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

import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { useMediaQuery, useTheme } from '@mui/material';
import { RoomEvent } from 'livekit-client';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { filterVisibleMessages } from '@/_mock/_messages';
import { useCredentials, useRoomTools } from '@/core/slices';
import { useBoolean, UseBooleanReturn } from '@/hooks/use-boolean';
import { ChatMessage } from '@/types/type-room';

interface UnreadSender {
  name: string;
  avatarUrl?: string;
}

interface RoomChatContextValue {
  messages: ChatMessage[];
  visibleMessages: ChatMessage[];
  currentUserId: string;
  messageCount: number;
  unreadCount: number;
  isUnreadMessage: boolean;
  latestUnreadSender: UnreadSender | null;
  isChatVisible: boolean;
  chatOpen: boolean;
  setChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chatCollapsedBoolean: UseBooleanReturn;
  onToggleChat: () => void;
  setIsAtBottom: (atBottom: boolean) => void;
  markAllAsRead: () => void;
  handleSendMessage: (
    text: string,
    replyToId?: string,
    privateTo?: { id: string; name: string },
    imageUrl?: string
  ) => Promise<void>;
  handleEditMessage: (id: string, text: string) => Promise<void>;
  handleReactMessage: (id: string, emoji: string) => Promise<void>;
}

const RoomChatContext = createContext<RoomChatContextValue | undefined>(undefined);

export const RoomChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { user } = useCredentials();
  const { room: joinRoom } = useRoomTools();
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();

  const currentUserId = user?.userId ?? '';

  // 1. Messages State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      authorId: 'system',
      authorName: 'System',
      text: joinRoom?.welcome_message || 'Welcome to the chat room!',
      timestamp: '10:00 AM',
      isSystem: true,
      systemType: 'info',
    },
  ]);

  // 2. Open (Mobile Drawer) & Collapsed (Desktop Sidebar) State
  const [chatOpen, setChatOpen] = useState(false);
  const chatCollapsedBoolean = useBoolean(false);

  // Whether the user is actively viewing the chat panel right now
  const isChatVisible = isMobile ? chatOpen : !chatCollapsedBoolean.value;
  const isChatVisibleRef = useRef<boolean>(isChatVisible);
  isChatVisibleRef.current = isChatVisible;

  // 3. Unread Badge & Scroll State
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [latestUnreadSender, setLatestUnreadSender] = useState<UnreadSender | null>(null);
  const isAtBottomRef = useRef<boolean>(true);
  const prevVisibleCountRef = useRef<number>(1); // Starts at 1 for welcome message

  const visibleMessages = useMemo(
    () => filterVisibleMessages(messages, currentUserId),
    [messages, currentUserId]
  );

  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
    setLatestUnreadSender(null);
  }, []);

  // When user opens the mobile drawer or expands the desktop chat panel, clear unread count
  useEffect(() => {
    if (isChatVisible && isAtBottomRef.current) {
      markAllAsRead();
    }
  }, [isChatVisible, markAllAsRead]);

  // Only allow active/visible chat panel to mark as read when scrolling to bottom
  const setIsAtBottom = useCallback(
    (atBottom: boolean) => {
      if (!isChatVisibleRef.current) return; // Ignore hidden keepMounted drawer!
      isAtBottomRef.current = atBottom;
      if (atBottom) {
        markAllAsRead();
      }
    },
    [markAllAsRead]
  );

  // Toggle Chat (Mobile vs Desktop)
  const onToggleChat = useCallback(() => {
    if (isMobile) {
      setChatOpen((prev) => {
        const nextOpen = !prev;
        if (nextOpen) markAllAsRead();
        return nextOpen;
      });
    } else {
      const willBeExpanded = chatCollapsedBoolean.value; // currently collapsed -> will open
      chatCollapsedBoolean.onToggle();
      if (willBeExpanded) {
        markAllAsRead();
      }
    }
  }, [isMobile, chatCollapsedBoolean, markAllAsRead]);

  // Watch `visibleMessages` length: any new message when chat is NOT viewed increments unreadCount
  useEffect(() => {
    const currentCount = visibleMessages.length;
    const diff = currentCount - prevVisibleCountRef.current;
    prevVisibleCountRef.current = currentCount;

    if (diff <= 0) return;

    const lastMessage = visibleMessages[currentCount - 1];
    if (!lastMessage) return;

    const isOwnMessage =
      Boolean(lastMessage.isSelf) ||
      (Boolean(currentUserId) && String(lastMessage.authorId) === String(currentUserId)) ||
      (Boolean(localParticipant?.identity) &&
        String(lastMessage.authorId) === String(localParticipant?.identity));

    if (isOwnMessage) {
      markAllAsRead();
      return;
    }

    // If user is NOT viewing the chat panel OR is scrolled up inside the chat panel -> count as unread
    if (!isChatVisibleRef.current || !isAtBottomRef.current) {
      setUnreadCount((prev) => prev + diff);
      setLatestUnreadSender({
        name: lastMessage.authorName || 'Someone',
        avatarUrl: lastMessage.avatarUrl,
      });
    }
  }, [visibleMessages, currentUserId, localParticipant, markAllAsRead]);

  // 4. Send Message
  const handleSendMessage = useCallback(
    async (
      text: string,
      replyToId?: string,
      privateTo?: { id: string; name: string },
      imageUrl?: string
    ) => {
      if ((!text.trim() && !imageUrl) || !localParticipant) return;

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        authorId: localParticipant.identity,
        authorName: localParticipant.name || localParticipant.identity,
        avatarUrl: user?.profilePhoto,
        text,
        imageUrl,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        replyToId,
        isSelf: true,
        privateTo,
        reactions: [],
      };

      setMessages((prev) => [...prev, newMsg]);
      markAllAsRead();

      const payload = JSON.stringify({
        type: 'CHAT_MESSAGE',
        message: { ...newMsg, isSelf: false },
      });

      const publishOptions: {
        reliable: boolean;
        topic: string;
        destinationIdentities?: string[];
      } = {
        reliable: true,
        topic: 'room_chat',
      };

      if (privateTo?.id) {
        publishOptions.destinationIdentities = [privateTo.id];
      }

      await localParticipant.publishData(new TextEncoder().encode(payload), publishOptions);
    },
    [user, localParticipant, markAllAsRead]
  );

  // 5. Edit Message
  const handleEditMessage = useCallback(
    async (id: string, text: string) => {
      if (!localParticipant) return;

      const editedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text, editedAt } : m)));

      const payload = JSON.stringify({
        type: 'CHAT_EDIT',
        messageId: id,
        text,
        editedAt,
      });

      await localParticipant.publishData(new TextEncoder().encode(payload), {
        reliable: true,
        topic: 'room_chat',
      });
    },
    [localParticipant]
  );

  // 6. React Message
  const handleReactMessage = useCallback(
    async (id: string, emoji: string) => {
      if (!localParticipant) return;
      const myId = localParticipant.identity;

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;

          let nextReactions = (m.reactions ?? [])
            .map((r) => {
              if (r.emoji === emoji) return r;
              const filteredIds = (r.userIds ?? []).filter((uid) => uid !== myId);
              return {
                ...r,
                userIds: filteredIds,
                count: filteredIds.length,
                reactedBySelf: false,
              };
            })
            .filter((r) => r.count > 0);

          const targetIndex = nextReactions.findIndex((r) => r.emoji === emoji);

          if (targetIndex >= 0) {
            const target = nextReactions[targetIndex];
            const alreadyReacted = (target.userIds ?? []).includes(myId);

            if (alreadyReacted) {
              const updatedIds = (target.userIds ?? []).filter((uid) => uid !== myId);
              if (updatedIds.length === 0) {
                nextReactions.splice(targetIndex, 1);
              } else {
                nextReactions[targetIndex] = {
                  ...target,
                  userIds: updatedIds,
                  count: updatedIds.length,
                  reactedBySelf: false,
                };
              }
            } else {
              const updatedIds = [...(target.userIds ?? []), myId];
              nextReactions[targetIndex] = {
                ...target,
                userIds: updatedIds,
                count: updatedIds.length,
                reactedBySelf: true,
              };
            }
          } else {
            nextReactions.push({
              emoji,
              count: 1,
              userIds: [myId],
              reactedBySelf: true,
            });
          }

          return { ...m, reactions: nextReactions };
        })
      );

      const payload = JSON.stringify({
        type: 'CHAT_REACTION',
        messageId: id,
        emoji,
        userId: myId,
      });

      await localParticipant.publishData(new TextEncoder().encode(payload), {
        reliable: true,
        topic: 'room_chat',
      });
    },
    [localParticipant]
  );

  // 7. LiveKit Data Channel Listener
  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload: Uint8Array) => {
      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text);

        if (data.type === 'CHAT_MESSAGE') {
          const incomingMsg: ChatMessage = data.message;
          if (!incomingMsg?.id) return;

          setMessages((prev) =>
            prev.some((m) => m.id === incomingMsg.id) ? prev : [...prev, incomingMsg]
          );
        }

        if (data.type === 'CHAT_EDIT') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === data.messageId ? { ...m, text: data.text, editedAt: data.editedAt } : m
            )
          );
        }

        if (data.type === 'CHAT_REACTION') {
          const { messageId, emoji, userId } = data;
          if (!messageId || !emoji || !userId) return;

          const isSelf = userId === localParticipant?.identity;

          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== messageId) return m;

              let nextReactions = (m.reactions ?? [])
                .map((r) => {
                  if (r.emoji === emoji) return r;
                  const filteredIds = (r.userIds ?? []).filter((uid) => uid !== userId);
                  return {
                    ...r,
                    userIds: filteredIds,
                    count: filteredIds.length,
                    reactedBySelf: isSelf ? false : r.reactedBySelf,
                  };
                })
                .filter((r) => r.count > 0);

              const targetIndex = nextReactions.findIndex((r) => r.emoji === emoji);

              if (targetIndex >= 0) {
                const target = nextReactions[targetIndex];
                const alreadyReacted = (target.userIds ?? []).includes(userId);

                if (alreadyReacted) {
                  const updatedIds = (target.userIds ?? []).filter((uid) => uid !== userId);
                  if (updatedIds.length === 0) {
                    nextReactions.splice(targetIndex, 1);
                  } else {
                    nextReactions[targetIndex] = {
                      ...target,
                      userIds: updatedIds,
                      count: updatedIds.length,
                      reactedBySelf: isSelf ? false : target.reactedBySelf,
                    };
                  }
                } else {
                  const updatedIds = [...(target.userIds ?? []), userId];
                  nextReactions[targetIndex] = {
                    ...target,
                    userIds: updatedIds,
                    count: updatedIds.length,
                    reactedBySelf: isSelf ? true : target.reactedBySelf,
                  };
                }
              } else {
                nextReactions.push({
                  emoji,
                  count: 1,
                  userIds: [userId],
                  reactedBySelf: isSelf,
                });
              }

              return { ...m, reactions: nextReactions };
            })
          );
        }
      } catch (err) {
        console.error('Failed to parse incoming chat data packet:', err);
      }
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, localParticipant]);

  const value = useMemo(
    () => ({
      messages,
      visibleMessages,
      currentUserId,
      messageCount: visibleMessages.length,
      unreadCount,
      isUnreadMessage: unreadCount > 0,
      latestUnreadSender,
      isChatVisible,
      chatOpen,
      setChatOpen,
      chatCollapsedBoolean,
      onToggleChat,
      setIsAtBottom,
      markAllAsRead,
      handleSendMessage,
      handleEditMessage,
      handleReactMessage,
    }),
    [
      messages,
      visibleMessages,
      currentUserId,
      unreadCount,
      latestUnreadSender,
      isChatVisible,
      chatOpen,
      chatCollapsedBoolean,
      onToggleChat,
      setIsAtBottom,
      markAllAsRead,
      handleSendMessage,
      handleEditMessage,
      handleReactMessage,
    ]
  );

  return <RoomChatContext.Provider value={value}>{children}</RoomChatContext.Provider>;
};

export const useRoomChat = (): RoomChatContextValue => {
  const context = useContext(RoomChatContext);
  if (!context) {
    throw new Error('useRoomChat must be used within a RoomChatProvider');
  }
  return context;
};

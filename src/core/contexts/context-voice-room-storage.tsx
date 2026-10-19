// src/core/contexts/context-room-storage.tsx

import { filterVisibleMessages } from '@/_mock/_messages';
import { useLiveKitSession } from '@/core/contexts/context-livekit';
import { useCredentials, useRoomTools } from '@/core/slices';
import { ChatMessage, RoomType } from '@/types/type-room';
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

interface UnreadSender {
  name: string;
  avatarUrl?: string;
}

interface RoomStorageContextValue {
  selectedRoom: RoomType | null;
  setSelectedRoom: React.Dispatch<React.SetStateAction<RoomType | null>>;
  livekitToken: string | null;
  setLivekitToken: React.Dispatch<React.SetStateAction<string | null>>;

  messages: ChatMessage[];
  visibleMessages: ChatMessage[];
  messageCount: number;
  unreadCount: number;
  isUnreadMessage: boolean;
  latestUnreadSender: UnreadSender | null;

  markAllAsRead: () => void;
  updateChatViewport: (isVisible: boolean, isAtBottom: boolean) => void;

  handleSendMessage: (
    text: string,
    replyToId?: string,
    privateTo?: { id: string; name: string },
    imageUrl?: string
  ) => Promise<void>;
  handleEditMessage: (id: string, text: string) => Promise<void>;
  handleReactMessage: (id: string, emoji: string) => Promise<void>;
  handleCleanup: () => void;
}

const RoomStorageContext = createContext<RoomStorageContextValue | undefined>(undefined);

export const VoiceRoomStorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useCredentials();
  const { room: globalRoom } = useRoomTools();
  const { room: livekitRoom } = useLiveKitSession(); // No longer requires <LiveKitRoom> wrapper!

  const currentUserId = user?.userId ?? '';
  const localParticipant = livekitRoom?.localParticipant;

  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [livekitToken, setLivekitToken] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      authorId: 'system',
      authorName: 'System',
      text: globalRoom?.welcome_message || 'Welcome to the chat room!',
      timestamp: '10:00 AM',
      isSystem: true,
      systemType: 'info',
    },
  ]);

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [latestUnreadSender, setLatestUnreadSender] = useState<UnreadSender | null>(null);

  const isChatVisibleRef = useRef<boolean>(false);
  const isAtBottomRef = useRef<boolean>(true);
  const prevVisibleCountRef = useRef<number>(1);

  const visibleMessages = useMemo(
    () => filterVisibleMessages(messages, currentUserId),
    [messages, currentUserId]
  );

  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
    setLatestUnreadSender(null);
  }, []);

  const updateChatViewport = useCallback(
    (isVisible: boolean, isAtBottom: boolean) => {
      isChatVisibleRef.current = isVisible;
      isAtBottomRef.current = isAtBottom;
      if (isVisible && isAtBottom) markAllAsRead();
    },
    [markAllAsRead]
  );

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

    if (!isChatVisibleRef.current || !isAtBottomRef.current) {
      setUnreadCount((prev) => prev + diff);
      setLatestUnreadSender({
        name: lastMessage.authorName || 'Someone',
        avatarUrl: lastMessage.avatarUrl,
      });
    }
  }, [visibleMessages, currentUserId, localParticipant, markAllAsRead]);

  const handleSendMessage = useCallback(
    async (text: string, replyToId?: string, privateTo?: any, imageUrl?: string) => {
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
      const publishOptions: any = { reliable: true, topic: 'room_chat' };
      if (privateTo?.id) publishOptions.destinationIdentities = [privateTo.id];

      await localParticipant.publishData(new TextEncoder().encode(payload), publishOptions);
    },
    [user, localParticipant, markAllAsRead]
  );

  const handleEditMessage = useCallback(
    async (id: string, text: string) => {
      if (!localParticipant) return;
      const editedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text, editedAt } : m)));

      const payload = JSON.stringify({ type: 'CHAT_EDIT', messageId: id, text, editedAt });
      await localParticipant.publishData(new TextEncoder().encode(payload), {
        reliable: true,
        topic: 'room_chat',
      });
    },
    [localParticipant]
  );

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
              if (updatedIds.length === 0) nextReactions.splice(targetIndex, 1);
              else
                nextReactions[targetIndex] = {
                  ...target,
                  userIds: updatedIds,
                  count: updatedIds.length,
                  reactedBySelf: false,
                };
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
            nextReactions.push({ emoji, count: 1, userIds: [myId], reactedBySelf: true });
          }
          return { ...m, reactions: nextReactions };
        })
      );

      const payload = JSON.stringify({ type: 'CHAT_REACTION', messageId: id, emoji, userId: myId });
      await localParticipant.publishData(new TextEncoder().encode(payload), {
        reliable: true,
        topic: 'room_chat',
      });
    },
    [localParticipant]
  );

  useEffect(() => {
    if (!livekitRoom) return;
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


    livekitRoom.on(RoomEvent.DataReceived, handleDataReceived);
    return () => {
      livekitRoom.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [livekitRoom, localParticipant]);

  const handleCleanup = useCallback(() => {
    setMessages([]);
    setSelectedRoom(null);
    setLivekitToken(null);
    setUnreadCount(0);
  }, []);

  const value = useMemo(
    () => ({
      selectedRoom,
      setSelectedRoom,
      livekitToken,
      setLivekitToken,
      messages,
      visibleMessages,
      messageCount: visibleMessages.length,
      unreadCount,
      isUnreadMessage: unreadCount > 0,
      latestUnreadSender,
      markAllAsRead,
      updateChatViewport,
      handleSendMessage,
      handleEditMessage,
      handleReactMessage,
      handleCleanup,
    }),
    [
      selectedRoom,
      livekitToken,
      messages,
      visibleMessages,
      unreadCount,
      latestUnreadSender,
      markAllAsRead,
      updateChatViewport,
      handleSendMessage,
      handleEditMessage,
      handleReactMessage,
      handleCleanup,
    ]
  );

  return <RoomStorageContext.Provider value={value}>{children}</RoomStorageContext.Provider>;
};

export const useVoiceRoomStorage = () => {
  const context = useContext(RoomStorageContext);
  if (!context) throw new Error('useVoiceRoomStorage must be used within a VoiceRoomStorageProvider');
  return context;
};

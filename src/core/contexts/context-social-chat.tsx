// src/core/contexts/context-social-chat.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';

import {
  useGetHistoryQuery,
  useGetUnreadMessagesQuery,
  useReadMessagesMutation,
  useSaveMessageMutation,
  useToggleReactionMutation,
  useUpdateMessageMutation,
} from '@/core/apis';
import { useSocket } from '@/core/contexts/context-socket';
import type {
  AllRelationsType,
  SocialChatMessage,
  SocialChatReaction,
  SocialChatTabKey,
} from '@/types/type-social';
import { updateLatestMessage, useCredentials } from '../slices';

interface SocialChatContextValue {
  isChatPanelVisible: boolean;
  setIsChatPanelVisible: React.Dispatch<React.SetStateAction<boolean>>;

  tab: SocialChatTabKey;
  setTab: React.Dispatch<React.SetStateAction<SocialChatTabKey>>;
  activeFriend: AllRelationsType | null;
  openChat: (friend: AllRelationsType) => void;
  closeActiveChat: () => void;

  messages: SocialChatMessage[];
  messageMap: Record<string, SocialChatMessage>;
  fetchingHistory: boolean;
  replyingTo: SocialChatMessage | null;
  setReplyingTo: React.Dispatch<React.SetStateAction<SocialChatMessage | null>>;

  // Unread & Online Metrics
  unreadCounts: Record<string, number>;
  unreadFriendsCount: number;
  totalUnreadMessages: number;
  hasUnreadMessages: boolean;
  activeChatUnreadCount: number;
  onlineStatusMap: Record<string, boolean>; // { [userId]: isOnline }
  isFriendUnread: (friendUserId: string) => boolean;
  getFriendUnreadCount: (friendUserId: string) => number;
  setIsAtBottom: (atBottom: boolean) => void;
  markFriendAsRead: (friendUserId: string, forceApi?: boolean) => void;
  refetchUnread: () => void;

  // Actions
  sendMessage: (text: string) => Promise<void>;
  editMessage: (id: string, text: string) => void;
  reactMessage: (id: string, emoji: string) => void;
}

const SocialChatContext = createContext<SocialChatContextValue | undefined>(undefined);

export const SocialChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useCredentials();
  const dispatch = useDispatch();

  const currentUserId = user?.userId || '';
  const currentUserName = user?.name || user?.username || 'You';

  const [isChatPanelVisible, setIsChatPanelVisible] = useState<boolean>(false);
  const [tab, setTab] = useState<SocialChatTabKey>('friends');
  const [activeFriend, setActiveFriend] = useState<AllRelationsType | null>(null);
  const [messages, setMessages] = useState<SocialChatMessage[]>([]);
  const [replyingTo, setReplyingTo] = useState<SocialChatMessage | null>(null);

  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [activeChatUnreadCount, setActiveChatUnreadCount] = useState<number>(0);
  const [onlineStatusMap, setOnlineStatusMap] = useState<Record<string, boolean>>({});

  const unreadCountsRef = useRef<Record<string, number>>({});
  unreadCountsRef.current = unreadCounts;

  const isAtBottomRef = useRef<boolean>(true);
  const isPanelVisibleRef = useRef<boolean>(isChatPanelVisible);
  isPanelVisibleRef.current = isChatPanelVisible;
  const readFriendIdsRef = useRef<Set<string>>(new Set());

  const friendId = activeFriend?.accountDetails?.userId || '';

  // 1. Fetch initial unread summary from backend API
  const { data: unreadResponse, refetch: refetchUnread } = useGetUnreadMessagesQuery(undefined, {
    skip: !currentUserId,
    refetchOnMountOrArgChange: true,
  });

  // Hydrate unreadCounts map when API responds
  useEffect(() => {
    const serverMap = unreadResponse?.data?.unreadBySender;
    if (!serverMap) return;

    setUnreadCounts((prev) => {
      const merged: Record<string, number> = { ...prev };

      Object.entries(serverMap).forEach(([senderId, count]) => {
        if (!readFriendIdsRef.current.has(senderId) && (count as number) > 0) {
          merged[senderId] = Math.max(merged[senderId] || 0, count as number);
        }
      });

      unreadCountsRef.current = merged;
      return merged;
    });
  }, [unreadResponse]);

  // 2. Conversation History & Mutations
  const { data: historyResponse, isFetching: fetchingHistory } = useGetHistoryQuery(friendId, {
    skip: !friendId,
  });
  const [saveMessage] = useSaveMessageMutation();
  const [updateMessage] = useUpdateMessageMutation();
  const [toggleReaction] = useToggleReactionMutation();
  const [readMessages] = useReadMessagesMutation();

  const messageMap = useMemo(() => {
    const map: Record<string, SocialChatMessage> = {};
    for (let i = 0; i < messages.length; i += 1) {
      map[messages[i].id] = messages[i];
    }
    return map;
  }, [messages]);

  // Calculate unique friends with unseen messages & total unseen messages
  const { unreadFriendsCount, totalUnreadMessages } = useMemo(() => {
    let uniqueFriends = 0;
    let totalMessages = 0;

    Object.values(unreadCounts).forEach((count) => {
      if (count > 0) {
        uniqueFriends += 1;
        totalMessages += count;
      }
    });

    return {
      unreadFriendsCount: uniqueFriends,
      totalUnreadMessages: totalMessages,
    };
  }, [unreadCounts]);

  const isFriendUnread = useCallback(
    (targetUserId: string) => Boolean((unreadCounts[targetUserId] || 0) > 0),
    [unreadCounts]
  );

  const getFriendUnreadCount = useCallback(
    (targetUserId: string) => unreadCounts[targetUserId] || 0,
    [unreadCounts]
  );

  const markFriendAsRead = useCallback(
    (targetUserId: string, forceApi = false) => {
      if (!targetUserId) return;

      const hadUnreadInMap = Boolean(unreadCountsRef.current[targetUserId] > 0);
      readFriendIdsRef.current.add(targetUserId);

      if (hadUnreadInMap) {
        const next = { ...unreadCountsRef.current };
        delete next[targetUserId];
        unreadCountsRef.current = next;
        setUnreadCounts(next);
      }

      setActiveChatUnreadCount(0);

      if (currentUserId && (hadUnreadInMap || forceApi)) {
        readMessages({ userId1: currentUserId, userId2: targetUserId }).catch(console.error);
      }
    },
    [currentUserId, readMessages]
  );

  const setIsAtBottom = useCallback(
    (atBottom: boolean) => {
      isAtBottomRef.current = atBottom;
      if (atBottom && friendId && isPanelVisibleRef.current && unreadCountsRef.current[friendId]) {
        markFriendAsRead(friendId);
      }
    },
    [friendId, markFriendAsRead]
  );

  // Load conversation history into state and sort messages chronologically
  useEffect(() => {
    if (!activeFriend) {
      setMessages([]);
      setReplyingTo(null);
      setActiveChatUnreadCount(0);
    } else if (!fetchingHistory && historyResponse?.data) {
      const fetched = Array.from(historyResponse.data as SocialChatMessage[]).map((m) => ({ ...m })).sort(
        (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      );
      setMessages((prev) => {
        if (prev.length === 0 || prev[0]?.id !== fetched[0]?.id) return fetched;
        return prev.length > fetched.length ? prev : fetched;
      });
    }
  }, [historyResponse, activeFriend, fetchingHistory]);

  // Real-Time Socket.io Listeners (Messages, Reactions, & User Online Status)
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (incomingMsg: SocialChatMessage) => {
      const senderId = incomingMsg.authorId;
      if (!senderId) return;

      const isFromSelf = String(senderId) === String(currentUserId);
      const activeFriendId = activeFriend?.accountDetails?.userId;

      // Bubble conversation to top in Redux store
      const otherUserId = isFromSelf ? incomingMsg.recipientId : senderId;
      if (otherUserId) {
        dispatch(
          updateLatestMessage({
            recipientId: String(otherUserId),
            text: incomingMsg.text,
            createdAt: incomingMsg.createdAt || new Date().toISOString(),
          })
        );
      }

      const belongsToActiveConversation =
        Boolean(activeFriendId) &&
        (String(senderId) === String(activeFriendId) ||
          String(incomingMsg.recipientId) === String(activeFriendId));

      if (belongsToActiveConversation) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === incomingMsg.id)) return prev;
          const nextList = [...prev, { ...incomingMsg, isSelf: isFromSelf }];
          return nextList.sort(
            (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
          );
        });

        if (!isFromSelf) {
          if (isPanelVisibleRef.current && isAtBottomRef.current && currentUserId) {
            readFriendIdsRef.current.add(senderId);
            readMessages({ userId1: currentUserId, userId2: senderId }).catch(console.error);
          } else {
            readFriendIdsRef.current.delete(senderId);
            setActiveChatUnreadCount((prev) => prev + 1);
            setUnreadCounts((prev) => {
              const next = { ...prev, [senderId]: (prev[senderId] || 0) + 1 };
              unreadCountsRef.current = next;
              return next;
            });
          }
        }
      } else if (!isFromSelf) {
        readFriendIdsRef.current.delete(senderId);
        setUnreadCounts((prev) => {
          const next = { ...prev, [senderId]: (prev[senderId] || 0) + 1 };
          unreadCountsRef.current = next;
          return next;
        });
      }
    };

    const handleMessageEdited = (editedMsg: SocialChatMessage) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === editedMsg.id
            ? { ...m, text: editedMsg.text, editedAt: editedMsg.editedAt }
            : m
        )
      );
    };

    const handleReactionToggled = (reactionData: {
      messageId: string;
      reactions: SocialChatReaction[];
    }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === reactionData.messageId ? { ...m, reactions: reactionData.reactions } : m
        )
      );
    };

    const handleUserStatusChanged = (statusData: { userId: string; isOnline: boolean }) => {
      if (statusData?.userId) {
        setOnlineStatusMap((prev) => ({
          ...prev,
          [statusData.userId]: statusData.isOnline,
        }));
      }
    };

    socket.on('receive_new_message', handleNewMessage);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_reaction', handleReactionToggled);
    socket.on('user_status_changed', handleUserStatusChanged);

    return () => {
      socket.off('receive_new_message', handleNewMessage);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_reaction', handleReactionToggled);
      socket.off('user_status_changed', handleUserStatusChanged);
    };
  }, [socket, activeFriend, currentUserId, readMessages, dispatch]);

  const openChat = useCallback(
    (item: AllRelationsType) => {
      setActiveFriend(item);
      const targetUserId = item.accountDetails.userId;
      const hasUnreadLocal = Boolean(unreadCountsRef.current[targetUserId] > 0);

      if (hasUnreadLocal) {
        markFriendAsRead(targetUserId, true);
      }
    },
    [markFriendAsRead]
  );

  const closeActiveChat = useCallback(() => {
    setActiveFriend(null);
    setReplyingTo(null);
    setActiveChatUnreadCount(0);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !activeFriend || !friendId) return;

      const clientGeneratedId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const timeNow = new Date().toISOString();
      const newMsg: SocialChatMessage = {
        id: clientGeneratedId,
        text: trimmed,
        isSelf: true,
        authorId: currentUserId,
        authorName: currentUserName,
        replyToId: replyingTo?.id,
        createdAt: timeNow,
      };

      setMessages((prev) => [...prev, newMsg]);
      setReplyingTo(null);
      setActiveChatUnreadCount(0);

      // Bubble conversation to top immediately on send
      dispatch(
        updateLatestMessage({
          recipientId: friendId,
          text: trimmed,
          createdAt: timeNow,
        })
      );

      saveMessage({
        userId: currentUserId,
        recipientId: friendId,
        text: newMsg.text,
        replyToId: newMsg.replyToId,
      }).catch((err) => console.error('Failed to save message:', err));
    },
    [activeFriend, friendId, currentUserId, currentUserName, replyingTo, saveMessage, dispatch]
  );

  const editMessage = useCallback(
    (id: string, text: string) => {
      const editedAt = Date.now();
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text, editedAt } : m)));

      updateMessage({ messageId: id, text }).catch((err) =>
        console.error('Failed to update message:', err)
      );
    },
    [updateMessage]
  );

  const reactMessage = useCallback(
    (id: string, emoji: string) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          const current = m.reactions || [];
          const existing = current.find((r) => r.emoji === emoji);

          const updatedReactions = existing
            ? current
              .map((r) =>
                r.emoji === emoji
                  ? {
                    ...r,
                    count: r.count + (r.reactedBySelf ? -1 : 1),
                    reactedBySelf: !r.reactedBySelf,
                  }
                  : r
              )
              .filter((r) => r.count > 0)
            : [...current, { emoji, count: 1, reactedBySelf: true }];

          return { ...m, reactions: updatedReactions };
        })
      );

      toggleReaction({ messageId: id, emoji }).catch((err) =>
        console.error('Failed to toggle reaction:', err)
      );
    },
    [toggleReaction]
  );

  const value = useMemo(
    () => ({
      isChatPanelVisible,
      setIsChatPanelVisible,
      tab,
      setTab,
      activeFriend,
      openChat,
      closeActiveChat,
      messages,
      messageMap,
      fetchingHistory,
      replyingTo,
      setReplyingTo,
      unreadCounts,
      unreadFriendsCount,
      totalUnreadMessages,
      hasUnreadMessages: unreadFriendsCount > 0,
      activeChatUnreadCount,
      onlineStatusMap,
      isFriendUnread,
      getFriendUnreadCount,
      setIsAtBottom,
      markFriendAsRead,
      refetchUnread,
      sendMessage,
      editMessage,
      reactMessage,
    }),
    [
      isChatPanelVisible,
      tab,
      activeFriend,
      openChat,
      closeActiveChat,
      messages,
      messageMap,
      fetchingHistory,
      replyingTo,
      unreadCounts,
      unreadFriendsCount,
      totalUnreadMessages,
      activeChatUnreadCount,
      onlineStatusMap,
      isFriendUnread,
      getFriendUnreadCount,
      setIsAtBottom,
      markFriendAsRead,
      refetchUnread,
      sendMessage,
      editMessage,
      reactMessage,
    ]
  );

  return <SocialChatContext.Provider value={value}>{children}</SocialChatContext.Provider>;
};

export const useSocialChat = (): SocialChatContextValue => {
  const context = useContext(SocialChatContext);
  if (!context) {
    throw new Error('useSocialChat must be used within a SocialChatProvider');
  }
  return context;
};
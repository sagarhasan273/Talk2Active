// src/core/contexts/context-social-storage.tsx

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
import { useSocket } from '@/core/contexts/app-context/context-socket';
import type { AllRelationsType, SocialChatMessage, SocialChatReaction } from '@/types/type-social';
import { updateLatestMessage, updateRelationPresence, useCredentials } from '../../slices';

interface SocialStorageContextValue {
  activeFriend: AllRelationsType | null;
  setActiveFriend: React.Dispatch<React.SetStateAction<AllRelationsType | null>>;

  messages: SocialChatMessage[];
  messageMap: Record<string, SocialChatMessage>;
  fetchingHistory: boolean;
  replyingTo: SocialChatMessage | null;
  setReplyingTo: React.Dispatch<React.SetStateAction<SocialChatMessage | null>>;

  unreadCounts: Record<string, number>;
  unreadFriendsCount: number;
  totalUnreadMessages: number;
  hasUnreadMessages: boolean;
  activeChatUnreadCount: number;
  onlineStatusMap: Record<string, string | null>;

  isFriendUnread: (friendUserId: string) => boolean;
  getFriendUnreadCount: (friendUserId: string) => number;
  markFriendAsRead: (friendUserId: string, forceApi?: boolean) => void;
  refetchUnread: () => void;

  setIsAtBottom: (atBottom: boolean) => void;
  setPanelVisibleRef: (isVisible: boolean) => void; // Used to sync UI state to Socket listener

  sendMessage: (text: string) => Promise<void>;
  editMessage: (id: string, text: string) => void;
  reactMessage: (id: string, emoji: string) => void;
}

const SocialStorageContext = createContext<SocialStorageContextValue | undefined>(undefined);

export const SocialStorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const { user, friends, following, followers } = useCredentials();
  const dispatch = useDispatch();

  const currentUserId = user?.userId || '';
  const currentUserName = user?.name || user?.username || 'You';

  const [activeFriend, setActiveFriend] = useState<AllRelationsType | null>(null);
  const [messages, setMessages] = useState<SocialChatMessage[]>([]);
  const [replyingTo, setReplyingTo] = useState<SocialChatMessage | null>(null);

  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [activeChatUnreadCount, setActiveChatUnreadCount] = useState<number>(0);
  const [onlineStatusMap, setOnlineStatusMap] = useState<Record<string, string | null>>({});

  const unreadCountsRef = useRef<Record<string, number>>({});
  unreadCountsRef.current = unreadCounts;

  const isAtBottomRef = useRef<boolean>(true);
  const isPanelVisibleRef = useRef<boolean>(false);
  const readFriendIdsRef = useRef<Set<string>>(new Set());

  const friendId = activeFriend?.accountDetails?.userId || '';

  const allRelationUserIds = useMemo(() => {
    const ids = new Set<string>();
    [...(friends || []), ...(following || []), ...(followers || [])].forEach((item) => {
      const id = item?.accountDetails?.userId;
      if (id) ids.add(String(id));
    });
    return Array.from(ids);
  }, [friends, following, followers]);

  const { data: unreadResponse, refetch: refetchUnread } = useGetUnreadMessagesQuery(undefined, {
    skip: !currentUserId,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    const serverMap = unreadResponse?.data?.unreadBySender;
    if (!serverMap) return;
    setUnreadCounts((prev) => {
      const merged = { ...prev };
      Object.entries(serverMap).forEach(([senderId, count]) => {
        if (!readFriendIdsRef.current.has(senderId) && (count as number) > 0) {
          merged[senderId] = Math.max(merged[senderId] || 0, count as number);
        }
      });
      unreadCountsRef.current = merged;
      return merged;
    });
  }, [unreadResponse]);

  useEffect(() => {
    if (!socket || allRelationUserIds.length === 0) return;
    socket.emit('check_online_users', allRelationUserIds, (activeMap: Record<string, string>) => {
      if (!activeMap || typeof activeMap !== 'object') return;
      setOnlineStatusMap((prev) => {
        const next = { ...prev };
        allRelationUserIds.forEach((id) => {
          next[id] = activeMap[id];
        });
        return next;
      });
    });
  }, [socket, allRelationUserIds]);

  const { data: historyResponse, isFetching: fetchingHistory } = useGetHistoryQuery(friendId, {
    skip: !friendId,
  });
  const [saveMessage] = useSaveMessageMutation();
  const [updateMessage] = useUpdateMessageMutation();
  const [toggleReaction] = useToggleReactionMutation();
  const [readMessages] = useReadMessagesMutation();

  const messageMap = useMemo(() => {
    const map: Record<string, SocialChatMessage> = {};
    for (let i = 0; i < messages.length; i++) map[messages[i].id] = messages[i];
    return map;
  }, [messages]);

  const { unreadFriendsCount, totalUnreadMessages } = useMemo(() => {
    let uniqueFriends = 0;
    let totalMessages = 0;
    Object.values(unreadCounts).forEach((count) => {
      if (count > 0) {
        uniqueFriends++;
        totalMessages += count;
      }
    });
    return { unreadFriendsCount: uniqueFriends, totalUnreadMessages: totalMessages };
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

  const setPanelVisibleRef = useCallback((isVisible: boolean) => {
    isPanelVisibleRef.current = isVisible;
  }, []);

  const setIsAtBottom = useCallback(
    (atBottom: boolean) => {
      isAtBottomRef.current = atBottom;
      if (atBottom && friendId && isPanelVisibleRef.current && unreadCountsRef.current[friendId]) {
        markFriendAsRead(friendId);
      }
    },
    [friendId, markFriendAsRead]
  );

  useEffect(() => {
    if (!activeFriend) {
      setMessages([]);
      setReplyingTo(null);
      setActiveChatUnreadCount(0);
    } else if (!fetchingHistory && historyResponse?.data) {
      const fetched = Array.from(historyResponse.data as SocialChatMessage[])
        .map((m) => ({ ...m }))
        .sort(
          (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        );
      setMessages((prev) => {
        if (prev.length === 0 || prev[0]?.id !== fetched[0]?.id) return fetched;
        return prev.length > fetched.length ? prev : fetched;
      });
    }
  }, [historyResponse, activeFriend, fetchingHistory]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (incomingMsg: SocialChatMessage) => {
      const senderId = incomingMsg.authorId;
      if (!senderId) return;

      const isFromSelf = String(senderId) === String(currentUserId);
      const activeFriendId = activeFriend?.accountDetails?.userId;
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
          m.id === editedMsg.id ? { ...m, text: editedMsg.text, editedAt: editedMsg.editedAt } : m
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

    const handleUserStatusChanged = (statusData: {
      userId: string;
      isOnline?: boolean;
      status?: 'online' | 'offline';
      lastActive?: string;
      roomId?: string;
    }) => {
      if (!statusData?.userId) return;
      const resolvedOnline = statusData.status === 'online' ? statusData.roomId : null;
      if (resolvedOnline)
        setOnlineStatusMap((prev) => ({ ...prev, [statusData.userId]: resolvedOnline }));
      if (!resolvedOnline && statusData.lastActive) {
        dispatch(
          updateRelationPresence({ userId: statusData.userId, lastActive: statusData.lastActive })
        );
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
      dispatch(updateLatestMessage({ recipientId: friendId, text: trimmed, createdAt: timeNow }));
      saveMessage({
        userId: currentUserId,
        recipientId: friendId,
        text: newMsg.text,
        replyToId: newMsg.replyToId,
      }).catch(console.error);
    },
    [activeFriend, friendId, currentUserId, currentUserName, replyingTo, saveMessage, dispatch]
  );

  const editMessage = useCallback(
    (id: string, text: string) => {
      const editedAt = Date.now();
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text, editedAt } : m)));
      updateMessage({ messageId: id, text }).catch(console.error);
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
      toggleReaction({ messageId: id, emoji }).catch(console.error);
    },
    [toggleReaction]
  );

  const value = useMemo(
    () => ({
      activeFriend,
      setActiveFriend,
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
      setPanelVisibleRef,
      sendMessage,
      editMessage,
      reactMessage,
    }),
    [
      activeFriend,
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
      setPanelVisibleRef,
      sendMessage,
      editMessage,
      reactMessage,
    ]
  );

  return <SocialStorageContext.Provider value={value}>{children}</SocialStorageContext.Provider>;
};

export const useSocialStorage = () => {
  const context = useContext(SocialStorageContext);
  if (!context) throw new Error('useSocialStorage must be used within a SocialStorageProvider');
  return context;
};

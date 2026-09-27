import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  useGetHistoryQuery,
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
import { useCredentials } from '../slices';

interface SocialChatContextValue {
  isChatPanelVisible: boolean;
  setIsChatPanelVisible: React.Dispatch<React.SetStateAction<boolean>>;

  tab: SocialChatTabKey;
  setTab: React.Dispatch<React.SetStateAction<SocialChatTabKey>>;
  activeFriend: AllRelationsType | null;
  openChat: (friend: AllRelationsType) => void;
  closeActiveChat: () => void;
  syncFriendsUnreadState: (friends: AllRelationsType[]) => void;

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
  setIsAtBottom: (atBottom: boolean) => void;
  markFriendAsRead: (friendUserId: string, forceApi?: boolean) => void;

  sendMessage: (text: string) => Promise<void>;
  editMessage: (id: string, text: string) => void;
  reactMessage: (id: string, emoji: string) => void;
}

const SocialChatContext = createContext<SocialChatContextValue | undefined>(undefined);

export const SocialChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const { user, friends } = useCredentials();

  const currentUserId = user?.userId || '';
  const currentUserName = user?.name || user?.username || 'You';

  const [isChatPanelVisible, setIsChatPanelVisible] = useState<boolean>(false);
  const [tab, setTab] = useState<SocialChatTabKey>('friends');
  const [activeFriend, setActiveFriend] = useState<AllRelationsType | null>(null);
  const [messages, setMessages] = useState<SocialChatMessage[]>([]);
  const [replyingTo, setReplyingTo] = useState<SocialChatMessage | null>(null);

  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [activeChatUnreadCount, setActiveChatUnreadCount] = useState<number>(0);

  // Refs to prevent duplicate API calls
  const unreadCountsRef = useRef<Record<string, number>>({});
  unreadCountsRef.current = unreadCounts;

  const isAtBottomRef = useRef<boolean>(true);
  const isPanelVisibleRef = useRef<boolean>(isChatPanelVisible);
  isPanelVisibleRef.current = isChatPanelVisible;
  const readFriendIdsRef = useRef<Set<string>>(new Set());

  const friendId = activeFriend?.accountDetails?.userId || '';

  const syncFriendsUnreadState = useCallback((friendsList: AllRelationsType[]) => {
    if (!friendsList?.length) return;
    setUnreadCounts((prev) => {
      let changed = false;
      const next = { ...prev };

      friendsList.forEach((f) => {
        const uid = f.accountDetails?.userId;
        if (
          uid &&
          f.latestMessage?.isUnread &&
          !readFriendIdsRef.current.has(uid) &&
          !next[uid]
        ) {
          next[uid] = 1;
          changed = true;
        }
      });

      if (changed) {
        unreadCountsRef.current = next;
        return next;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if (friends?.length > 0) {
      syncFriendsUnreadState(friends);
    }
  }, [friends, syncFriendsUnreadState]);

  // RTK Query hooks (Removed refetchOnMountOrArgChange: true if it was causing extra fetches)
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

  // Guarded: Only calls backend API if this friend actually has unread messages!
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

      // Only hit the network if there were actually unread messages (or explicitly forced)
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

  // Load history into local state when switching active friend
  useEffect(() => {
    if (!activeFriend) {
      setMessages([]);
      setReplyingTo(null);
      setActiveChatUnreadCount(0);
    } else if (!fetchingHistory && historyResponse?.data) {
      const fetched = historyResponse.data as SocialChatMessage[];
      setMessages((prev) => {
        if (prev.length === 0 || prev[0]?.id !== fetched[0]?.id) return fetched;
        return prev.length > fetched.length ? prev : fetched;
      });
    }
  }, [historyResponse, activeFriend, fetchingHistory]);

  // Real-Time Socket.io Listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (incomingMsg: SocialChatMessage) => {
      const senderId = incomingMsg.authorId;
      if (!senderId) return;

      const isFromSelf = String(senderId) === String(currentUserId);
      const activeFriendId = activeFriend?.accountDetails?.userId;

      const belongsToActiveConversation =
        Boolean(activeFriendId) &&
        (String(senderId) === String(activeFriendId) ||
          String(incomingMsg.recipientId) === String(activeFriendId));

      if (belongsToActiveConversation) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === incomingMsg.id)) return prev;
          return [...prev, { ...incomingMsg, isSelf: isFromSelf }];
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

    socket.on('receive_new_message', handleNewMessage);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_reaction', handleReactionToggled);

    return () => {
      socket.off('receive_new_message', handleNewMessage);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_reaction', handleReactionToggled);
    };
  }, [socket, activeFriend, currentUserId, readMessages]);

  const openChat = useCallback(
    (item: AllRelationsType) => {
      setActiveFriend(item);
      const targetUserId = item.accountDetails.userId;
      const hasUnreadFromBackend = Boolean(item.latestMessage?.isUnread);
      const hasUnreadLocal = Boolean(unreadCountsRef.current[targetUserId] > 0);

      if (hasUnreadFromBackend || hasUnreadLocal) {
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
      const newMsg: SocialChatMessage = {
        id: clientGeneratedId,
        text: trimmed,
        isSelf: true,
        authorId: currentUserId,
        authorName: currentUserName,
        replyToId: replyingTo?.id,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMsg]);
      setReplyingTo(null);
      setActiveChatUnreadCount(0);

      saveMessage({
        userId: currentUserId,
        recipientId: friendId,
        text: newMsg.text,
        replyToId: newMsg.replyToId,
      }).catch((err) => console.error('Failed to save message:', err));
    },
    [activeFriend, friendId, currentUserId, currentUserName, replyingTo, saveMessage]
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
      syncFriendsUnreadState,
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
      setIsAtBottom,
      markFriendAsRead,
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
      syncFriendsUnreadState,
      messages,
      messageMap,
      fetchingHistory,
      replyingTo,
      unreadCounts,
      unreadFriendsCount,
      totalUnreadMessages,
      activeChatUnreadCount,
      setIsAtBottom,
      markFriendAsRead,
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

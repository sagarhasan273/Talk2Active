// src/core/contexts/context-social-setting.tsx

import type { AllRelationsType, SocialChatTabKey } from '@/types/type-social';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSocialStorage } from './context-social-storage';

interface SocialSettingContextValue {
  isChatPanelVisible: boolean;
  setIsChatPanelVisible: React.Dispatch<React.SetStateAction<boolean>>;
  tab: SocialChatTabKey;
  setTab: React.Dispatch<React.SetStateAction<SocialChatTabKey>>;
  openChat: (friend: AllRelationsType) => void;
  closeActiveChat: () => void;
}

const SocialSettingContext = createContext<SocialSettingContextValue | undefined>(undefined);

export const SocialSettingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Connect to isolated Data layer
  const { setActiveFriend, setReplyingTo, markFriendAsRead, setPanelVisibleRef } =
    useSocialStorage();

  const [isChatPanelVisible, setIsChatPanelVisible] = useState<boolean>(false);
  const [tab, setTab] = useState<SocialChatTabKey>('friends');

  // Keep the Socket Listener informed about whether the panel is open without re-rendering storage
  useEffect(() => {
    setPanelVisibleRef(isChatPanelVisible);
  }, [isChatPanelVisible, setPanelVisibleRef]);

  const openChat = useCallback(
    (item: AllRelationsType) => {
      setActiveFriend(item);
      // Mark as read immediately when opened
      const targetUserId = item.accountDetails.userId;
      if (targetUserId) {
        markFriendAsRead(targetUserId, true);
      }
    },
    [setActiveFriend, markFriendAsRead]
  );

  const closeActiveChat = useCallback(() => {
    setActiveFriend(null);
    setReplyingTo(null);
  }, [setActiveFriend, setReplyingTo]);

  const value = useMemo(
    () => ({
      isChatPanelVisible,
      setIsChatPanelVisible,
      tab,
      setTab,
      openChat,
      closeActiveChat,
    }),
    [isChatPanelVisible, tab, openChat, closeActiveChat]
  );

  return <SocialSettingContext.Provider value={value}>{children}</SocialSettingContext.Provider>;
};

export const useSocialSetting = () => {
  const context = useContext(SocialSettingContext);
  if (!context) throw new Error('useSocialSetting must be used within a SocialSettingProvider');
  return context;
};

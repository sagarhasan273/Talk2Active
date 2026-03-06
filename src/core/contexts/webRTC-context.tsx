import type { ReactNode } from 'react';
import type { UseWebRTCReturn } from 'src/hooks/useWebRTC';

import React, { useContext, createContext } from 'react';

import { useWebRTC } from 'src/hooks/useWebRTC';
import { useChatSocketListeners } from 'src/hooks/use-chat-socket-listeners';

const WebRTCContext = createContext<UseWebRTCReturn | null>(null);

interface WebRTCProviderProps {
  children: ReactNode;
}

export function WebRTCProvider({ children }: WebRTCProviderProps) {
  const webRTC = useWebRTC();

  const { onLeaveRoom } = useChatSocketListeners(webRTC);

  const memoizedWebRTC = React.useMemo(() => ({ ...webRTC, onLeaveRoom }), [webRTC, onLeaveRoom]);

  return <WebRTCContext.Provider value={memoizedWebRTC}>{children}</WebRTCContext.Provider>;
}

export function useWebRTCContext() {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error('useWebRTCContext must be used within WebRTCProvider');
  }
  return context;
}

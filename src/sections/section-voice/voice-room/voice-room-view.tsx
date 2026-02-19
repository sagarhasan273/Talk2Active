import React, { useRef } from 'react';
import { useSelector } from 'react-redux';

import { selectAccount } from 'src/core/slices';
import { useRoomTools } from 'src/core/slices/slice-room';
import { useWebRTCContext } from 'src/core/contexts/webRTC-context';
import { useSocketContext } from 'src/core/contexts/socket-context';

import { useChatSocketListeners } from 'src/sections/section-chat-room/chat-hooks/chat-socket-listeners';

import { VoiceRoomBodyView } from './voice-room-body-view';
import { VoiceRoomEntryView } from './voice-room-entry-view';

export function VoiceRoomView() {
  const user = useSelector(selectAccount);

  const { room, userVoiceState, updateUserVoiceState, addParticipant } = useRoomTools();

  const { socket } = useSocketContext();

  const webRTC = useWebRTCContext();

  const { hasJoined, isMicMuted } = userVoiceState;
  const { initializeMicrophone } = webRTC;

  // Socket listeners
  const { setupChatSocketListeners } = useChatSocketListeners(webRTC);

  const setupChatSocketListenersRef = useRef<(() => void) | undefined>();

  const handleJoinRoom = async () => {
    const isMuted = await initializeMicrophone().catch((error) => {
      let errorMessage = '';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Microphone access was denied. Please allow access and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.';
      } else {
        errorMessage = 'An unexpected error occurred while accessing the microphone.';
      }

      // Update state to reflect mic access error
      updateUserVoiceState({ micError: errorMessage });
      return false;
    });

    if (!setupChatSocketListenersRef.current)
      setupChatSocketListenersRef.current = setupChatSocketListeners?.();

    if (socket?.id) {
      socket?.emit('join-voice-room', {
        roomId: room.id,
        userId: user.id,
        name: user.name,
        profilePhoto: user.profilePhoto,
        isMuted: isMicMuted,
        status: 'online',
        userType: room.host?.id === user.id ? 'Host' : 'Guest',
        verified: user.verified,
      });

      updateUserVoiceState({ isMicMuted: isMuted, hasJoined: true });

      addParticipant({
        userId: user.id,
        socketId: socket?.id,
        status: 'online',
        isMuted: isMicMuted,
        userType: room.host?.id === user.id ? 'Host' : 'Guest',
        verified: user.verified,
        isLocal: true,
        isSpeaking: false,
        name: user.name,
        profilePhoto: user.profilePhoto,
      });
    }
  };

  const handelLeaveRoom = async () => {
    if (setupChatSocketListenersRef.current) setupChatSocketListenersRef.current?.();
  };

  return (
    <>
      {!hasJoined && <VoiceRoomEntryView onJoinRoom={handleJoinRoom} />}

      {hasJoined && <VoiceRoomBodyView onLeaveRoom={handelLeaveRoom} />}
    </>
  );
}

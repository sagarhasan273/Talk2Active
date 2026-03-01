// src/sections/section-voice-room/voice-room-view.tsx

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

  const { room, userVoiceState, resetParticipants, updateUserVoiceState, addParticipant } =
    useRoomTools();

  const { socket } = useSocketContext();

  const webRTC = useWebRTCContext();

  const { hasJoined, isMicMuted, roomId } = userVoiceState;
  const { initializeMicrophone, cleanup: cleanupWebRTC } = webRTC;

  // Socket listeners
  const { setupChatSocketListeners } = useChatSocketListeners(webRTC);

  const setupChatSocketListenersRef = useRef<(() => void) | undefined>();

  const handleJoinChat = async () => {
    if (roomId !== null) {
      await handelLeaveChat();
    }

    // Initialize microphone - this will reuse audio context if available
    const success = await initializeMicrophone().catch((error) => {
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

    if (!success) return;

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

      updateUserVoiceState({ hasJoined: true, roomId: room.id });

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

  const handelLeaveChat = async () => {
    console.log('Leaving chat - selective cleanup');

    if (setupChatSocketListenersRef.current) {
      setupChatSocketListenersRef.current?.();
      setupChatSocketListenersRef.current = undefined;
    }

    socket?.emit('leave-voice-room', {
      roomId,
      userId: user.id,
      name: user.name,
    });

    // This cleanup keeps audio context alive
    cleanupWebRTC();

    updateUserVoiceState({ hasJoined: false, roomId: null });

    // Reset local state
    resetParticipants();
  };

  return (
    <>
      {room.id !== roomId && <VoiceRoomEntryView onJoinRoom={handleJoinChat} />}

      {hasJoined && room.id === roomId && <VoiceRoomBodyView onLeaveRoom={handelLeaveChat} />}
    </>
  );
}

// src/sections/section-voice-room/voice-room-view.tsx

import React from 'react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';

import { selectAccount } from 'src/core/slices';
import { useRoomTools } from 'src/core/slices/slice-room';
import { useWebRTCContext } from 'src/core/contexts/webRTC-context';
import { useSocketContext } from 'src/core/contexts/socket-context';
import { useJoinRoomMutation, useLeaveRoomMutation } from 'src/core/apis';

import { VoiceRoomBodyView } from './voice-room-body-view';
import { VoiceRoomEntryView } from './voice-room-entry-view';

export function VoiceRoomView({ onLeave }: { onLeave: () => void }) {
  const user = useSelector(selectAccount);

  const { room, userVoiceState, resetParticipants, updateUserVoiceState, addParticipant } =
    useRoomTools();

  const { socket } = useSocketContext();

  const webRTC = useWebRTCContext();

  const { hasJoined, isMicMuted, roomId } = userVoiceState;
  const { initializeMicrophone, cleanup: cleanupWebRTC, removePeer } = webRTC;

  const [joinRoom] = useJoinRoomMutation();
  const [leaveRoom] = useLeaveRoomMutation();

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

    const response = await joinRoom({ roomId: room.id, userId: user.id }).unwrap();

    if (response.status) {
      sessionStorage.setItem('joinedRoomId', room.id);

      if (socket?.id) {
        socket?.emit('join-voice-room', {
          roomId: room.id,
          userId: user.id,
          name: user.name,
          profilePhoto: user.profilePhoto,
          isMuted: isMicMuted,
          status: 'online',
          userType: room.host?.id === user.id ? 'host' : 'guest',
          verified: user.verified,
          accountType: user.accountType,
        });

        updateUserVoiceState({ hasJoined: true, roomId: room.id });

        addParticipant({
          userId: user.id,
          socketId: socket?.id,
          status: 'online',
          isMuted: isMicMuted,
          userType: room.host?.id === user.id ? 'host' : 'guest',
          verified: user.verified,
          isLocal: true,
          isSpeaking: false,
          name: user.name,
          profilePhoto: user.profilePhoto,
          accountType: user.accountType,
        });
      }
    } else {
      toast.info(response.message);
    }
  };

  const handelLeaveChat = async () => {
    if (onLeave) onLeave();
    const response = await leaveRoom({
      roomId: room.id,
      userId: user.id,
      name: user.name,
    }).unwrap();

    if (response.status) {
      // This cleanup keeps audio context alive
      cleanupWebRTC();

      updateUserVoiceState({ hasJoined: false, roomId: null });
      if (socket?.id) removePeer(socket.id);
      // Reset local state
      resetParticipants();
    } else {
      console.error(response.message);
    }
  };

  return (
    <>
      {room.id !== roomId && <VoiceRoomEntryView onJoinRoom={handleJoinChat} />}

      {hasJoined && room.id === roomId && <VoiceRoomBodyView onLeaveRoom={onLeave} />}
    </>
  );
}

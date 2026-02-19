import React from 'react';

import { useRoomTools } from 'src/core/slices/slice-room';
import { useWebRTCContext } from 'src/core/contexts/webRTC-context';

import VoiceRoomBodyView from './voice-room-body-view';
import { VoiceRoomEntryView } from './voice-room-entry-view';

export function VoiceRoomView() {
  const { userVoiceState, updateUserVoiceState } = useRoomTools();

  const { hasJoined } = userVoiceState;

  const { initializeMicrophone } = useWebRTCContext();

  const HandleJoinRoom = async () => {
    updateUserVoiceState({ hasJoined: true });
    const isMic = await initializeMicrophone().catch((error) => {
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

    updateUserVoiceState({ isMuted: isMic, hasJoined: true });
  };

  return (
    <>
      {!hasJoined && <VoiceRoomEntryView onJoinRoom={HandleJoinRoom} />}

      {hasJoined && <VoiceRoomBodyView />}
    </>
  );
}

// src/sections/section-voice-room/voice-room-view.tsx

import { useRoomTools } from 'src/core/slices/slice-room';
import { useWebRTCContext } from 'src/core/contexts/webRTC-context';

import { VoiceRoomBodyView } from './voice-room-body-view';
import { VoiceRoomEntryView } from './voice-room-entry-view';

export function VoiceRoomView() {
  const { room, userVoiceState } = useRoomTools();

  const { onJoinRoom } = useWebRTCContext();

  const { hasJoined, roomId } = userVoiceState;

  return (
    <>
      {room.id !== roomId && <VoiceRoomEntryView onJoinRoom={onJoinRoom} />}

      {hasJoined && room.id === roomId && <VoiceRoomBodyView />}
    </>
  );
}

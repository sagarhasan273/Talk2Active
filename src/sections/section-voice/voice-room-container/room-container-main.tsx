// src/sections/section-voice/view/voice-room-body.tsx

import {
  RoomAudioRenderer,
  StartAudio,
  useLocalParticipant,
  useRoomContext,
} from '@livekit/components-react';
import { Box } from '@mui/material';
import { RoomEvent } from 'livekit-client';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useRoomChat } from '@/core/contexts/context-room-chat';
import useRoomSounds from '@/hooks/use-room-sounds';
import { RoomChatDrawer } from '../voice-room-chat';
import { RoomChatMain } from '../voice-room-chat/room-chat-main';
import { RoomAudioStage } from '../voice-room-stage';

interface RoomContainerMainProps {
  token?: string | null;
  onLeaveRoom?: () => void;
  onSettingsClick?: () => void;
  onBack?: () => void;
}

export function RoomContainerMain({
  onLeaveRoom,
  onSettingsClick,
  onBack,
}: RoomContainerMainProps) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const { playHandRaise } = useRoomSounds();

  // Pull chat toggle directly from RoomChatContext
  const { onToggleChat } = useRoomChat();

  const [raisedHandsSet, setRaisedHandsSet] = useState<Set<string>>(new Set());
  const [participantReactions, setParticipantReactions] = useState<Record<string, string>>({});
  const micInitializedRef = useRef(false);

  // --- Auto-enable mic once connected if requested ---
  useEffect(() => {
    if (!localParticipant || micInitializedRef.current) return;

    localParticipant
      .setMicrophoneEnabled(true, {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      })
      .then(() => {
        micInitializedRef.current = true;
      })
      .catch((err) => {
        console.warn('[RoomContainer] Microphone permission denied or initialization error:', err);
      });
  }, [localParticipant]);

  // --- Stage Interaction Handlers ---
  const handleToggleRaiseHand = useCallback(async () => {
    if (!localParticipant) return;
    const isCurrentlyRaised = raisedHandsSet.has(localParticipant.identity);
    const nextRaised = !isCurrentlyRaised;

    setRaisedHandsSet((prev) => {
      const next = new Set(prev);
      if (nextRaised) next.add(localParticipant.identity);
      else next.delete(localParticipant.identity);
      return next;
    });

    const payload = JSON.stringify({
      type: 'HAND_RAISE',
      identity: localParticipant.identity,
      raised: nextRaised,
    });

    await localParticipant.publishData(new TextEncoder().encode(payload), {
      reliable: true,
      topic: 'room_interactions',
    });
  }, [localParticipant, raisedHandsSet]);

  const handleSendReaction = useCallback(
    async (emoji: string) => {
      if (!localParticipant) return;

      setParticipantReactions((prev) => ({
        ...prev,
        [localParticipant.identity]: emoji,
      }));

      setTimeout(() => {
        setParticipantReactions((prev) => {
          const updated = { ...prev };
          delete updated[localParticipant.identity];
          return updated;
        });
      }, 3000);

      const payload = JSON.stringify({
        type: 'FLOATING_EMOJI',
        identity: localParticipant.identity,
        emoji,
      });

      await localParticipant.publishData(new TextEncoder().encode(payload), {
        reliable: false,
        topic: 'room_interactions',
      });
    },
    [localParticipant]
  );

  const handleToggleScreenShare = useCallback(async () => {
    if (!localParticipant) return;
    try {
      const isScreenSharing = localParticipant.isScreenShareEnabled;
      await localParticipant.setScreenShareEnabled(!isScreenSharing);
    } catch (err) {
      console.error('Error toggling screen share:', err);
    }
  }, [localParticipant]);

  // --- Stage Data Channel Listener (Hand Raise, Emoji, Force Mute) ---
  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload: Uint8Array) => {
      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text);

        if (data.type === 'HAND_RAISE') {
          setRaisedHandsSet((prev) => {
            const next = new Set(prev);
            if (data.raised) next.add(data.identity);
            else next.delete(data.identity);
            return next;
          });
          playHandRaise();
        }

        if (data.type === 'FLOATING_EMOJI') {
          setParticipantReactions((prev) => ({ ...prev, [data.identity]: data.emoji }));
          setTimeout(() => {
            setParticipantReactions((prev) => {
              const updated = { ...prev };
              delete updated[data.identity];
              return updated;
            });
          }, 3000);
        }

        if (data.type === 'FORCE_MUTE_PARTICIPANT') {
          if (data.targetIdentity === localParticipant?.identity) {
            if (data.kicked) {
              onLeaveRoom?.();
            } else {
              localParticipant?.setMicrophoneEnabled(!data.mute);
            }
          }
        }
      } catch (err) {
        console.error('Failed to parse incoming data channel packet:', err);
      }
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, localParticipant, onLeaveRoom, playHandRaise]);

  return (
    <>
      <RoomAudioRenderer />
      <StartAudio label="Click to allow audio playback" />

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 1,
          width: 1,
          height: '100%',
          py: 1,
        }}
      >
        <RoomAudioStage
          topicPrompt=""
          handRaised={Boolean(localParticipant && raisedHandsSet.has(localParticipant.identity))}
          raisedHandsSet={raisedHandsSet}
          participantReactions={participantReactions}
          onChangePrompt={() => { }}
          onToggleRaiseHand={handleToggleRaiseHand}
          onToggleScreenShare={handleToggleScreenShare}
          onSendReaction={handleSendReaction}
          onToggleChat={onToggleChat}
          onLeave={onLeaveRoom}
          onSettingsClick={onSettingsClick}
          onBack={onBack}
        />

        <RoomChatMain topicContext="" />
      </Box>

      <RoomChatDrawer />
    </>
  );
}

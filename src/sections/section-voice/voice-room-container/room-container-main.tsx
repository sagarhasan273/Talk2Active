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

import { useCredentials } from '@/core/slices';
import { useBoolean } from '@/hooks/use-boolean';
import { ChatMessage } from '@/types/type-room';
import { CURRENT_USER, DEMO_MESSAGES } from '../@mock_/messages-data';

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
  const { user } = useCredentials();
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const { playHandRaise } = useRoomSounds();

  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES);
  const [raisedHandsSet, setRaisedHandsSet] = useState<Set<string>>(new Set());
  const [participantReactions, setParticipantReactions] = useState<Record<string, string>>({});
  const [chatOpen, setChatOpen] = useState(false);

  const chatCollapsedBoolean = useBoolean();
  const micInitializedRef = useRef(false);

  // --- Auto-enable mic once connected if requested ---
  useEffect(() => {
    if (!localParticipant || micInitializedRef.current) return;

    localParticipant
      .setMicrophoneEnabled(true, {
        echoCancellation: true,      // Standard Acoustic Echo Cancellation
        noiseSuppression: true,      // Standard WebRTC noise suppression
        autoGainControl: true,       // Normalizes volume spikes
      })
      .then(() => {
        micInitializedRef.current = true;
      })
      .catch((err) => {
        console.warn('[RoomContainer] Microphone permission denied or initialization error:', err);
      });
  }, [localParticipant]);

  // --- Handlers ---
  const handleSendMessage = useCallback(
    async (
      text: string,
      replyToId?: string,
      privateTo?: { id: string; name: string },
      imageUrl?: string
    ) => {
      if ((!text.trim() && !imageUrl) || !localParticipant) return;

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        authorId: localParticipant.identity,
        authorName: localParticipant.name || localParticipant.identity,
        avatarUrl: CURRENT_USER.avatarUrl,
        text,
        imageUrl,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        replyToId,
        isSelf: true,
        privateTo,
        reactions: [],
      };

      setMessages((prev) => [...prev, newMsg]);

      const payload = JSON.stringify({
        type: 'CHAT_MESSAGE',
        message: { ...newMsg, isSelf: false },
      });

      const publishOptions: {
        reliable: boolean;
        topic: string;
        destinationIdentities?: string[];
      } = {
        reliable: true,
        topic: 'room_chat',
      };

      if (privateTo?.id) {
        publishOptions.destinationIdentities = [privateTo.id];
      }

      await localParticipant.publishData(new TextEncoder().encode(payload), publishOptions);
    },
    [localParticipant]
  );

  const handleEditMessage = useCallback(
    async (id: string, text: string) => {
      if (!localParticipant) return;

      const editedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, text, editedAt } : m))
      );

      const payload = JSON.stringify({
        type: 'CHAT_EDIT',
        messageId: id,
        text,
        editedAt,
      });

      await localParticipant.publishData(new TextEncoder().encode(payload), {
        reliable: true,
        topic: 'room_chat',
      });
    },
    [localParticipant]
  );

  const handleReactMessage = useCallback(
    async (id: string, emoji: string) => {
      if (!localParticipant) return;

      let decrement = false;
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          const existing = m.reactions ?? [];
          const current = existing.find((r) => r.emoji === emoji);

          if (!current) {
            return {
              ...m,
              reactions: [...existing, { emoji, count: 1, reactedBySelf: true }],
            };
          }

          decrement = Boolean(current.reactedBySelf);
          const nextCount = decrement ? current.count - 1 : current.count + 1;
          const nextReactions =
            nextCount <= 0
              ? existing.filter((r) => r.emoji !== emoji)
              : existing.map((r) => (r.emoji === emoji ? { ...r, count: nextCount } : r));

          return { ...m, reactions: nextReactions };
        })
      );

      const payload = JSON.stringify({
        type: 'CHAT_REACTION',
        messageId: id,
        emoji,
        decrement,
      });

      await localParticipant.publishData(new TextEncoder().encode(payload), {
        reliable: true,
        topic: 'room_chat',
      });
    },
    [localParticipant]
  );

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

  // --- Data Channel Listener ---
  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload: Uint8Array) => {
      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text);

        if (data.type === 'CHAT_MESSAGE') {
          setMessages((prev) =>
            prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]
          );
        }

        if (data.type === 'CHAT_EDIT') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === data.messageId ? { ...m, text: data.text, editedAt: data.editedAt } : m
            )
          );
        }

        if (data.type === 'CHAT_REACTION') {
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== data.messageId) return m;
              const existing = m.reactions ?? [];
              const current = existing.find((r) => r.emoji === data.emoji);

              if (!current) {
                return {
                  ...m,
                  reactions: [...existing, { emoji: data.emoji, count: 1, reactedBySelf: false }],
                };
              }

              const nextCount = data.decrement ? current.count - 1 : current.count + 1;
              const nextReactions =
                nextCount <= 0
                  ? existing.filter((r) => r.emoji !== data.emoji)
                  : existing.map((r) =>
                    r.emoji === data.emoji ? { ...r, count: nextCount } : r
                  );

              return { ...m, reactions: nextReactions };
            })
          );
        }

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
  }, [room, localParticipant, onLeaveRoom]);

  const currentUserId = user?.userId ?? '';

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
          onToggleChat={() => {
            chatCollapsedBoolean.onToggle();
            setChatOpen(true);
          }}
          onLeave={onLeaveRoom}
          onSettingsClick={onSettingsClick}
          onBack={onBack}
        />

        <RoomChatMain
          messages={messages}
          currentUserId={currentUserId}
          topicContext=""
          onSendMessage={handleSendMessage}
          onEditMessage={handleEditMessage}
          onReactMessage={handleReactMessage}
          collapsedBoolean={chatCollapsedBoolean}
        />
      </Box>

      <RoomChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={messages}
        currentUserId={currentUserId}
        onSendMessage={handleSendMessage}
        onEditMessage={handleEditMessage}
        onReactMessage={handleReactMessage}
      />
    </>
  );
}

export default RoomContainerMain;

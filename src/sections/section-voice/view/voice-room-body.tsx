import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
} from '@livekit/components-react';
import { Box, CircularProgress } from '@mui/material';
import { RoomEvent } from 'livekit-client';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { CURRENT_USER, DEMO_MESSAGES } from '../@mock_/messages-data';
import { VoiceRoomWorkspace } from '../voice-room-workspace';

import { RoomResponse } from '@/types/type-chat';
import type { ChatMessage, StageParticipant } from '../voice-room-workspace/types';

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

interface VoiceRoomBodyProps {
  selectedRoom: RoomResponse | null;
  token?: string | null;
  onLeaveRoom?: () => void;
}

export function VoiceRoomBody({ selectedRoom, token, onLeaveRoom }: VoiceRoomBodyProps) {
  if (!token || !selectedRoom) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={LIVEKIT_URL}
      token={token}
      audio={false}
      video={false}
      onDisconnected={onLeaveRoom}
    >
      <RoomAudioRenderer />
      <LiveKitRoomContent selectedRoom={selectedRoom} onLeaveRoom={onLeaveRoom} />
    </LiveKitRoom>
  );
}

function LiveKitRoomContent({
  selectedRoom,
  onLeaveRoom,
}: {
  selectedRoom: RoomResponse;
  onLeaveRoom?: () => void;
}) {
  const room = useRoomContext();
  const remoteParticipants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES);
  const [raisedHandsSet, setRaisedHandsSet] = useState<Set<string>>(new Set());

  // --------------------------------------------------------------------------
  // Incoming Data Channel Packet Listener
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload: Uint8Array) => {
      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text);

        // 1. Send Message
        if (data.type === 'CHAT_MESSAGE') {
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
        }

        // 2. Edit Message
        if (data.type === 'CHAT_EDIT') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === data.messageId ? { ...m, text: data.text, editedAt: data.editedAt } : m
            )
          );
        }

        // 3. React to Message
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
                  : existing.map((r) => (r.emoji === data.emoji ? { ...r, count: nextCount } : r));

              return { ...m, reactions: nextReactions };
            })
          );
        }

        // 4. Hand Raise
        if (data.type === 'HAND_RAISE') {
          setRaisedHandsSet((prev) => {
            const next = new Set(prev);
            if (data.raised) next.add(data.identity);
            else next.delete(data.identity);
            return next;
          });
        }

        // 5. Host Force Mute
        if (data.type === 'FORCE_MUTE_PARTICIPANT') {
          if (data.targetIdentity === localParticipant?.identity) {
            localParticipant?.setMicrophoneEnabled(!data.mute);
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
  }, [room, localParticipant]);

  // Map participants for Audio Stage & User Profile
  const participants: StageParticipant[] = useMemo(() => {
    return remoteParticipants.map((p) => {
      const isSelf = p.identity === localParticipant?.identity;
      const isSpeaking = p.isSpeaking;
      const handRaised = raisedHandsSet.has(p.identity);

      let audioState: 'speaking' | 'unmuted' | 'muted' | 'listening' = 'muted';
      if (isSpeaking) {
        audioState = 'speaking';
      } else if (p.isMicrophoneEnabled) {
        audioState = 'unmuted';
      }

      return {
        id: p.identity,
        name: p.name || p.identity,
        avatarUrl: (p.metadata && JSON.parse(p.metadata)?.avatarUrl) || '',
        level: 'Member',
        audioState,
        isSpeaking,
        handRaised,
        isHost: String(selectedRoom.host?.userId) === p.identity,
        isSelf,
        role: String(selectedRoom.host?.userId) === p.identity ? 'host' : 'listener',
      };
    });
  }, [remoteParticipants, localParticipant, raisedHandsSet, selectedRoom]);

  // --------------------------------------------------------------------------
  // Outgoing Actions (Broadcast to Room)
  // --------------------------------------------------------------------------

  // 1. Send Message
  const handleSendMessage = useCallback(
    async (text: string, replyToId?: string, privateTo?: { id: string; name: string }) => {
      if (!text.trim() || !localParticipant) return;

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        authorId: localParticipant.identity,
        authorName: localParticipant.name || localParticipant.identity,
        avatarUrl: CURRENT_USER.avatarUrl,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        replyToId,
        isSelf: true,
        privateTo,
        reactions: [],
      };

      // Update locally
      setMessages((prev) => [...prev, newMsg]);

      // Broadcast over LiveKit data channel
      const payload = JSON.stringify({
        type: 'CHAT_MESSAGE',
        message: { ...newMsg, isSelf: false },
      });

      await localParticipant.publishData(new TextEncoder().encode(payload), {
        reliable: true,
        topic: 'room_chat',
      });
    },
    [localParticipant]
  );

  // 2. Edit Message
  const handleEditMessage = useCallback(
    async (id: string, text: string) => {
      if (!localParticipant) return;

      const editedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text, editedAt } : m)));

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

  // 3. React to Message
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
              : existing.map((r) =>
                  r.emoji === emoji ? { ...r, count: nextCount, reactedBySelf: !decrement } : r
                );

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

  const handleToggleMic = async (muted: boolean) => {
    if (localParticipant) {
      await localParticipant.setMicrophoneEnabled(!muted);
    }
  };

  const handleToggleDeafen = async (deafened: boolean) => {
    if (deafened && localParticipant) {
      await localParticipant.setMicrophoneEnabled(false);
    }
    remoteParticipants.forEach((p) => {
      if (!p.isLocal) {
        p.audioTrackPublications.forEach((pub) => {
          if (pub.track && 'setVolume' in pub.track) {
            (pub.track as any).setVolume(deafened ? 0 : 1);
          }
        });
      }
    });
  };

  const handleToggleRaiseHand = async (raised: boolean) => {
    if (!localParticipant) return;

    const payload = JSON.stringify({
      type: 'HAND_RAISE',
      identity: localParticipant.identity,
      raised,
    });

    await localParticipant.publishData(new TextEncoder().encode(payload), {
      reliable: true,
      topic: 'room_interactions',
    });

    setRaisedHandsSet((prev) => {
      const next = new Set(prev);
      if (raised) next.add(localParticipant.identity);
      else next.delete(localParticipant.identity);
      return next;
    });
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <VoiceRoomWorkspace
        participants={participants}
        maxParticipants={selectedRoom.max_participants || 10}
        topicPrompt={selectedRoom.topic || 'Welcome to the room'}
        onChangePrompt={() => {}}
        onToggleMic={handleToggleMic}
        onToggleDeafen={handleToggleDeafen}
        onToggleRaiseHand={handleToggleRaiseHand}
        onOpenReactions={() => {}}
        onLeave={onLeaveRoom}
        currentUserId={localParticipant?.identity || CURRENT_USER.id}
        currentUserName={localParticipant?.name || CURRENT_USER.name}
        initialMessages={messages}
        onSendMessage={handleSendMessage}
        onEditMessage={handleEditMessage}
        onReactMessage={handleReactMessage}
      />
    </Box>
  );
}

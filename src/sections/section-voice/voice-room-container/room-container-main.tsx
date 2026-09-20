// src/sections/section-voice/view/voice-room-body.tsx


import { Box } from '@mui/material';
import { useEffect, useState } from 'react';

import { VoiceRoomUserProfile } from '../voice-room-user-profile';


import {
  useLocalParticipant,
  useParticipants,
  useRoomContext
} from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { useCallback, useMemo } from 'react';

import { useCredentials } from '@/core/slices';
import { useBoolean } from '@/hooks/use-boolean';
import { RoomType } from '@/types/type-chat';
import { CURRENT_USER, DEMO_MESSAGES } from '../@mock_/messages-data';
import RoomAudioStage from '../voice-room-audio-stage/room-audio-stage';
import RoomChatDrawer from '../voice-room-audio-stage/room-chat-drawer';
import { ChatMessage, ParticipantStageType } from '../voice-room-audio-stage/types';
import { VoiceRoomChat } from '../voice-room-chat/voice-room-chat';

interface RoomContainerMainProps {
  selectedRoom: RoomType | null;
  token?: string | null;
  onLeaveRoom?: () => void;
  onSettingsClick?: () => void;
  onBack?: () => void;
}

export function RoomContainerMain({ selectedRoom, onLeaveRoom, onSettingsClick, onBack }: RoomContainerMainProps) {
  const { user } = useCredentials();

  const room = useRoomContext();
  const remoteParticipants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES);
  const [raisedHandsSet, setRaisedHandsSet] = useState<Set<string>>(new Set());
  const [participantReactions, setParticipantReactions] = useState<Record<string, string>>({});

  const [micMuted, setMicMuted] = useState(true);
  const [deafened, setDeafened] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ParticipantStageType | null>(null);

  // Collapse state for presentation screen
  const chatCollapsedBoolean = useBoolean();

  const participants: ParticipantStageType[] = useMemo(() => {
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

      let parsedMeta: Record<string, any> = {};
      try {
        if (p.metadata) parsedMeta = JSON.parse(p.metadata);
      } catch {
        // Fallback default
      }

      return {
        id: p.identity,
        name: p.name || p.identity,
        avatarUrl: parsedMeta.avatarUrl || '',
        level: parsedMeta.level || 'Member',
        audioState,
        isSpeaking,
        handRaised,
        activeReactionEmoji: participantReactions[p.identity] || null,
        isHost: String(selectedRoom?.host?.userId) === p.identity,
        isSelf,
        role: String(selectedRoom?.host?.userId) === p.identity ? 'host' : 'listener',
      };
    });
  }, [remoteParticipants, localParticipant, raisedHandsSet, participantReactions, selectedRoom]);

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

      const publishOptions: { reliable: boolean; topic: string; destinationIdentities?: string[] } = {
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

  const handleToggleMic = async () => {
    if (!localParticipant) return;
    const nextMuted = !micMuted;
    await localParticipant.setMicrophoneEnabled(!nextMuted);
    setMicMuted(nextMuted);
  };

  const handleToggleDeafen = () => {
    const nextDeafened = !deafened;
    setDeafened(nextDeafened);

    if (nextDeafened && localParticipant) {
      localParticipant.setMicrophoneEnabled(false);
      setMicMuted(true);
    }

    remoteParticipants.forEach((p) => {
      if (!p.isLocal) {
        p.audioTrackPublications.forEach((pub) => {
          if (pub.track && 'setVolume' in pub.track) {
            (pub.track as any).setVolume(nextDeafened ? 0 : 1);
          }
        });
      }
    });
  };

  const handleToggleRaiseHand = async () => {
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
  };

  const handleSendReaction = async (emoji: string) => {
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
  };

  const handleToggleScreenShare = async () => {
    if (!localParticipant) return;
    try {
      const isScreenSharing = localParticipant.isScreenShareEnabled;
      await localParticipant.setScreenShareEnabled(!isScreenSharing);
    } catch (err) {
      console.error('Error toggling screen share:', err);
    }
  };

  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload: Uint8Array) => {
      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text);

        if (data.type === 'CHAT_MESSAGE') {
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
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
                  : existing.map((r) => (r.emoji === data.emoji ? { ...r, count: nextCount } : r));

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
        }

        if (data.type === 'FLOATING_EMOJI') {
          setParticipantReactions((prev) => ({
            ...prev,
            [data.identity]: data.emoji,
          }));

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
              setMicMuted(Boolean(data.mute));
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

  useEffect(() => {
    if (localParticipant) {
      setMicMuted(!localParticipant.isMicrophoneEnabled);
    }
  }, [localParticipant]);

  return (
    <>
      <Box
        sx={{
          width: 1,
          height: 1,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 1,
            alignItems: 'stretch',
            width: 1,
            height: { xs: 1, md: '75vh' },
            minHeight: { md: '65vh' },
          }}
        >
          {/* Main Voice, Presentation & Video Stage */}
          <RoomAudioStage
            participants={participants}
            maxParticipants={selectedRoom?.max_participants || 0}
            topicPrompt={''}
            micMuted={micMuted}
            deafened={deafened}
            handRaised={Boolean(localParticipant && raisedHandsSet.has(localParticipant.identity))}
            onChangePrompt={() => { }}
            onToggleMic={handleToggleMic}
            onToggleDeafen={handleToggleDeafen}
            onToggleRaiseHand={handleToggleRaiseHand}
            onToggleScreenShare={handleToggleScreenShare}
            onSendReaction={handleSendReaction}
            onToggleChat={() => {
              chatCollapsedBoolean.onToggle();
              setChatOpen(true);
            }}
            onLeave={onLeaveRoom}
            onProfileClick={(p) => {
              setSelectedUser({ ...p });
              setProfileDrawerOpen(true);
            }}
            onSettingsClick={onSettingsClick}
            onBack={onBack}
          />

          {/* Desktop Chat: Expanded vs 20px Collapsed Rail */}
          <VoiceRoomChat
            messages={messages}
            currentUserId={user.userId}
            topicContext={''}
            participants={participants}
            onSendMessage={handleSendMessage}
            onEditMessage={handleEditMessage}
            onReactMessage={handleReactMessage}
            collapsedBoolean={chatCollapsedBoolean}
          />
        </Box>

        {/* Mobile Bottom Chat Sheet */}
        <RoomChatDrawer
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          messages={messages}
          currentUserId={user.userId}
          participants={participants}
          onSendMessage={handleSendMessage}
          onEditMessage={handleEditMessage}
          onReactMessage={handleReactMessage}
        />
      </Box>

      {/* User Profile Modal Drawer */}
      <VoiceRoomUserProfile
        open={profileDrawerOpen}
        onClose={() => {
          setProfileDrawerOpen(false);
          // setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </>
  );
}

export default RoomContainerMain;

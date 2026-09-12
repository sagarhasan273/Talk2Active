// src/sections/section-voice-room/voice-room-view.tsx

import { useState } from 'react';

import { Box } from '@mui/material';

import { VoiceRoomJoinGate } from './voice-room-join-gate';
import { VoiceRoomWorkspace } from '../voice-room-workspace';
import { ROOM, CURRENT_USER, DEMO_MESSAGES, INITIAL_PARTICIPANTS } from '../@mock_/messages-data';

import type { StageParticipant } from '../voice-room-workspace/types';

const SELF_ID = CURRENT_USER.id;

export function VoiceRoomBody() {
  const [hasJoined, setHasJoined] = useState(false);

  const [participants, setParticipants] = useState(INITIAL_PARTICIPANTS);
  const [log, setLog] = useState<string[]>([]);

  const pushLog = (entry: string): void => {
    setLog((prev) => [entry, ...prev].slice(0, 6));
  };

  const updateSelf = (patch: Partial<StageParticipant>) =>
    setParticipants((prev) => prev.map((p) => (p.id === SELF_ID ? { ...p, ...patch } : p)));

  const onJoinRoom = () => {
    pushLog('Joined the room');
    setHasJoined(true);
  };

  const onChangePrompt = () => pushLog('Change prompt clicked');

  const onToggleMic = (muted: boolean) => {
    pushLog(`Mic ${muted ? 'muted' : 'unmuted'}`);
    updateSelf({ audioState: muted ? 'muted' : 'unmuted' });
  };

  const onToggleDeafen = (deafened: boolean) => pushLog(`Deafen ${deafened ? 'on' : 'off'}`);

  const onToggleRaiseHand = (raised: boolean) => {
    pushLog(`Hand ${raised ? 'raised' : 'lowered'}`);
    updateSelf({ handRaised: raised });
  };

  const onOpenReactions = () => pushLog('Reactions opened');
  const onLeave = () => pushLog('Left the call');
  const onSendMessage = (text: string, replyToId?: string) =>
    pushLog(`Sent: "${text}"${replyToId ? ` (reply)` : ''}`);

  return (
    <Box sx={{ position: 'relative' }}>
      {!hasJoined && (
        <VoiceRoomJoinGate
          roomTopic={ROOM.topicPrompt}
          participantCount={participants.length}
          maxParticipants={ROOM.maxParticipants}
          onJoin={onJoinRoom}
        />
      )}

      {/* Room stays mounted (audio/video can preload) but is frozen and
          blurred behind the gate until the user confirms they want in. */}
      <Box
        aria-hidden={!hasJoined}
        sx={{
          transition: (theme) =>
            theme.transitions.create(['filter', 'opacity'], {
              duration: 250,
            }),
          filter: hasJoined ? 'none' : 'blur(6px)',
          opacity: hasJoined ? 1 : 0.6,
          pointerEvents: hasJoined ? 'auto' : 'none',
          userSelect: hasJoined ? 'auto' : 'none',
        }}
      >
        <VoiceRoomWorkspace
          participants={participants}
          maxParticipants={ROOM.maxParticipants}
          topicPrompt={ROOM.topicPrompt}
          onChangePrompt={onChangePrompt}
          onToggleMic={onToggleMic}
          onToggleDeafen={onToggleDeafen}
          onToggleRaiseHand={onToggleRaiseHand}
          onOpenReactions={onOpenReactions}
          onLeave={onLeave}
          currentUserId={CURRENT_USER.id}
          currentUserName={CURRENT_USER.name}
          initialMessages={DEMO_MESSAGES}
          onSendMessage={onSendMessage}
        />

        {/* Action log — for demo purposes only, remove in the real app */}
        <Box
          sx={{
            my: 2,
            p: 1.5,
            borderRadius: 1,
            bgcolor: 'background.paper',
            border: `1px solid`,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            typography: 'caption',
            color: 'text.secondary',
            overflowX: 'auto',
          }}
        >
          {log.length === 0 ? 'Interact with the dock to see callbacks fire...' : log.join('  ·  ')}
        </Box>
      </Box>
    </Box>
  );
}

import React, { useState } from 'react';

import { Box } from '@mui/material';

import { RoomWorkspace } from './room-workspace';
import { CURRENT_USER, DEMO_MESSAGES } from './messages-data';

import type { StageParticipant } from './types';

const INITIAL_PARTICIPANTS: StageParticipant[] = [
  {
    id: 'u1',
    name: 'Sagar Hasan',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    audioState: 'speaking',
    isHost: true,
  },
  {
    id: 'u2',
    name: 'Anna K.',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    level: 'Fluent (C1)',
    audioState: 'unmuted',
  },
  {
    id: 'u3',
    name: 'Marcus V.',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    level: 'Learner (B1)',
    audioState: 'muted',
  },
  {
    id: 'u4',
    name: 'Sarah M.',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    audioState: 'muted',
    isSelf: true,
    handRaised: true,
  },
  {
    id: 'u5',
    name: 'Kenji T.',
    avatarUrl:
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    level: 'Learner (B2)',
    audioState: 'listening',
  },
];

const ROOM = {
  maxParticipants: 8,
  topicPrompt: 'What is one country you wish to visit next year and why?',
};

const SELF_ID = CURRENT_USER.id;

/**
 * Demo call screen. Wires mock room/participant/chat data into
 * RoomWorkspace and shows how each callback would typically be handled.
 * Drop this in a route or a Storybook story to preview the whole thing —
 * try resizing the sidebar (desktop) and opening chat via the dock's
 * message icon (mobile / narrow viewport).
 */
export const VoiceStageDemo = () => {
  const [participants, setParticipants] = useState(INITIAL_PARTICIPANTS);
  const [log, setLog] = useState<string[]>([]);

  const pushLog = (entry: string) => setLog((prev) => [entry, ...prev].slice(0, 6));

  const updateSelf = (patch: Partial<StageParticipant>) =>
    setParticipants((prev) => prev.map((p) => (p.id === SELF_ID ? { ...p, ...patch } : p)));

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
    <Box sx={{}}>
      <RoomWorkspace
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
  );
};

export default VoiceStageDemo;

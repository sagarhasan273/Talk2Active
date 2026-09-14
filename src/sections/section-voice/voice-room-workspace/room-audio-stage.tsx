import { Box } from '@mui/material';
import { useState } from 'react';

import { VoiceRoomUserCard } from '../voice-room-user-card';
import { RoomControlDock } from './room-control-dock';
import { EmptySlotTile } from './room-empty-slot-tile';
import { PromptBanner } from './room-prompt-banner';

import type { RoomAudioStageProps } from './types';

export const RoomAudioStage = ({
  topicPrompt,
  onChangePrompt,
  participants,
  maxParticipants,
  onInviteSlot,
  onLeave,
  onOpenReactions,
  onToggleChat,
  onToggleMic,
  onToggleDeafen,
  onToggleRaiseHand,
  onProfileClick,
}: RoomAudioStageProps) => {
  const [micMuted, setMicMuted] = useState(true);
  const [deafened, setDeafened] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  const openSlots = Math.max(maxParticipants - participants.length, 0);

  const handleToggleMic = () => {
    const next = !micMuted;
    setMicMuted(next);
    onToggleMic?.(next);
  };

  const handleToggleDeafen = () => {
    const next = !deafened;
    setDeafened(next);
    onToggleDeafen?.(next);
  };

  const handleToggleRaiseHand = () => {
    const next = !handRaised;
    setHandRaised(next);
    onToggleRaiseHand?.(next);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: { xs: 1.5, sm: 2 },
        borderRadius: 1,
        bgcolor: 'background.paper',
        border: `1px solid`,
        borderColor: 'divider',
        width: '100%',
      }}
    >
      <PromptBanner prompt={topicPrompt} onChangePrompt={onChangePrompt} />

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'grid',
          alignContent: 'center',
          justifyItems: 'stretch',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        {participants.map((participant) => (
          <VoiceRoomUserCard
            key={participant.id}
            participant={{
              userId: participant.id,
              name: participant.name,
              profilePhoto: participant.avatarUrl || '',
              status: 'online',
              isSpeaking: Boolean(participant.isSpeaking),
              isMuted: participant.audioState === 'muted',
              userType: participant.role || 'member',
              verified: true,
              accountType: 'member',
              connectionStatus: 'connected',
              isLocal: participant.isSelf ?? false,
              hasJoin: true,
            }}
            size="medium"
            stream={null}
            onClick={() => onProfileClick?.(participant)}
          />
        ))}

        {openSlots > 0 && (
          <EmptySlotTile
            openSlots={openSlots}
            maxParticipants={maxParticipants}
            onClick={onInviteSlot}
          />
        )}
      </Box>

      <RoomControlDock
        micMuted={micMuted}
        deafened={deafened}
        handRaised={handRaised}
        onToggleMic={handleToggleMic}
        onToggleDeafen={handleToggleDeafen}
        onToggleRaiseHand={handleToggleRaiseHand}
        onOpenReactions={onOpenReactions}
        onToggleChat={onToggleChat}
        onLeave={onLeave}
      />
    </Box>
  );
};

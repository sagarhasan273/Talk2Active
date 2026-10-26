// src/sections/section-voice/voice-main-view.tsx

import { useVoiceRoomSetting, useVoiceRoomStorage } from '@/core/contexts';
import { Box } from '@mui/material'; // <-- Ensure Box is imported
import { useMemo } from 'react';
import { useCredentials } from 'src/core/slices';
import { useRoomTools } from 'src/core/slices/slice-room';
import { useBoolean } from 'src/hooks/use-boolean';
import { VoiceRoomLayout } from 'src/layouts/voice-room';
import { VoiceModalCreateRoom } from '../voice-modal-create-room';
import { RoomContainerMain } from '../voice-room-container';
import { VoiceRoomActiveBar } from '../voice-room-header/room-header-active-bar';
import { RoomlistMain } from '../voice-room-list';
import VoiceRoomEventListener from './voice-room-event-listener';
import { VoiceRoomJoinGate } from './voice-room-join-gate';

export function VoiceMainView() {
  const { user } = useCredentials();
  const { room } = useRoomTools();

  const editRoomBoolean = useBoolean();

  const { selectedRoom } = useVoiceRoomStorage();
  const {
    isInRoom,
    isJoinGateOpen,
    selectedTab,
    handleSelectRoom,
    handleCancelJoin,
    handleJoinRoom,
    handleLeaveRoom,
    handleBackToRooms,
  } = useVoiceRoomSetting();

  const header = useMemo(() => {
    if (isInRoom && room && selectedTab === 'room-list') {
      return (
        <VoiceRoomActiveBar
          room={room}
          onEnterRoom={() => handleBackToRooms()}
          onLeaveRoom={handleLeaveRoom}
        />
      );
    }
    return null;
  }, [
    isInRoom,
    room,
    selectedTab,
    handleBackToRooms,
    handleLeaveRoom,
  ]);

  const mainContent = (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', flex: 1, minHeight: 0 }}>
      {selectedTab === 'room-list' && <RoomlistMain
        onSelectRoom={handleSelectRoom}
        isVisible={selectedTab === 'room-list'}
      />}

      {/* ── Room Stage Tab ── */}
      {selectedTab !== 'room-list' && <RoomContainerMain
        onLeaveRoom={handleLeaveRoom}
        onSettingsClick={editRoomBoolean.onTrue}
        onBack={handleBackToRooms}
      />}
    </Box>
  );

  return (
    <>
      <VoiceRoomEventListener />
      <VoiceRoomLayout
        header={header}
        fixedHeader={Boolean(isInRoom && selectedTab === 'room-list')}
        mainContent={mainContent}
        maxWidth={selectedTab === 'room-space' ? 'xl' : 'lg'}
      />

      {isJoinGateOpen && selectedRoom && (
        <VoiceRoomJoinGate
          userName={user?.name}
          roomTopic={selectedRoom.topic}
          participantCount={selectedRoom.participants.length}
          maxParticipants={selectedRoom.max_participants}
          participants={selectedRoom.participants}
          onJoin={handleJoinRoom}
          onCancel={handleCancelJoin}
        />
      )}

      <VoiceModalCreateRoom
        open={editRoomBoolean.value}
        onClose={editRoomBoolean.onFalse}
        currentRoom={selectedRoom}
      />
    </>
  );
}

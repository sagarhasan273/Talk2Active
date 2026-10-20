// src/sections/section-voice/voice-main-view.tsx
import { useLiveKitSession } from '@/core/contexts/app-context/context-livekit';

import { useVoiceRoomSetting, useVoiceRoomStorage } from '@/core/contexts';
import { Box } from '@mui/material'; // <-- Ensure Box is imported
import { useCallback, useMemo } from 'react';
import { useCredentials } from 'src/core/slices';
import { useRoomTools } from 'src/core/slices/slice-room';
import { useBoolean } from 'src/hooks/use-boolean';
import { VoiceRoomLayout } from 'src/layouts/voice-room';
import { VoiceModalCreateRoom } from '../voice-modal-create-room';
import { RoomContainerMain } from '../voice-room-container';
import { VoiceRoomActiveBar } from '../voice-room-header/room-header-active-bar';
import { isParticipantSpeaking } from '../voice-room-header/utils';
import { RoomlistMain } from '../voice-room-list';
import VoiceRoomEventListener from './voice-room-event-listener';
import { VoiceRoomJoinGate } from './voice-room-join-gate';

export function VoiceMainView() {
  const { isAuthenticated, user } = useCredentials();
  const { isInRoom } = useLiveKitSession();
  const { room } = useRoomTools();

  const editRoomBoolean = useBoolean();
  const isAuthOpen = useBoolean();

  const { selectedRoom } = useVoiceRoomStorage();
  const {
    isJoinGateOpen,
    selectedTab,
    handleSelectRoom,
    handleCancelJoin,
    handleJoinRoom,
    handleLeaveRoom,
    handleBackToRooms,
  } = useVoiceRoomSetting();

  const participants = useMemo(() => room?.participants || [], [room]);

  const currentSpeaker = useMemo(
    () => participants.find((participant) => isParticipantSpeaking(participant)) || null,
    [participants]
  );

  const handleCreateRoom = useCallback(() => {
    if (!isAuthenticated) {
      isAuthOpen.onTrue();
      return;
    }
    editRoomBoolean.onTrue();
  }, [isAuthenticated, isAuthOpen, editRoomBoolean]);

  const header = useMemo(() => {
    if (isInRoom && room && selectedTab === 'room-list') {
      return (
        <VoiceRoomActiveBar
          room={room}
          participants={participants}
          currentSpeaker={currentSpeaker}
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
    participants,
    currentSpeaker,
    handleBackToRooms,
    handleLeaveRoom,
  ]);

  const mainContent = (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', flex: 1, minHeight: 0 }}>
      {/* ── Room List Tab (Stacked via absolute positioning to preserve scroll DOM) ── */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: selectedTab === 'room-list' ? 1 : 0,
          pointerEvents: selectedTab === 'room-list' ? 'auto' : 'none',
          zIndex: selectedTab === 'room-list' ? 2 : 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <RoomlistMain
          onSelectRoom={handleSelectRoom}
          onCreateRoom={handleCreateRoom}
          isVisible={selectedTab === 'room-list'}
        />
      </Box>

      {/* ── Room Stage Tab ── */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: selectedTab !== 'room-list' ? 1 : 0,
          pointerEvents: selectedTab !== 'room-list' ? 'auto' : 'none',
          zIndex: selectedTab !== 'room-list' ? 2 : 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <RoomContainerMain
          onLeaveRoom={handleLeaveRoom}
          onSettingsClick={editRoomBoolean.onTrue}
          onBack={handleBackToRooms}
        />
      </Box>
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
        onCreateRoom={() => { }}
        currentRoom={room}
      />
    </>
  );
}

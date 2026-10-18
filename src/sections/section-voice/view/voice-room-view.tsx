// src/sections/section-voice/voice-main-view.tsx

import { useLiveKitSession } from '@/core/contexts/context-livekit';
import { RoomChatProvider } from '@/core/contexts/context-room-chat';
import { VoiceRoomActionProvider, useVoiceRoomAction } from '@/core/contexts/context-voice-room-action';
import RoomLoadingFallback from '@/sections/section-common/room-loading-fallback';
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
import { VoiceRoomListener } from '../voice-room-listener';
import { VoiceTabPanel } from '../voice-tab-panel';
import { VoiceRoomJoinGate } from './voice-room-join-gate';

function VoiceMainContent() {
  const { isAuthenticated, user } = useCredentials();
  const { isInRoom } = useLiveKitSession();
  const { room } = useRoomTools();

  const editRoomBoolean = useBoolean();
  const isAuthOpen = useBoolean();

  const {
    selectedRoom,
    livekitToken,
    isJoinGateOpen,
    selectedTab,
    handleSelectRoom,
    handleCancelJoin,
    handleJoinRoom,
    handleLeaveRoom,
    handleBackToRooms,
  } = useVoiceRoomAction();

  const participants = useMemo(() => (room?.participants || []), [room]);

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
          onEnterRoom={() => handleBackToRooms()} // or switch tab
          onLeaveRoom={handleLeaveRoom}
        />
      );
    }
    return null;
  }, [isInRoom, room, selectedTab, participants, currentSpeaker, handleBackToRooms, handleLeaveRoom]);

  const mainContent = (
    <RoomChatProvider>
      <VoiceTabPanel value={selectedTab === 'room-list' ? 0 : 1} index={0}>
        <RoomlistMain
          onSelectRoom={handleSelectRoom}
          onCreateRoom={handleCreateRoom}
        />
      </VoiceTabPanel>

      <VoiceTabPanel value={selectedTab !== 'room-list' ? 1 : 0} index={1}>
        {livekitToken && room?.roomId ? (
          <RoomContainerMain
            key={room.roomId}
            token={livekitToken}
            onLeaveRoom={handleLeaveRoom}
            onSettingsClick={editRoomBoolean.onTrue}
            onBack={handleBackToRooms}
          />
        ) : <RoomLoadingFallback />}
      </VoiceTabPanel>
    </RoomChatProvider>
  );

  return (
    <>
      <VoiceRoomListener />
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

export function VoiceMainView() {
  const isAuthOpen = useBoolean();

  return (
    <VoiceRoomActionProvider onOpenAuth={isAuthOpen.onTrue}>
      <VoiceMainContent />
    </VoiceRoomActionProvider>
  );
}

export default VoiceMainView;

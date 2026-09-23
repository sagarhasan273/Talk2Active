import type { RoomType } from '@/types/type-room';
import type { SelectedTabType, VoiceParticipant } from '../voice-room-header/types';

import { useCallback, useMemo, useState } from 'react';

import { useJoinRoomMutation, useLeaveRoomMutation } from '@/core/apis';
import { toastErrorResponse } from '@/utils/response';
import { useCredentials } from 'src/core/slices';
import { useRoomTools } from 'src/core/slices/slice-room';
import { useBoolean } from 'src/hooks/use-boolean';
import { VoiceRoomLayout } from 'src/layouts/voice-room';

import { useLiveKitSession } from '@/core/contexts/context-livekit';
import { VoiceModalCreateRoom } from '../voice-modal-create-room';
import { RoomContainerMain } from '../voice-room-container';
import { VoiceRoomActiveBar } from '../voice-room-header/room-header-active-bar';
import { isParticipantSpeaking } from '../voice-room-header/utils';
import { RoomlistMain } from '../voice-room-list';
import { VoiceTabPanel } from '../voice-tab-panel';
import { VoiceRoomJoinGate } from './voice-room-join-gate';

export function VoiceMainView() {
  const { user, isAuthenticated } = useCredentials();
  const { connectToRoom, disconnectRoom, isInRoom } = useLiveKitSession();
  const { room, setRoom, resetRoom } = useRoomTools();

  const editRoomBoolean = useBoolean();
  const isAuthOpen = useBoolean();

  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [isJoinGateOpen, setIsJoinGateOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<SelectedTabType>('room-list');

  const [joinRoomMutation] = useJoinRoomMutation();
  const [leaveRoomMutation] = useLeaveRoomMutation();

  const participants = useMemo(() => (room?.participants || []) as VoiceParticipant[], [room]);

  const currentSpeaker = useMemo(
    () => participants.find((participant) => isParticipantSpeaking(participant)) || null,
    [participants]
  );

  const handleSelectRoom = useCallback(
    (roomSelected: RoomType) => {
      if (!isAuthenticated) {
        isAuthOpen.onTrue();
        return;
      }
      setSelectedRoom(roomSelected);
      setIsJoinGateOpen(true);
    },
    [isAuthenticated, isAuthOpen]
  );

  const handleCancelJoin = useCallback(() => {
    setIsJoinGateOpen(false);
    setSelectedRoom(null);
  }, []);

  const handleJoinRoom = useCallback(async () => {
    if (!selectedRoom || !user) return;

    if (isInRoom) { await handleLeaveRoom() }

    try {
      const response = await joinRoomMutation({
        roomId: selectedRoom.roomId,
        userId: user.userId,
      }).unwrap();

      if (response.status && response.data.token) {
        setRoom(response.data.room);
        setLivekitToken(response.data.token);
        setIsJoinGateOpen(false);
        setSelectedTab('room-space');
        await connectToRoom(response.data.token);
      }
    } catch (error) {
      toastErrorResponse(error);
    }
  }, [selectedRoom, user, joinRoomMutation, setRoom, connectToRoom]);

  const handleBackToRooms = useCallback(() => {
    setSelectedTab('room-list');
  }, []);

  const handleLeaveRoom = useCallback(async () => {
    // 1. Cache IDs before wiping state
    const currentRoomId = room?.roomId;
    const currentUserId = user?.userId;

    // 2. Disconnect WebRTC first
    try {
      await disconnectRoom();
    } catch (err) {
      console.warn('LiveKit disconnect warning:', err);
    }

    // 3. Reset local view state
    setSelectedTab('room-list');
    setSelectedRoom(null);
    setLivekitToken(null);
    setIsJoinGateOpen(false);
    resetRoom();

    // 4. Send leave request to backend API
    if (currentRoomId && currentUserId) {
      try {
        await leaveRoomMutation({ roomId: currentRoomId, userId: currentUserId }).unwrap();
      } catch (err) {
        console.warn('Failed to leave room on backend:', err);
      }
    }
  }, [room?.roomId, user?.userId, disconnectRoom, setRoom, leaveRoomMutation]);

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
          onEnterRoom={() => setSelectedTab('room-space')}
          onLeaveRoom={handleLeaveRoom}
        />
      );
    }

    return null;
  }, [isInRoom, room, selectedTab, participants, currentSpeaker, handleLeaveRoom]);

  const mainContent = (
    <>
      <VoiceTabPanel value={selectedTab === 'room-list' ? 0 : 1} index={0}>
        <RoomlistMain
          onSelectRoom={handleSelectRoom}
          onCreateRoom={handleCreateRoom}
        />
      </VoiceTabPanel>

      <VoiceTabPanel value={selectedTab !== 'room-list' ? 1 : 0} index={1}>
        {/* Only mount when active token and room exist. The key forces complete destruction on switch */}
        {livekitToken && room?.roomId ? (
          <RoomContainerMain
            key={room.roomId}
            token={livekitToken}
            onLeaveRoom={handleLeaveRoom}
            onSettingsClick={editRoomBoolean.onTrue}
            onBack={handleBackToRooms}
          />
        ) : null}
      </VoiceTabPanel>
    </>
  );

  return (
    <>
      <VoiceRoomLayout
        header={header}
        fixedHeader={Boolean(isInRoom && selectedTab === 'room-list')}
        mainContent={mainContent}
        maxWidth={selectedTab === 'room-space' ? 'xl' : 'lg'}
      />

      {isJoinGateOpen && selectedRoom && (
        <VoiceRoomJoinGate
          roomTopic={selectedRoom.topic}
          participantCount={selectedRoom.participants.length}
          maxParticipants={selectedRoom.max_participants}
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

export default VoiceMainView;

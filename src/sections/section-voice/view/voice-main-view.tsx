// src/sections/section-voice/view/voice-main-view.tsx

import type { RoomResponse } from 'src/types/type-chat';
import type { SelectedTabType, VoiceParticipant } from '../voice-room-header/types';

import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Box } from '@mui/material';

import { useJoinRoomMutation } from '@/core/apis';
import { toastErrorResponse } from '@/utils/response';
import { useCredentials } from 'src/core/slices';
import { useRoomTools } from 'src/core/slices/slice-room';
import { useBoolean } from 'src/hooks/use-boolean';
import { VoiceRoomLayout } from 'src/layouts/voice-room';

import { useLiveKitSession } from '@/core/contexts/livekit-context';
import VoiceButtonSocialChat from '../voice-button-social-chat';
import { FilterState, VoiceRoomsFilter } from '../voice-filter-rooms';
import { VoiceModalCreateRoom } from '../voice-modal-create-room';
import { VoiceRoomActiveBar } from '../voice-room-header/room-header-active-bar';
import { DefaultHeader } from '../voice-room-header/room-header-default';
import { isParticipantSpeaking } from '../voice-room-header/utils';
import { VoiceTabPanel } from '../voice-tab-panel';
import { VoiceRoomJoinGate } from './voice-room-join-gate';
import VoiceRoomlist from './voice-room-list';
import { VoiceRoomBody } from './voice-room-space';

export function VoiceMainView() {
  const { user, isAuthenticated } = useCredentials();
  const { connectToRoom, disconnectRoom, isInRoom } = useLiveKitSession();
  const { room, setRoom } = useRoomTools();

  const editRoomBoolean = useBoolean();
  const isAuthOpen = useBoolean();


  const [selectedRoom, setSelectedRoom] = useState<RoomResponse | null>(null);
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [isJoinGateOpen, setIsJoinGateOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<SelectedTabType>('room-list');

  const [filterRooms, setFilterRooms] = useState<FilterState>({
    searchQuery: '',
    selectedLanguage: 'all',
    selectedLevel: 'all',
    hideFullRooms: false,
    showActiveOnly: false,
  });

  const [joinRoomMutation] = useJoinRoomMutation();

  const isHost = useMemo(() => {
    if (!room || !user) return false;
    return room.host.userId === user.userId;
  }, [room, user]);

  const participants = useMemo(() => (room?.participants || []) as VoiceParticipant[], [room]);

  const currentSpeaker = useMemo(
    () => participants.find((participant) => isParticipantSpeaking(participant)) || null,
    [participants]
  );

  const handleSelectRoom = useCallback(
    (roomSelected: RoomResponse) => {
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

    try {
      const response = await joinRoomMutation({
        roomId: selectedRoom.roomId,
        userId: user.userId,
        userName: (user as any).name || (user as any).username || String(user.userId),
      }).unwrap();

      if (response.status) {
        const token = (response as any)?.data?.token;

        setRoom(selectedRoom);
        setLivekitToken(token);
        setIsJoinGateOpen(false);
        setSelectedTab('room-space');

        if (token) {
          await connectToRoom(token);
        }
      }
    } catch (error) {
      toastErrorResponse(error);
    }
  }, [selectedRoom, user, joinRoomMutation, setRoom, connectToRoom]);

  const handleBackToRooms = useCallback(() => {
    setSelectedTab('room-list');
  }, []);

  const handleLeaveRoom = useCallback(async () => {
    await disconnectRoom();
    setSelectedTab('room-list');
    setSelectedRoom(null);
    setLivekitToken(null);
    setIsJoinGateOpen(false);
    setRoom(null);
  }, [setRoom, disconnectRoom]);

  const handleCreateRoom = useCallback(() => {
    if (!isAuthenticated) {
      isAuthOpen.onTrue();
      return;
    }
    editRoomBoolean.onTrue();
  }, [isAuthenticated, isAuthOpen, editRoomBoolean]);

  const handleShareLink = useCallback(() => {
    if (!room) return;
    const url = `${window.location.origin}/room/${room.roomId}`;
    navigator.clipboard?.writeText(url);
    toast.success('Room link copied to clipboard!');
  }, [room]);

  const header = useMemo(() => {
    if (room && selectedTab === 'room-space') {
      return null;
    }

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

    return <DefaultHeader onQuickJoin={() => { }} onCreateRoom={handleCreateRoom} />;
  }, [
    room,
    selectedTab,
    participants,
    handleBackToRooms,
    handleLeaveRoom,
    handleShareLink,
    handleCreateRoom,
  ]);

  const filter = useMemo(
    () => <VoiceRoomsFilter initialFilters={filterRooms} onFilterChange={setFilterRooms} />,
    [filterRooms]
  );

  const mainContent = (
    <>
      <VoiceTabPanel value={selectedTab === 'room-list' ? 0 : 1} index={0}>
        <VoiceRoomlist
          query={filterRooms}
          onSelectRoom={handleSelectRoom}
          onCreateRoom={handleCreateRoom}
        />
      </VoiceTabPanel>

      <VoiceTabPanel value={selectedTab !== 'room-list' ? 1 : 0} index={1}>
        <VoiceRoomBody
          selectedRoom={selectedRoom}
          token={livekitToken}
          onLeaveRoom={handleLeaveRoom}
          onSettingsClick={editRoomBoolean.onTrue}
          onBack={handleBackToRooms}
        />
      </VoiceTabPanel>
    </>
  );

  const footer = useMemo(() => <VoiceButtonSocialChat />, []);

  return (
    <>
      <VoiceRoomLayout
        header={header}
        fixedHeader={Boolean(isInRoom && selectedTab === 'room-list')}
        filter={selectedTab === 'room-list' ? filter : undefined}
        mainContent={mainContent}
        footer={footer}
        maxWidth={selectedTab === 'room-space' ? 'xl' : 'lg'}
      />

      {isJoinGateOpen && selectedRoom && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: (theme) => theme.zIndex.modal,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            bgcolor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <VoiceRoomJoinGate
            roomTopic={selectedRoom.topic}
            participantCount={selectedRoom.participants.length}
            maxParticipants={selectedRoom.max_participants}
            onJoin={handleJoinRoom}
            onCancel={handleCancelJoin}
          />
        </Box>
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

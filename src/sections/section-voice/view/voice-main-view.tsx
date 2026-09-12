import type { RoomResponse } from 'src/types/type-chat';

import { toast } from 'sonner';
import React, { useMemo, useState, useCallback } from 'react';

import { Box } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { toastErrorResponse } from 'src/utils/response';

import { useCredentials } from 'src/core/slices';
import { VoiceRoomLayout } from 'src/layouts/voice-room';
import { useRoomTools } from 'src/core/slices/slice-room';
import { useUpdateUserRecentRoomsMutation } from 'src/core/apis';

import { Scrollbar } from 'src/components/scrollbar';
import { LoginPromptDialog } from 'src/components/custom-dialog';

import VoiceRoomsView from './voice-room-list';
import { VoiceRoomBody } from './voice-room-body';
import { VoiceTabPanel } from '../voice-tab-panel';
import { VoiceRoomsFilter } from '../voice-filter-rooms';
import VoiceButtonSocialChat from '../voice-button-social-chat';
import { VoiceModalCreateRoom } from '../voice-modal-create-room';
import { isParticipantSpeaking } from '../voice-room-header/utils';
import { DefaultHeader } from '../voice-room-header/room-header-default';
import { CompactRoomHeader } from '../voice-room-header/room-header-compact';
import { VoiceRoomActiveBar } from '../voice-room-header/room-header-active-bar';

import type { SelectedTabType, VoiceParticipant } from '../voice-room-header/types';

export function VoiceMainView() {
  const { user, isAuthenticated } = useCredentials();

  const editRoomBoolean = useBoolean();
  const isAuthOpen = useBoolean();
  const settingsOpen = useBoolean();

  const { room, currentRooms, setRoom, setCurrentRooms } = useRoomTools();

  const [selectedTab, setSelectedTab] = useState<SelectedTabType>('find');

  const [updateUserRecentRooms] = useUpdateUserRecentRoomsMutation();

  // ---------------------------------------------------------
  // HOST
  // ---------------------------------------------------------

  const isHost = useMemo(() => {
    if (!room || !user) return false;

    return room.host?.id === user.id || room.host?.userId === user.id;
  }, [room, user]);

  // ---------------------------------------------------------
  // PARTICIPANTS
  // ---------------------------------------------------------

  const participants = useMemo(
    () => (room?.currentParticipants || []) as VoiceParticipant[],
    [room]
  );

  // ---------------------------------------------------------
  // CURRENT SPEAKER
  // ---------------------------------------------------------

  const currentSpeaker = useMemo(
    () => participants.find((participant) => isParticipantSpeaking(participant)) || null,
    [participants]
  );

  // ---------------------------------------------------------
  // JOIN ROOM
  // ---------------------------------------------------------

  const handleJoinRoom = useCallback(
    async (roomSelected: RoomResponse) => {
      if (!isAuthenticated) {
        isAuthOpen.onTrue();
        return;
      }

      // Set selected room
      setRoom(roomSelected);

      // Move to active room tab
      setSelectedTab('entry');

      const roomExists = currentRooms.some((roomProp) => roomProp.room?.id === roomSelected.id);

      if (!roomExists && user?.id) {
        const formData = {
          id: user.id,
          roomId: roomSelected.id,
        };

        const response = await updateUserRecentRooms(formData);

        if (response.data?.status) {
          setCurrentRooms([
            {
              room: roomSelected,
              joinedAt: new Date().toISOString(),
            },
            ...currentRooms,
          ]);
        } else {
          toastErrorResponse(response);
        }
      }
    },
    [
      user,
      currentRooms,
      isAuthenticated,
      isAuthOpen,
      setCurrentRooms,
      updateUserRecentRooms,
      setRoom,
    ]
  );

  // ---------------------------------------------------------
  // BACK TO ROOMS
  // ---------------------------------------------------------

  const handleBackToRooms = useCallback(() => {
    setSelectedTab('find');
  }, []);

  // ---------------------------------------------------------
  // LEAVE ROOM
  // ---------------------------------------------------------

  const handleLeaveRoom = useCallback(() => {
    setSelectedTab('find');
    setRoom(null as any);
  }, [setRoom]);

  // ---------------------------------------------------------
  // CREATE ROOM
  // ---------------------------------------------------------

  const handleCreateRoom = useCallback(() => {
    if (!isAuthenticated) {
      isAuthOpen.onTrue();
      return;
    }

    editRoomBoolean.onTrue();
  }, [isAuthenticated, isAuthOpen, editRoomBoolean]);

  // ---------------------------------------------------------
  // SHARE ROOM
  // ---------------------------------------------------------

  const handleShareLink = useCallback(() => {
    if (!room) return;

    const url = `${window.location.origin}/room/${room.id}`;

    navigator.clipboard?.writeText(url);

    toast.success('Room link copied to clipboard!');
  }, [room]);

  // ---------------------------------------------------------
  // HEADER
  // ---------------------------------------------------------

  const header = useMemo(() => {
    // ---------------------------------------------
    // FIND ROOMS + ACTIVE ROOM
    // ---------------------------------------------

    if (room && selectedTab === 'find') {
      return (
        <VoiceRoomActiveBar
          room={room}
          participants={participants}
          currentSpeaker={currentSpeaker}
          onEnterRoom={() => setSelectedTab('entry')}
          onLeaveRoom={handleLeaveRoom}
        />
      );
    }

    // ---------------------------------------------
    // INSIDE ROOM
    // ---------------------------------------------

    if (room && selectedTab === 'entry') {
      return (
        <CompactRoomHeader
          room={room}
          isHost={isHost}
          onBack={handleBackToRooms}
          onSettingsClick={settingsOpen.onTrue}
          onShareClick={handleShareLink}
          onLeaveRoom={handleLeaveRoom}
        />
      );
    }

    // ---------------------------------------------
    // DEFAULT
    // ---------------------------------------------

    return <DefaultHeader onQuickJoin={() => {}} onCreateRoom={handleCreateRoom} />;
  }, [
    room,
    selectedTab,
    participants,
    currentSpeaker,
    isHost,
    handleBackToRooms,
    handleLeaveRoom,
    settingsOpen,
    handleShareLink,
    handleCreateRoom,
  ]);

  // ---------------------------------------------------------
  // FILTER
  // ---------------------------------------------------------

  const filter = useMemo(() => <VoiceRoomsFilter onFilterChange={() => {}} />, []);

  const mainContent = (
    <>
      {/* =====================================================
          ROOM LIST
          ===================================================== */}

      <VoiceTabPanel value={selectedTab === 'find' ? 0 : 1} index={0}>
        <Box
          sx={{
            width: '100%',
            height: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            <Scrollbar
              sx={{
                height: 1,
              }}
            >
              <VoiceRoomsView onJoinRoom={handleJoinRoom} />
            </Scrollbar>
          </Box>
        </Box>
      </VoiceTabPanel>

      {/* =====================================================
          ACTIVE ROOM
          ===================================================== */}

      <VoiceTabPanel value={selectedTab !== 'find' ? 1 : 0} index={1}>
        <VoiceRoomBody />
      </VoiceTabPanel>
    </>
  );

  // ---------------------------------------------------------
  // FOOTER
  // ---------------------------------------------------------

  const footer = useMemo(() => <VoiceButtonSocialChat />, []);

  // ---------------------------------------------------------
  // RETURN
  // ---------------------------------------------------------

  return (
    <>
      <VoiceRoomLayout
        header={header}
        filter={selectedTab === 'find' ? filter : undefined}
        mainContent={mainContent}
        footer={footer}
      />

      {/* =====================================================
          CREATE ROOM MODAL
          ===================================================== */}

      <VoiceModalCreateRoom
        open={editRoomBoolean.value}
        onClose={editRoomBoolean.onFalse}
        onCreateRoom={() => {}}
      />

      {/* =====================================================
          LOGIN DIALOG
          ===================================================== */}

      <LoginPromptDialog openBoolean={isAuthOpen} />
    </>
  );
}

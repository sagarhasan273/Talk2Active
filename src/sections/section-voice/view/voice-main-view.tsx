import type { RoomResponse } from 'src/types/type-chat';

import { toast } from 'sonner';
import React, { useMemo, useState, useCallback } from 'react';

import { Box } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useCredentials } from 'src/core/slices';
import { VoiceRoomLayout } from 'src/layouts/voice-room';
import { useRoomTools } from 'src/core/slices/slice-room';

import { Scrollbar } from 'src/components/scrollbar';
import { LoginPromptDialog } from 'src/components/custom-dialog';

import VoiceRoomlist from './voice-room-list';
import { VoiceRoomBody } from './voice-room-body';
import { VoiceTabPanel } from '../voice-tab-panel';
import { FilterState, VoiceRoomsFilter } from '../voice-filter-rooms';
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

  const { room, setRoom } = useRoomTools();

  const [selectedTab, setSelectedTab] = useState<SelectedTabType>('find');
  const [filterRooms, setFilterRooms] = useState<FilterState>({
    searchQuery: '',
    selectedLanguage: 'all',
    selectedLevel: 'all',
    hideFullRooms: false,
    showActiveOnly: false
  });

  // ---------------------------------------------------------
  // HOST
  // ---------------------------------------------------------

  const isHost = useMemo(() => {
    if (!room || !user) return false;

    return room.host.userId === user.userId;
  }, [room, user]);

  // ---------------------------------------------------------
  // PARTICIPANTS
  // ---------------------------------------------------------

  const participants = useMemo(
    () => (room ? room.participants || [] : []) as VoiceParticipant[],
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
    },
    [isAuthenticated, isAuthOpen, setRoom]
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

    const url = `${window.location.origin}/room/${room.roomId}`;

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

    return <DefaultHeader onQuickJoin={() => { }} onCreateRoom={handleCreateRoom} />;
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

  const filter = useMemo(() => <VoiceRoomsFilter initialFilters={filterRooms} onFilterChange={(filter) => {
    setFilterRooms(filter);
  }} />, []);

  const mainContent = (
    <>
      {/* =====================================================
          ROOM LIST
          ===================================================== */}

      <VoiceTabPanel value={selectedTab === 'find' ? 0 : 1} index={0}>
        <VoiceRoomlist onJoinRoom={handleJoinRoom} query={filterRooms} />
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
        onCreateRoom={() => { }}
        currentRoom={room}
      />

      {/* =====================================================
          LOGIN DIALOG
          ===================================================== */}

      <LoginPromptDialog openBoolean={isAuthOpen} />
    </>
  );
}

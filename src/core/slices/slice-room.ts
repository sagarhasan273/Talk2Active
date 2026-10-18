// src/core/slices/room.slice.ts

import type { RoomParticipantType, RoomType } from '@/types/type-room';
import type { PayloadAction } from '@reduxjs/toolkit';

import { createSlice } from '@reduxjs/toolkit';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { cacheUserInfo } from '@/utils/user-cache';
import type { RootState } from '../types';

interface RoomState {
  roomId: null | string;
  room: null | RoomType;
  rooms: RoomType[];
  loading: boolean;
  participants: RoomParticipantType[];
  isUnreadRoomMessage: boolean;
}

// Initial state
const initialState: RoomState = {
  roomId: null,
  room: null,
  rooms: [],
  loading: false,
  participants: [],
  isUnreadRoomMessage: false,
}

export const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRoom: (state, action: PayloadAction<RoomState['room']>) => {
      state.room = action.payload;
      state.roomId = action.payload?.roomId || null;
      if (action.payload?.participants) {
        state.participants = action.payload.participants;
      }
    },

    setRoomLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setRooms: (state, action: PayloadAction<RoomType[]>) => {
      state.rooms = action.payload || [];
    },

    // 1. Handle New Room (Prepends to rooms array)
    addRoom: (state, action: PayloadAction<RoomType>) => {
      const newRoom = action.payload;
      if (!newRoom?.roomId) return;

      const exists = state.rooms.some((r) => r.roomId === newRoom.roomId);
      if (!exists) {
        state.rooms.unshift(newRoom);
      }
    },

    // 2. Handle User Join in Room
    addParticipantToRoom: (
      state,
      action: PayloadAction<{ roomId: string; participant: RoomParticipantType }>
    ) => {
      const { roomId, participant } = action.payload;
      if (!roomId || !participant) return;

      const participantId = participant.userId?.toString();

      // Mutate specific room in the rooms list directly
      const targetRoom = state.rooms.find((r) => r.roomId === roomId);
      if (targetRoom) {
        if (!targetRoom.participants) targetRoom.participants = [];
        const exists = targetRoom.participants.some((p) => p.userId?.toString() === participantId);
        if (!exists) {
          targetRoom.participants.push(participant);
        }
      }

      // Sync active room if it matches
      if (state.room?.roomId === roomId) {
        if (!state.room.participants) state.room.participants = [];
        const exists = state.room.participants.some((p) => p.userId?.toString() === participantId);
        if (!exists) {
          state.room.participants.push(participant);
          state.participants = state.room.participants;
        }
      }

      if (participant.userId) {
        cacheUserInfo({
          userId: participant.userId,
          name: participant.name as string,
          avatarUrl: participant.profilePhoto,
        });
      }
    },

    // 3. Handle User Leave in Room
    removeParticipantFromRoom: (
      state,
      action: PayloadAction<{ roomId: string; participantId: string }>
    ) => {
      const { roomId, participantId } = action.payload;
      if (!roomId || !participantId) return;

      const leavingUserId = participantId.toString();

      // Find the specific room in the array and directly filter its participants
      const targetRoom = state.rooms.find((room) => room.roomId === roomId);
      if (targetRoom && targetRoom.participants) {
        targetRoom.participants = targetRoom.participants.filter(
          (p) => p.userId?.toString() !== leavingUserId
        );
      }

      // Sync the active room if it matches
      if (state.room?.roomId === roomId && state.room.participants) {
        state.room.participants = state.room.participants.filter(
          (p) => p.userId?.toString() !== leavingUserId
        );
        state.participants = state.room.participants;
      }
    },

    // 4. Update single participant metadata
    updateParticipant: (state, action: PayloadAction<Partial<RoomParticipantType>>) => {
      if (!action.payload?.userId) return;
      const targetId = String(action.payload.userId);

      // Update in standalone participants list
      const pIndex = state.participants.findIndex((p) => String(p.userId) === targetId);
      if (pIndex !== -1) Object.assign(state.participants[pIndex], action.payload);

      // Update in active room
      if (state.room?.participants) {
        const rpIndex = state.room.participants.findIndex((p) => String(p.userId) === targetId);
        if (rpIndex !== -1) Object.assign(state.room.participants[rpIndex], action.payload);
      }

      // Update across rooms list
      state.rooms.forEach((room) => {
        if (!room.participants) return;
        const idx = room.participants.findIndex((p) => String(p.userId) === targetId);
        if (idx !== -1) Object.assign(room.participants[idx], action.payload);
      });
    },

    // 5. Update multiple participants metadata in-place
    updateParticipants: (
      state,
      action: PayloadAction<Array<Partial<RoomParticipantType>>>
    ) => {
      if (!Array.isArray(action.payload) || action.payload.length === 0) return;

      const updatesMap = new Map<string, Partial<RoomParticipantType>>();
      for (const update of action.payload) {
        // Accept either userId or id from the payload
        const targetId = update?.userId || (update as any)?.id;
        if (targetId) {
          updatesMap.set(String(targetId), update);
        }
      }

      if (updatesMap.size === 0) return;

      const applyUpdates = (participantsList: RoomParticipantType[]) => {
        participantsList.forEach((participant: any) => {
          // Check both participant.userId and participant.id to match correctly
          const participantId = participant.userId || participant.id;
          if (!participantId) return;

          const update = updatesMap.get(String(participantId));
          if (update) {
            Object.assign(participant, update);
          }
        });
      };

      // Apply to main participants list
      if (Array.isArray(state.participants)) {
        applyUpdates(state.participants);
      }

      // Apply to active room participants list
      if (state.room?.participants && Array.isArray(state.room.participants)) {
        applyUpdates(state.room.participants);
      }

      // Apply to all rooms in the rooms array
      if (Array.isArray(state.rooms)) {
        state.rooms.forEach((room) => {
          if (room?.participants && Array.isArray(room.participants)) {
            applyUpdates(room.participants);
          }
        });
      }
    },

    resetRoom: (state) => {
      state.roomId = null;
      state.room = null;
      state.participants = [];
    },
  },
});

export const {
  setRoom,
  setRoomLoading,
  setRooms,
  addRoom,
  addParticipantToRoom,
  removeParticipantFromRoom,
  updateParticipant,
  updateParticipants,
  resetRoom,
} = roomSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────
export const selectRoom = (state: RootState) => state.room.room;
export const selectRooms = (state: RootState) => state.room.rooms;
export const selectRoomLoading = (state: RootState) => state.room.loading;
export const selectParticipants = (state: RootState) => state.room.participants;
export const selectIsUnreadRoomMessage = (state: RootState) => state.room.isUnreadRoomMessage;

// ── useRoomTools Hook ─────────────────────────────────────────────────────
export const useRoomTools = () => {
  const dispatch = useDispatch();

  const roomId = useSelector((state: RootState) => state.room.roomId);
  const room = useSelector(selectRoom);
  const rooms = useSelector(selectRooms);
  const loading = useSelector(selectRoomLoading);
  const participants = useSelector(selectParticipants);
  const isUnreadRoomMessage = useSelector(selectIsUnreadRoomMessage);

  const getRoomById = useCallback(
    (targetRoomId: string): RoomType | undefined => {
      if (!targetRoomId) return undefined;
      return rooms.find((r) => r.roomId === targetRoomId);
    },
    [rooms]
  );

  const memoizedRoom = useMemo(
    () => ({
      roomId,
      room,
      rooms,
      loading,
      participants,
      isUnreadRoomMessage,
      setRoom: (roomData: RoomType | null) => dispatch(setRoom(roomData)),
      setRooms: (roomsList: RoomType[]) => dispatch(setRooms(roomsList)),
      setRoomLoading: (isLoading: boolean) => dispatch(setRoomLoading(isLoading)),
      addRoom: (roomData: RoomType) => dispatch(addRoom(roomData)),
      addParticipantToRoom: (roomId: string, participant: RoomParticipantType) =>
        dispatch(addParticipantToRoom({ roomId, participant })),
      removeParticipantFromRoom: (roomId: string, participantId: string) =>
        dispatch(removeParticipantFromRoom({ roomId, participantId })),
      updateParticipant: (participant: Partial<RoomParticipantType>) =>
        dispatch(updateParticipant(participant)),
      updateParticipants: (participantsList: Array<Partial<RoomParticipantType>>) =>
        dispatch(updateParticipants(participantsList)),
      getRoomById,
      resetRoom: () => dispatch(resetRoom()),
    }),
    [
      roomId,
      room,
      rooms,
      loading,
      participants,
      isUnreadRoomMessage,
      getRoomById,
      dispatch,
    ]
  );

  return memoizedRoom;
};

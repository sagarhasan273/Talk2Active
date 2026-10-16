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
};

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
        state.rooms = [newRoom, ...state.rooms];
      }
    },

    // 2. Handle User Join in Room (Adds participant to target room)
    addParticipantToRoom: (
      state,
      action: PayloadAction<{ roomId: string; participant: RoomParticipantType }>
    ) => {
      const { roomId, participant } = action.payload;
      if (!roomId || !participant) return;

      const participantId = participant.userId?.toString();

      state.rooms = state.rooms.map((room) => {
        if (room.roomId !== roomId) return room;

        const participants = room.participants || [];
        const alreadyExists = participants.some(
          (p) => p.userId?.toString() === participantId
        );

        if (alreadyExists) return room;

        return {
          ...room,
          participants: [...participants, participant],
        };
      });

      // Also sync active room if it matches
      if (state.room && state.room.roomId === roomId) {
        if (!state.room.participants) state.room.participants = [];
        const exists = state.room.participants.some(
          (p) => p.userId?.toString() === participantId
        );
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

    // 3. Handle User Leave in Room (Removes participant from target room)
    removeParticipantFromRoom: (
      state,
      action: PayloadAction<{ roomId: string; participantId: string }>
    ) => {
      const { roomId, participantId } = action.payload;
      if (!roomId || !participantId) return;

      const leavingUserId = participantId.toString();

      state.rooms = state.rooms.map((room) => {
        if (room.roomId !== roomId) return room;

        const updatedParticipants = (room.participants || []).filter(
          (p) => p.userId?.toString() !== leavingUserId
        );

        return {
          ...room,
          participants: updatedParticipants,
        };
      });

      // Also sync active room if it matches
      if (state.room && state.room.roomId === roomId && state.room.participants) {
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

      // Update in active room participants list
      state.participants = state.participants.map((p) =>
        String(p.userId) === targetId ? { ...p, ...action.payload } : p
      );

      // Update in active room object if present
      if (state.room && state.room.participants) {
        state.room.participants = state.room.participants.map((p) =>
          String(p.userId) === targetId ? { ...p, ...action.payload } : p
        );
      }

      // Update across rooms list
      state.rooms = state.rooms.map((room) => ({
        ...room,
        participants: (room.participants || []).map((p) =>
          String(p.userId) === targetId ? { ...p, ...action.payload } : p
        ),
      }));
    },

    // 5. Update multiple participants metadata in-place
    updateParticipants: (
      state,
      action: PayloadAction<Array<Partial<RoomParticipantType>>>
    ) => {
      if (!Array.isArray(action.payload) || action.payload.length === 0) return;

      const updatesMap = new Map<string, Partial<RoomParticipantType>>();
      for (const update of action.payload) {
        if (update?.userId) {
          updatesMap.set(String(update.userId), update);
        }
      }

      if (updatesMap.size === 0) return;

      // Update active participants
      state.participants = state.participants.map((participant) => {
        const update = updatesMap.get(String(participant.userId));
        return update ? { ...participant, ...update } : participant;
      });

      // Update active room participants
      if (state.room && state.room.participants) {
        state.room.participants = state.room.participants.map((participant) => {
          const update = updatesMap.get(String(participant.userId));
          return update ? { ...participant, ...update } : participant;
        });
      }

      // Update across rooms list
      state.rooms = state.rooms.map((room) => ({
        ...room,
        participants: (room.participants || []).map((participant) => {
          const update = updatesMap.get(String(participant.userId));
          return update ? { ...participant, ...update } : participant;
        }),
      }));
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
      updateParticipants: (participants: Array<Partial<RoomParticipantType>>) =>
        dispatch(updateParticipants(participants)),
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

// src/core/slices/room.slice.ts

import type { RoomParticipantType, RoomType } from '@/types/type-room';
import type { PayloadAction } from '@reduxjs/toolkit';

import { createSlice } from '@reduxjs/toolkit';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { cacheUserInfo } from '@/utils/user-cache';
import type { RootState } from '../types';

// ── Types ──────────────────────────────────────────────────────────────────
export type UserStatsUpdate = {
  userId?: string;
  id?: string;
  follower_count?: number;
  following_count?: number;
  friend_count?: number;
};

interface RoomState {
  roomId: null | string;
  room: null | RoomType;
  rooms: RoomType[];
  loading: boolean;
  isRoomsLoading: boolean; // Added state for the global rooms list loading
  participants: RoomParticipantType[];
  isUnreadRoomMessage: boolean;
  // O(1) Cache map for storing user follower/following stats globally
  userStatsMap: Record<string, { follower_count?: number; following_count?: number; friend_count?: number }>;
}

const initialState: RoomState = {
  roomId: null,
  room: null,
  rooms: [],
  loading: false,
  isRoomsLoading: false, // Initialized
  participants: [],
  isUnreadRoomMessage: false,
  userStatsMap: {},
};

// ── Helpers ────────────────────────────────────────────────────────────────
const getTargetId = (obj: any): string => {
  if (!obj) return '';
  return String(
    obj.userId || obj.id || obj.user?.userId || obj.user?.id || obj.accountDetails?.userId || ''
  );
};

const applyUserUpdate = (target: any, update: Record<string, any>) => {
  if (!target) return;
  Object.assign(target, update);
  if (target.user && typeof target.user === 'object') {
    Object.assign(target.user, update);
  }
  if (target.accountDetails && typeof target.accountDetails === 'object') {
    Object.assign(target.accountDetails, update);
  }
};

// ── Slice ──────────────────────────────────────────────────────────────────
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

    // Reducer for the global rooms list loading state
    setRoomsLoading: (state, action: PayloadAction<boolean>) => {
      state.isRoomsLoading = action.payload;
    },

    setRooms: (state, action: PayloadAction<RoomType[]>) => {
      state.rooms = action.payload || [];
    },

    addRoom: (state, action: PayloadAction<RoomType>) => {
      const newRoom = action.payload;
      if (!newRoom?.roomId) return;

      const exists = state.rooms.some((r) => r.roomId === newRoom.roomId);
      if (!exists) {
        state.rooms.unshift(newRoom);
      }
    },

    addParticipantToRoom: (
      state,
      action: PayloadAction<{ roomId: string; participant: RoomParticipantType }>
    ) => {
      const { roomId, participant } = action.payload;
      if (!roomId || !participant) return;

      const participantId = getTargetId(participant);

      const targetRoom = state.rooms.find((r) => r.roomId === roomId);
      if (targetRoom) {
        if (!targetRoom.participants) targetRoom.participants = [];
        const exists = targetRoom.participants.some((p) => getTargetId(p) === participantId);
        if (!exists) {
          targetRoom.participants.push(participant);
        }
      }

      if (state.room?.roomId === roomId) {
        if (!state.room.participants) state.room.participants = [];
        const exists = state.room.participants.some((p) => getTargetId(p) === participantId);
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

    removeParticipantFromRoom: (
      state,
      action: PayloadAction<{ roomId: string; participantId: string }>
    ) => {
      const { roomId, participantId } = action.payload;
      if (!roomId || !participantId) return;

      const leavingUserId = String(participantId);

      const targetRoom = state.rooms.find((room) => room.roomId === roomId);
      if (targetRoom && targetRoom.participants) {
        targetRoom.participants = targetRoom.participants.filter(
          (p) => getTargetId(p) !== leavingUserId
        );
      }

      if (state.room?.roomId === roomId && state.room.participants) {
        state.room.participants = state.room.participants.filter(
          (p) => getTargetId(p) !== leavingUserId
        );
        state.participants = state.room.participants;
      }
    },

    updateParticipant: (state, action: PayloadAction<Partial<RoomParticipantType>>) => {
      const targetId = getTargetId(action.payload);
      if (!targetId) return;

      state.participants.forEach((p) => {
        if (getTargetId(p) === targetId) applyUserUpdate(p, action.payload);
      });

      if (state.room) {
        if (getTargetId(state.room.host) === targetId) {
          applyUserUpdate(state.room.host, action.payload);
        }
        state.room.participants?.forEach((p) => {
          if (getTargetId(p) === targetId) applyUserUpdate(p, action.payload);
        });
      }

      state.rooms.forEach((room) => {
        if (getTargetId(room.host) === targetId) {
          applyUserUpdate(room.host, action.payload);
        }
        room.participants?.forEach((p) => {
          if (getTargetId(p) === targetId) applyUserUpdate(p, action.payload);
        });
      });
    },

    updateParticipants: (state, action: PayloadAction<Array<UserStatsUpdate>>) => {
      if (!Array.isArray(action.payload) || action.payload.length === 0) return;

      const updatesMap = new Map<string, UserStatsUpdate>();

      for (const update of action.payload) {
        const id = getTargetId(update);
        if (id) {
          updatesMap.set(id, update);

          // Store directly in the O(1) stats lookup map
          state.userStatsMap[id] = {
            ...state.userStatsMap[id],
            ...(update.follower_count !== undefined && { follower_count: update.follower_count }),
            ...(update.following_count !== undefined && { following_count: update.following_count }),
            ...(update.friend_count !== undefined && { friend_count: update.friend_count }),
          };
        }
      }

      if (updatesMap.size === 0) return;

      const applyListUpdates = (list?: RoomParticipantType[]) => {
        if (!Array.isArray(list)) return;
        list.forEach((participant) => {
          const update = updatesMap.get(getTargetId(participant));
          if (update) applyUserUpdate(participant, update);
        });
      };

      // Apply to standalone list
      applyListUpdates(state.participants);

      // Apply to active room
      if (state.room) {
        const hostUpdate = updatesMap.get(getTargetId(state.room.host));
        if (hostUpdate && state.room.host) applyUserUpdate(state.room.host, hostUpdate);
        applyListUpdates(state.room.participants);
      }

      // Apply to all rooms
      state.rooms.forEach((room) => {
        const hostUpdate = updatesMap.get(getTargetId(room.host));
        if (hostUpdate && room.host) applyUserUpdate(room.host, hostUpdate);
        applyListUpdates(room.participants);
      });
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
  setRoomsLoading,
  setRooms,
  addRoom,
  addParticipantToRoom,
  removeParticipantFromRoom,
  updateParticipant,
  updateParticipants,
  resetRoom,
} = roomSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────
export const selectRoomId = (state: RootState) => state.room.roomId;
export const selectRoom = (state: RootState) => state.room.room;
export const selectRooms = (state: RootState) => state.room.rooms;
export const selectRoomLoading = (state: RootState) => state.room.loading;
export const selectIsRoomsLoading = (state: RootState) => state.room.isRoomsLoading;
export const selectParticipants = (state: RootState) => state.room.participants;
export const selectIsUnreadRoomMessage = (state: RootState) => state.room.isUnreadRoomMessage;
export const selectUserStatsMap = (state: RootState) => state.room.userStatsMap;

// ── useRoomTools Hook ─────────────────────────────────────────────────────
export const useRoomTools = () => {
  const dispatch = useDispatch();

  const roomId = useSelector(selectRoomId);
  const room = useSelector(selectRoom);
  const rooms = useSelector(selectRooms);
  const loading = useSelector(selectRoomLoading);
  const isRoomsLoading = useSelector(selectIsRoomsLoading);
  const participants = useSelector(selectParticipants);
  const isUnreadRoomMessage = useSelector(selectIsUnreadRoomMessage);

  const getRoomById = useCallback(
    (targetRoomId: string): RoomType | undefined => {
      if (!targetRoomId) return undefined;
      return rooms.find((r) => r.roomId === targetRoomId);
    },
    [rooms]
  );

  const actions = useMemo(
    () => ({
      setRoom: (roomData: RoomType | null) => dispatch(setRoom(roomData)),
      setRooms: (roomsList: RoomType[]) => dispatch(setRooms(roomsList)),
      setRoomLoading: (isLoading: boolean) => dispatch(setRoomLoading(isLoading)),
      setRoomsLoading: (isLoading: boolean) => dispatch(setRoomsLoading(isLoading)),
      addRoom: (roomData: RoomType) => dispatch(addRoom(roomData)),
      addParticipantToRoom: (rId: string, participant: RoomParticipantType) =>
        dispatch(addParticipantToRoom({ roomId: rId, participant })),
      removeParticipantFromRoom: (rId: string, participantId: string) =>
        dispatch(removeParticipantFromRoom({ roomId: rId, participantId })),
      updateParticipant: (participant: Partial<RoomParticipantType>) =>
        dispatch(updateParticipant(participant)),
      updateParticipants: (participantsList: Array<UserStatsUpdate>) =>
        dispatch(updateParticipants(participantsList)),
      resetRoom: () => dispatch(resetRoom()),
    }),
    [dispatch]
  );

  return useMemo(
    () => ({
      roomId,
      room,
      rooms,
      loading,
      isRoomsLoading,
      participants,
      isUnreadRoomMessage,
      getRoomById,
      ...actions,
    }),
    [roomId, room, rooms, loading, isRoomsLoading, participants, isUnreadRoomMessage, getRoomById, actions]
  );
};

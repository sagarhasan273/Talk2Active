import type { UserType } from 'src/types/type-user';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RoomResponse } from 'src/types/type-chat';
import type { Message, Reaction, Participant } from 'src/types/type-room';

import { createSlice } from '@reduxjs/toolkit';
import { useRef, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState, UserVoiceStateProps } from '../types';

// Define auth state interface
interface RoomState {
  room: RoomResponse;
  currentRooms: { room: RoomResponse; joinedAt: string }[];
  loading: boolean;
  participants: { [userId: string]: Participant };
  userVoiceState: UserVoiceStateProps;
  chatRoomMessages: Message[];
  isUnreadChatRoomMessage: boolean;
  userActionsInVoice: any;
}

// Initial state
const initialState: RoomState = {
  room: {} as RoomResponse,
  currentRooms: [],
  loading: false,
  participants: {} as { [socketId: string]: Participant },
  userVoiceState: {
    roomId: null,
    hasJoined: false,
    isMicMuted: false,
    isDeafened: false,
    micGain: 50,
    volume: 100,
    isScreenSharing: false,
    statue: 'online',
    userVolumes: {},
  },
  chatRoomMessages: [],
  isUnreadChatRoomMessage: false,
  userActionsInVoice: {},
};

export const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRoom: (state, action: PayloadAction<RoomState['room']>) => {
      state.room = action.payload;
    },

    setCurrentRooms: (state, action: PayloadAction<RoomState['currentRooms']>) => {
      state.currentRooms = action.payload;
    },

    setRoomLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    addParticipant: (state, action: PayloadAction<Participant>) => {
      state.participants[action.payload.userId] = action.payload;
    },

    updateParticipant: (state, action: PayloadAction<Partial<Participant>>) => {
      if (!action.payload?.userId) {
        return;
      }

      state.participants[action.payload.userId] = {
        ...state.participants[action.payload.userId],
        ...action.payload,
      };
    },

    transferParticipantUserType: (
      state,
      action: PayloadAction<{
        prevUserId?: string;
        newUserId: string;
      }>
    ) => {
      console.log(action.payload.newUserId);
      Object.values(state.participants).forEach((participant) => {
        if (participant.userId === action.payload.newUserId) {
          participant.userType = 'host';
        } else {
          participant.userType = 'guest';
        }
      });
    },

    removeParticipant: (state, action: PayloadAction<string>) => {
      const userId = Object.values(state.participants).find(
        (participant) => participant.socketId === action.payload
      )?.userId;
      if (userId) delete state.participants[userId];
    },

    updateParticipantAudio: (
      state,
      action: PayloadAction<{ userId: string; isMuted: boolean }>
    ) => {
      const participant = state.participants[action.payload.userId];
      if (participant) {
        participant.isMuted = action.payload.isMuted;
      }
    },

    updateParticipantStatus: (
      state,
      action: PayloadAction<{ userId: string; status: UserType['status'] }>
    ) => {
      const participant = state.participants[action.payload.userId];
      if (participant) {
        participant.status = action.payload.status;
      }
    },

    resetParticipants: (state) => {
      state.participants = {};
    },

    updateUserVoiceState: (state, action: PayloadAction<Partial<UserVoiceStateProps>>) => {
      state.userVoiceState = { ...state.userVoiceState, ...action.payload };
    },

    updateUserVolumesState: (state, action: PayloadAction<{ userId: string; volume: number }>) => {
      state.userVoiceState = {
        ...state.userVoiceState,
        userVolumes: {
          ...state.userVoiceState.userVolumes,
          [action.payload.userId]: action.payload.volume,
        },
      };
    },

    addChatRoomMessage: (state, action: PayloadAction<Message>) => {
      state.chatRoomMessages.push({
        ...action.payload,
        startOfUnread: !state.isUnreadChatRoomMessage === action.payload.isUnread,
      });
      state.isUnreadChatRoomMessage = action.payload.isUnread;
    },

    editChatRoomMessage: (
      state,
      action: PayloadAction<{
        messageId: Message['id'];
        text: Message['text'];
        time?: Message['time'];
      }>
    ) => {
      state.chatRoomMessages.forEach((msg) => {
        if (msg.id === action.payload.messageId) {
          msg.isEdited = true;
          msg.text = action.payload.text || msg.text;
          msg.time = action.payload.time || msg.time;
        }
      });
    },

    deleteChatRoomMessage: (
      state,
      action: PayloadAction<{
        messageId: Message['id'];
        text?: Message['text'];
        time?: Message['time'];
      }>
    ) => {
      state.chatRoomMessages.forEach((msg) => {
        if (msg.id === action.payload.messageId) {
          msg.isDeleted = true;
          msg.isEdited = false;
          msg.text = action.payload.text || '[This message was deleted]';
          msg.time = action.payload.time || msg.time;
        }
      });
    },

    reactionChatRoomMessage: (
      state,
      action: PayloadAction<{ messageId: Message['id']; reaction: Reaction }>
    ) => {
      state.chatRoomMessages.forEach((msg) => {
        if (msg.id === action.payload.messageId) {
          msg.reactions = [...(msg.reactions || []), action.payload.reaction];
        }
      });
    },

    reactionPopChatRoomMessage: (
      state,
      action: PayloadAction<{ messageId: Message['id']; reaction: Reaction }>
    ) => {
      state.chatRoomMessages.forEach((msg) => {
        if (msg.id === action.payload.messageId) {
          msg.reactions = (msg.reactions || []).filter(
            (reaction) => reaction.userId !== action.payload.reaction.userId
          );
        }
      });
    },

    clearUnreadChatRoomMessages: (state) => {
      state.isUnreadChatRoomMessage = false;
      state.chatRoomMessages.forEach((msg) => {
        msg.isUnread = false;
        msg.startOfUnread = false;
      });
    },

    updateUserActionsInVoice: (state, action: PayloadAction<any>) => {
      state.userActionsInVoice = action.payload;
    },
  },
});

const {
  setRoom,
  setCurrentRooms,
  setRoomLoading,
  addParticipant,
  updateParticipant,
  transferParticipantUserType,
  removeParticipant,
  updateParticipantAudio,
  updateParticipantStatus,
  resetParticipants,
  updateUserVoiceState,
  updateUserVolumesState,
  addChatRoomMessage,
  editChatRoomMessage,
  deleteChatRoomMessage,
  reactionChatRoomMessage,
  reactionPopChatRoomMessage,
  clearUnreadChatRoomMessages,
  updateUserActionsInVoice,
} = roomSlice.actions;

// Selectors with proper typing
const selectRoom = (state: RootState) => state.room.room;
const selectCurrentRooms = (state: RootState) => state.room.currentRooms;
const selectRoomLoading = (state: RootState) => state.room.loading;
const selectParticipants = (state: RootState) => state.room.participants;
const selectChatRoomMessages = (state: RootState) => state.room.chatRoomMessages;
const selectIsUnreadChatRoomMessage = (state: RootState) => state.room.isUnreadChatRoomMessage;
const selectUserVoiceState = (state: RootState) => state.room.userVoiceState;
const selectUserActionInVoiceState = (state: RootState) => state.room.userActionsInVoice;

export const useRoomTools = () => {
  const dispatch = useDispatch();

  const room = useSelector(selectRoom);
  const currentRooms = useSelector(selectCurrentRooms);
  const loading = useSelector(selectRoomLoading);
  const participants = useSelector(selectParticipants);
  const chatRoomMessages = useSelector(selectChatRoomMessages);
  const isUnreadChatRoomMessage = useSelector(selectIsUnreadChatRoomMessage);
  const userVoiceState = useSelector(selectUserVoiceState);
  const userActionsInVoice = useSelector(selectUserActionInVoiceState);

  const setTimeOutRef = useRef<NodeJS.Timeout>();

  const memoizedRoom = useMemo(
    () => ({
      room,
      currentRooms,
      loading,
      participants,
      chatRoomMessages,
      isUnreadChatRoomMessage,
      userVoiceState,
      userActionsInVoice,
      setRoom: (roomData: RoomResponse) => dispatch(setRoom(roomData)),
      setCurrentRooms: (roomData: { room: RoomResponse; joinedAt: string }[]) =>
        dispatch(setCurrentRooms(roomData)),
      setRoomLoading: (isLoading: boolean) => dispatch(setRoomLoading(isLoading)),
      addParticipant: (participant: Participant) => dispatch(addParticipant(participant)),
      updateParticipant: (participant: Partial<Participant>) =>
        dispatch(updateParticipant(participant)),
      transferParticipantUserType: (payload: { newUserId: string; prevUserId?: string }) =>
        dispatch(transferParticipantUserType(payload)),
      removeParticipant: (socketId: string) => dispatch(removeParticipant(socketId)),
      updateParticipantAudio: (payload: { userId: string; isMuted: boolean }) =>
        dispatch(updateParticipantAudio(payload)),
      updateParticipantStatus: (payload: { userId: string; status: UserType['status'] }) =>
        dispatch(updateParticipantStatus(payload)),
      resetParticipants: () => dispatch(resetParticipants()),
      updateUserVoiceState: (payload: Partial<UserVoiceStateProps>) =>
        dispatch(updateUserVoiceState(payload)),
      updateUserVolumesState: (payload: { userId: string; volume: number }) =>
        dispatch(updateUserVolumesState(payload)),
      addChatRoomMessage: (message: Message) => dispatch(addChatRoomMessage(message)),
      editChatRoomMessage: (payload: {
        messageId: Message['id'];
        text: Message['text'];
        time?: Message['time'];
      }) => dispatch(editChatRoomMessage(payload)),
      deleteChatRoomMessage: (payload: {
        messageId: Message['id'];
        text?: Message['text'];
        time?: Message['time'];
      }) => dispatch(deleteChatRoomMessage(payload)),
      reactionChatRoomMessage: (payload: { messageId: Message['id']; reaction: Reaction }) =>
        dispatch(reactionChatRoomMessage(payload)),
      reactionPopChatRoomMessage: (payload: { messageId: Message['id']; reaction: Reaction }) =>
        dispatch(reactionPopChatRoomMessage(payload)),
      clearUnreadChatRoomMessages: () => dispatch(clearUnreadChatRoomMessages()),
      updateUserActionsInVoice: (payload: any) => {
        // Clear any previous timer before setting a new one
        if (setTimeOutRef.current) clearTimeout(setTimeOutRef.current);

        if (payload.type === 'raise-hand-off') {
          dispatch(updateUserActionsInVoice({}));
          // No timer needed — already cleared
          return;
        }

        dispatch(updateUserActionsInVoice(payload));

        const delay = payload.type === 'raise-hand' ? 10_000 : 3_000;
        setTimeOutRef.current = setTimeout(() => {
          dispatch(updateUserActionsInVoice({}));
        }, delay);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      room,
      currentRooms,
      loading,
      participants,
      chatRoomMessages,
      isUnreadChatRoomMessage,
      userVoiceState,
      userActionsInVoice,
    ]
  );

  useEffect(
    () => () => {
      if (setTimeOutRef.current) {
        clearTimeout(setTimeOutRef.current);
      }
    },
    []
  );

  return memoizedRoom;
};

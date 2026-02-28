import type { UserType } from 'src/types/type-user';
import type { UseWebRTCReturn } from 'src/hooks/useWebRTC';
import type { Message, Participant, ReactionMessageData } from 'src/types/type-room';

import { useCallback } from 'react';

import { useRoomTools } from 'src/core/slices';
import { useSocketContext } from 'src/core/contexts/socket-context';

import type { WebRTCEventData, ExistingParticipantsData } from '../type';

// ----------------------------------------------------------------------

export type UseReturnChatSocketListeners = {
  setupChatSocketListeners: () => () => void;
};

export function useChatSocketListeners(useWebRTC: UseWebRTCReturn): UseReturnChatSocketListeners {
  // Room management
  const {
    room,
    addParticipant,
    removeParticipant,
    updateParticipant,
    updateParticipantAudio,
    updateParticipantStatus,
    addChatRoomMessage,
    editChatRoomMessage,
    deleteChatRoomMessage,
    reactionChatRoomMessage,
    reactionPopChatRoomMessage,
    updateUserActionsInVoice,
  } = useRoomTools();

  const roomId = room?.id || '';

  // WebRTC
  const { createOffer, handleOffer, handleAnswer, handleIceCandidate } = useWebRTC;

  // Socket
  const { socket, on, off } = useSocketContext();

  // WebRTC and socket event handlers
  const setupChatSocketListeners = useCallback(() => {
    if (!socket) {
      return () => {};
    }

    // Existing participants
    const handleExistingParticipants = (data: ExistingParticipantsData) => {
      if (data.roomId !== roomId) return;
      data.participants.forEach((participant) => {
        if (participant.socketId !== socket.id) {
          addParticipant(participant);
          createOffer(participant.socketId, socket);
        }
      });
    };

    // User joined
    const handleUserJoined = (data: Participant) => {
      if (data.socketId !== socket?.id) {
        addParticipant(data);
        createOffer(data.socketId, socket);
      }
    };

    // User left
    const handleUserLeft = (data: { socketId: string; roomId?: string }) => {
      updateParticipant({ socketId: data.socketId, hasJoin: false });
    };

    // Audio toggled
    const handleAudioToggled = (data: { socketId: string; isMuted: boolean; roomId?: string }) => {
      updateParticipantAudio({ socketId: data.socketId, isMuted: data.isMuted });
    };

    // Status updated
    const handleStatusUpdated = (data: {
      socketId: string;
      status: UserType['status'];
      roomId?: string;
    }) => {
      if (!data.roomId || data.roomId === roomId) {
        updateParticipantStatus({ socketId: data.socketId, status: data.status });
      }
    };

    // Message handlers
    const handleGroupMessage = (data: Message) => {
      const receiveMessage: Message = {
        id: data.id,
        text: data.text,
        sender: data.sender,
        time: data.time,
        isUnread: true,
        isPrivate: false,
        type: data.type,
        systemMessageType: data?.systemMessageType,
        senderInfo: data.senderInfo,
        mentions: data.mentions || [],
        messageRepliedOf: data?.messageRepliedOf,
        senderSocketId: data?.senderSocketId,
        receiverSocketId: data?.receiverSocketId,
      };

      addChatRoomMessage(receiveMessage);
    };

    const handleReactionMessage = (data: ReactionMessageData) => {
      reactionChatRoomMessage({
        messageId: data.messageId,
        reaction: data.reaction,
      });
    };

    const handleReactionPopMessage = (data: ReactionMessageData) => {
      reactionPopChatRoomMessage({
        messageId: data.messageId,
        reaction: data.reaction,
      });
    };

    const handlePrivateMessage = (data: Message) => {
      const receiveMessage: Message = {
        id: data.id,
        text: data.text,
        sender: data.sender,
        time: data.time,
        senderInfo: data.senderInfo,
        receiverInfo: data?.receiverInfo,
        senderSocketId: data?.senderSocketId,
        receiverSocketId: data?.receiverSocketId,
        isUnread: true,
        isPrivate: true,
        type: data.type,
        systemMessageType: data?.systemMessageType,
        mentions: data.mentions || [],
        messageRepliedOf: data?.messageRepliedOf,
      };

      addChatRoomMessage(receiveMessage);
    };

    const handleEditedMessage = (data: { messageId: Message['id']; text: Message['text'] }) => {
      editChatRoomMessage(data);
    };

    const handleDeleteGroupMessage = (data: {
      messageId: Message['id'];
      text: Message['text'];
      time: Message['time'];
    }) => {
      deleteChatRoomMessage(data);
    };

    // WebRTC signaling
    const handleWebRTCOffer = (data: WebRTCEventData) => {
      handleOffer(data, socket);
    };

    const handleWebRTCAnswer = (data: WebRTCEventData) => {
      handleAnswer(data);
    };

    const handleWebRTCIceCandidate = (data: WebRTCEventData) => {
      handleIceCandidate(data);
    };

    const handleDeliverUserActionsInVoice = (data: any) => {
      updateUserActionsInVoice(data);
    };

    // Remove listeners to avoid duplicate calls
    off('existing-participants', handleExistingParticipants);
    off('user-joined', handleUserJoined);
    off('user-left', handleUserLeft);
    off('user-audio-toggled', handleAudioToggled);
    off('user-audio-toggled-self', handleAudioToggled);
    off('user-status-selected', handleStatusUpdated);
    off('receive-group-message', handleGroupMessage);
    off('receive-edit-group-message', handleEditedMessage);
    off('receive-delete-group-message', handleDeleteGroupMessage);
    off('receive-reaction-group-message', handleReactionMessage);
    off('receive-private-message', handlePrivateMessage);
    off('deliver-user-actions-in-voice', handleDeliverUserActionsInVoice);

    off('webrtc-offer', handleWebRTCOffer);
    off('webrtc-answer', handleWebRTCAnswer);
    off('webrtc-ice-candidate', handleWebRTCIceCandidate);

    // Register listeners
    on('existing-participants', handleExistingParticipants);
    on('user-joined', handleUserJoined);
    on('user-left', handleUserLeft);
    on('user-audio-toggled', handleAudioToggled);
    on('user-audio-toggled-self', handleAudioToggled);
    on('user-status-selected', handleStatusUpdated);
    on('receive-group-message', handleGroupMessage);
    on('receive-edit-group-message', handleEditedMessage);
    on('receive-delete-group-message', handleDeleteGroupMessage);
    on('receive-reaction-group-message', handleReactionMessage);
    on('receive-reaction-pop-group-message', handleReactionPopMessage);
    on('receive-private-message', handlePrivateMessage);
    on('deliver-user-actions-in-voice', handleDeliverUserActionsInVoice);

    on('webrtc-offer', handleWebRTCOffer);
    on('webrtc-answer', handleWebRTCAnswer);
    on('webrtc-ice-candidate', handleWebRTCIceCandidate);

    // Return cleanup function
    return () => {
      off('existing-participants', handleExistingParticipants);
      off('user-joined', handleUserJoined);
      off('user-left', handleUserLeft);
      off('user-audio-toggled', handleAudioToggled);
      off('user-audio-toggled-self', handleAudioToggled);
      off('user-status-selected', handleStatusUpdated);
      off('receive-group-message', handleGroupMessage);
      off('receive-edit-group-message', handleEditedMessage);
      off('receive-delete-group-message', handleDeleteGroupMessage);
      off('receive-reaction-group-message', handleReactionMessage);
      off('receive-private-message', handlePrivateMessage);
      off('deliver-user-actions-in-voice', handleDeliverUserActionsInVoice);

      off('webrtc-offer', handleWebRTCOffer);
      off('webrtc-answer', handleWebRTCAnswer);
      off('webrtc-ice-candidate', handleWebRTCIceCandidate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    socket,
    roomId,
    addParticipant,
    createOffer,
    removeParticipant,
    updateParticipantAudio,
    updateParticipantStatus,
    addChatRoomMessage,
    reactionChatRoomMessage,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
  ]);

  return { setupChatSocketListeners };
}

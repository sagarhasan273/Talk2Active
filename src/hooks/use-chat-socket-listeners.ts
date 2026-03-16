import type { UserType } from 'src/types/type-user';
import type { UseWebRTCReturn } from 'src/hooks/useWebRTC';
import type { Message, Participant, ReactionMessageData } from 'src/types/type-room';

import { useSelector } from 'react-redux';
import { useEffect, useCallback } from 'react';

import { useLeaveRoomMutation } from 'src/core/apis';
import { useRoomTools, selectAccount } from 'src/core/slices';
import { useSocketContext } from 'src/core/contexts/socket-context';

export interface WebRTCEventData {
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  sender?: string;
  target?: string;
}

export interface ExistingParticipantsData {
  participants: Participant[];
  roomId: string;
}

export type UseReturnChatSocketListeners = {
  onLeaveRoom: () => Promise<void>;
};

// screenShareWebRTC is now inside useWebRTC — no second argument needed
export function useChatSocketListeners(webRTC: UseWebRTCReturn): UseReturnChatSocketListeners {
  const user = useSelector(selectAccount);

  const {
    currentRooms,
    userVoiceState,
    setRoom,
    transferParticipantUserType,
    setCurrentRooms,
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
    updateUserVoiceState,
    resetParticipants,
  } = useRoomTools();

  const { roomId } = userVoiceState;

  const {
    removePeer,
    createOffer,
    handleOffer,
    handleAnswer,
    onClickMicrophone,
    handleIceCandidate,
    handleScreenShareOffer,
    handleScreenShareAnswer,
    handleScreenShareIce,
    handleScreenShareActive,
    handleScreenShareRequestedBy,
    cleanup: cleanupWebRTC,
  } = webRTC;

  const { socket, on, off } = useSocketContext();

  const [leaveRoom] = useLeaveRoomMutation();

  // ── Leave ─────────────────────────────────────────────────────────────────

  const handelLeaveChat = useCallback(
    async (kicked?: boolean) => {
      const joinedRoomId = roomId || (sessionStorage.getItem('joinedRoomId') as string);
      const userId = user.id || (sessionStorage.getItem('userId') as string);
      const name = user.id || (sessionStorage.getItem('username') as string);

      if (joinedRoomId) await leaveRoom({ roomId: joinedRoomId, userId, name, kicked }).unwrap();
      cleanupWebRTC();
      updateUserVoiceState({ hasJoined: false, roomId: null });
      resetParticipants();
      sessionStorage.removeItem('joinedRoomId');
    },
    [cleanupWebRTC, leaveRoom, resetParticipants, roomId, updateUserVoiceState, user.id]
  );

  useEffect(
    () => () => {
      handelLeaveChat();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ── Socket events ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!socket) return () => {};

    // Participants
    const handleExistingParticipants = (data: ExistingParticipantsData) => {
      if (data.roomId !== roomId) return;
      data.participants.forEach((participant) => {
        if (participant.socketId !== socket.id) {
          addParticipant(participant);
          createOffer(participant.socketId, socket);
        }
      });
    };

    const handleUserJoined = (data: Participant) => {
      if (data.socketId !== socket?.id) {
        addParticipant(data);
        createOffer(data.socketId, socket);
      }
    };

    const handleUserLeft = (data: { userId: string; socketId: string; kicked?: boolean }) => {
      if (data?.kicked) {
        removeParticipant(data?.userId);
      } else {
        updateParticipant({ userId: data.userId, hasJoin: false });
      }

      removePeer(data.socketId);
    };

    const handleAudioToggled = (data: { userId: string; isMuted: boolean }) => {
      updateParticipantAudio({ userId: data.userId, isMuted: data.isMuted });
    };

    const handleHostForceMicMute = (data: { targetUserId: string }) => {
      onClickMicrophone(true);
      updateUserVoiceState({ isMicMuted: true });
      updateParticipantAudio({ userId: data.targetUserId, isMuted: true });
    };

    const handleStatusUpdated = (data: {
      userId: string;
      status: UserType['status'];
      roomId?: string;
    }) => {
      if (!data.roomId || data.roomId === roomId) {
        updateParticipantStatus({ userId: data.userId, status: data.status });
      }
    };

    // Messages
    const handleGroupMessage = (data: Message) => {
      addChatRoomMessage({
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
      });
    };

    const handlePrivateMessage = (data: Message) => {
      addChatRoomMessage({
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
      });
    };

    const handleReactionMessage = (data: ReactionMessageData) =>
      reactionChatRoomMessage({ messageId: data.messageId, reaction: data.reaction });

    const handleReactionPopMessage = (data: ReactionMessageData) =>
      reactionPopChatRoomMessage({ messageId: data.messageId, reaction: data.reaction });

    const handleEditedMessage = (data: { messageId: Message['id']; text: Message['text'] }) =>
      editChatRoomMessage(data);

    const handleDeleteGroupMessage = (data: {
      messageId: Message['id'];
      text: Message['text'];
      time: Message['time'];
    }) => deleteChatRoomMessage(data);

    // Room updates
    const handleExistingRoomParticipant = (data: any) => {
      setCurrentRooms(
        currentRooms?.map((currentRoom) => {
          if (!data?.participants?.[currentRoom?.room?.id]?.length) return currentRoom;
          return {
            ...currentRoom,
            room: {
              ...currentRoom.room,
              currentParticipants: data.participants[currentRoom.room.id].map((p: any) => ({
                user: p,
                joinedAt: new Date().toDateString(),
              })),
            },
          };
        })
      );
    };

    const handleBroadcastRoomUpdate = (data: any) => {
      if (data?.type === 'transfer-host') {
        setCurrentRooms(
          currentRooms.map((currentRoom) => {
            if (currentRoom?.room?.id === data?.roomId) {
              transferParticipantUserType({ newUserId: data?.host?.id });
              setRoom({ ...currentRoom.room, host: data?.host });
              return {
                ...currentRoom,
                room: {
                  ...currentRoom.room,
                  host: data?.host,
                },
              };
            }

            return currentRoom;
          })
        );
        return;
      }

      const recentRoomIds = new Set(currentRooms?.map((r) => r?.room?.id) || []);

      const joinRoomId = data?.joinInfo?.roomId;
      const leaveRoomId = data?.leaveInfo?.roomId;

      if (!recentRoomIds.has(joinRoomId) && !recentRoomIds.has(leaveRoomId)) {
        return;
      }

      setCurrentRooms(
        currentRooms.map((currentRoom) => {
          if (currentRoom?.room?.id === data?.joinInfo?.roomId) {
            return {
              ...currentRoom,
              room: {
                ...currentRoom.room,
                currentParticipants: [
                  ...(currentRoom.room.currentParticipants || []),
                  { user: data.joinInfo.participant, joinedAt: new Date().toISOString() },
                ],
              },
            };
          }
          if (currentRoom?.room?.id === data?.leaveInfo?.roomId) {
            return {
              ...currentRoom,
              room: {
                ...currentRoom.room,
                currentParticipants: (currentRoom.room.currentParticipants || []).filter(
                  (p) => p?.user?.userId !== data?.leaveInfo?.participant?.userId
                ),
              },
            };
          }
          return currentRoom;
        })
      );
    };

    const handleKickFromRoom = () => {
      handelLeaveChat(true);
    };

    // Audio WebRTC
    const handleWebRTCOffer = (data: WebRTCEventData) => handleOffer(data, socket);
    const handleWebRTCAnswer = (data: WebRTCEventData) => handleAnswer(data);
    const handleWebRTCIce = (data: WebRTCEventData) => handleIceCandidate(data);
    const handleUserActions = (data: any) => updateUserActionsInVoice(data);

    // Screen share WebRTC — map directly to dedicated backend events
    const onScreenShareOffer = (data: any) => handleScreenShareOffer(data, socket);
    const onScreenShareAnswer = (data: any) => handleScreenShareAnswer(data);
    const onScreenShareIce = (data: any) => handleScreenShareIce(data);
    const onScreenShareActive = (data: any) => handleScreenShareActive(data, socket);
    const onScreenShareRequestedBy = (data: any) => handleScreenShareRequestedBy(data, socket);

    // ── Single event map — register & cleanup in one place ────────────────

    const events: [string, (...args: any[]) => void][] = [
      ['existing-participants', handleExistingParticipants],
      ['user-joined', handleUserJoined],
      ['user-left', handleUserLeft],
      ['user-audio-toggled', handleAudioToggled],
      ['user-audio-toggled-self', handleAudioToggled],
      ['force-muted', handleHostForceMicMute],
      ['kicked-from-room', handleKickFromRoom],
      ['user-status-selected', handleStatusUpdated],
      ['receive-group-message', handleGroupMessage],
      ['receive-edit-group-message', handleEditedMessage],
      ['receive-delete-group-message', handleDeleteGroupMessage],
      ['receive-reaction-group-message', handleReactionMessage],
      ['receive-reaction-pop-group-message', handleReactionPopMessage],
      ['receive-private-message', handlePrivateMessage],
      ['deliver-user-actions-in-voice', handleUserActions],
      ['room-updated-with-participant', handleBroadcastRoomUpdate],
      ['receive-rooms-existing-participants', handleExistingRoomParticipant],
      // Audio signaling
      ['webrtc-offer', handleWebRTCOffer],
      ['webrtc-answer', handleWebRTCAnswer],
      ['webrtc-ice-candidate', handleWebRTCIce],
      // Screen share signaling
      ['webrtc-screen-share-offer', onScreenShareOffer],
      ['webrtc-screen-share-answer', onScreenShareAnswer],
      ['webrtc-screen-share-ice', onScreenShareIce],
      ['screen-share-active', onScreenShareActive],
      ['screen-share-requested-by', onScreenShareRequestedBy],
    ];

    events.forEach(([event, handler]) => off(event, handler));
    events.forEach(([event, handler]) => on(event, handler));

    return () => {
      events.forEach(([event, handler]) => off(event, handler));
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
    handleScreenShareOffer,
    handleScreenShareAnswer,
    handleScreenShareIce,
  ]);

  return { onLeaveRoom: handelLeaveChat };
}

import type { Message, ReactionMessageData } from 'src/types/type-room';

import { useCallback } from 'react';
import { useParams } from 'react-router';

import { useMessagesTools } from 'src/core/slices';
import { useSocketContext } from 'src/core/contexts/socket-context';

// ----------------------------------------------------------------------

export function useSocialSocketListeners() {
  const roomId = useParams().roomId as string;

  // Room management
  const {
    addIndividualMessage,
    editIndividualMessage,
    deleteIndividualMessage,
    reactionIndividualMessage,
    reactionPopIndividualMessage,
  } = useMessagesTools();

  // Socket
  const { socket, on, off } = useSocketContext();

  // WebRTC and socket event handlers
  const setupSocialSocketListeners = useCallback(() => {
    if (!socket) {
      return () => {};
    }

    // Message handlers
    const handleIndividualMessage = (data: Message) => {
      const receiveMessage: Message = {
        id: data.id,
        text: data.text,
        sender: data.sender,
        time: data.time,
        isUnread: true,
        isPrivate: false,
        type: data.type,
        systemMessageType: data?.systemMessageType,
        userInfo: data.userInfo,
        mentions: data.mentions || [],
        messageRepliedOf: data?.messageRepliedOf,
        senderSocketId: data?.senderSocketId,
        targetSocketId: data?.targetSocketId,
      };

      addIndividualMessage(receiveMessage);
    };

    const handleReactionMessage = (data: ReactionMessageData) => {
      reactionIndividualMessage({
        messageId: data.messageId,
        reaction: data.reaction,
      });
    };

    const handleReactionPopMessage = (data: ReactionMessageData) => {
      reactionPopIndividualMessage({
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
        userInfo: data.userInfo,
        targetUserInfo: data?.targetUserInfo,
        senderSocketId: data?.senderSocketId,
        targetSocketId: data?.targetSocketId,
        isUnread: true,
        isPrivate: true,
        type: data.type,
        systemMessageType: data?.systemMessageType,
        mentions: data.mentions || [],
        messageRepliedOf: data?.messageRepliedOf,
      };

      addIndividualMessage(receiveMessage);
    };

    const handleEditedMessage = (data: { messageId: Message['id']; text: Message['text'] }) => {
      editIndividualMessage(data);
    };

    const handleDeleteIndividualMessage = (data: {
      messageId: Message['id'];
      text: Message['text'];
      time: Message['time'];
    }) => {
      deleteIndividualMessage(data);
    };

    // Register listeners
    on('receive-individual-message', handleIndividualMessage);
    on('receive-individual-message-self', handleIndividualMessage);
    on('receive-edit-individual-message', handleEditedMessage);
    on('receive-delete-individual-message', handleDeleteIndividualMessage);
    on('receive-reaction-individual-message', handleReactionMessage);
    on('receive-reaction-pop-individual-message', handleReactionPopMessage);
    on('receive-private-message', handlePrivateMessage);

    // Return cleanup function
    return () => {
      off('receive-individual-message', handleIndividualMessage);
      off('receive-individual-message-self', handleIndividualMessage);
      off('receive-edit-individual-message', handleEditedMessage);
      off('receive-delete-individual-message', handleDeleteIndividualMessage);
      off('receive-reaction-individual-message', handleReactionMessage);
      off('receive-private-message', handlePrivateMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, roomId, addIndividualMessage, reactionIndividualMessage]);

  return { setupSocialSocketListeners };
}

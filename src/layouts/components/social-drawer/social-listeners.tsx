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
    chatPeople,
    addIndividualMessage,
    editIndividualMessage,
    deleteIndividualMessage,
    reactionIndividualMessage,
    reactionPopIndividualMessage,
  } = useMessagesTools();
  console.log(chatPeople);
  // Socket
  const { socket, on, off } = useSocketContext();

  // WebRTC and socket event handlers
  const setupSocialSocketListeners: () => () => void = useCallback(() => {
    if (!socket) {
      return () => {};
    }

    // Message handlers
    const handleIndividualMessage = (data: any) => {
      const receiveMessage: any = {
        id: data.messageId,
        text: data.text,
        time: data.time,
        sender: data.sender,
        isUnread: true,
        type: data.type,
        senderInfo: data.senderInfo,
        targetUserInfo: data?.targetUserInfo,
        mentions: data.mentions || [],
        messageRepliedOf: data?.messageRepliedOf,
        senderSocketId: data?.senderSocketId,
        targetSocketId: data?.targetSocketId,
      };

      addIndividualMessage({ userId: data.senderInfo?.userId || '', message: receiveMessage });
    };

    const handleIndividualMessageSelf = (data: any) => {
      const receiveMessage: any = {
        id: data.messageId,
        text: data.text,
        time: data.time,
        sender: data.sender,
        isUnread: true,
        type: data.type,
        senderInfo: data.senderInfo,
        targetUserInfo: data?.targetUserInfo,
        mentions: data.mentions || [],
        messageRepliedOf: data?.messageRepliedOf,
        senderSocketId: data?.senderSocketId,
        targetSocketId: data?.targetSocketId,
      };

      addIndividualMessage({ userId: data.targetUserInfo?.userId || '', message: receiveMessage });
    };

    const handleReactionMessage = (data: ReactionMessageData) => {
      reactionIndividualMessage({
        userId: data.senderId,
        messageId: data.messageId,
        reaction: data.reaction,
      });
    };

    const handleReactionPopMessage = (data: ReactionMessageData) => {
      reactionPopIndividualMessage({
        userId: data.senderId,
        messageId: data.messageId,
        reaction: data.reaction,
      });
    };

    const handleEditedMessage = (data: {
      userId: string;
      messageId: Message['id'];
      text: Message['text'];
    }) => {
      editIndividualMessage(data);
    };

    const handleEditedMessageSelf = (data: {
      userId: string;
      messageId: Message['id'];
      text: Message['text'];
      targetUserInfo: {
        userId: string;
        name: string;
        avatar?: string;
      };
    }) => {
      const { messageId, text, targetUserInfo } = data;
      editIndividualMessage({
        userId: targetUserInfo?.userId || '',
        messageId,
        text,
      });
    };

    const handleDeleteIndividualMessage = (data: {
      senderId: string;
      receiverId: string;
      messageId: Message['id'];
      text: Message['text'];
      time: Message['time'];
    }) => {
      deleteIndividualMessage({ ...data, userId: data.senderId || '' });
    };

    const handleDeleteIndividualMessageSelf = (data: {
      senderId: string;
      receiverId: string;
      messageId: Message['id'];
      text: Message['text'];
      time: Message['time'];
    }) => {
      deleteIndividualMessage({ ...data, userId: data.receiverId || '' });
    };

    // Register listeners
    on('receive-individual-message', handleIndividualMessage);
    on('receive-individual-message-self', handleIndividualMessageSelf);
    on('receive-edit-individual-message', handleEditedMessage);
    on('receive-edit-individual-message-self', handleEditedMessageSelf);
    on('receive-delete-individual-message', handleDeleteIndividualMessage);
    on('receive-delete-individual-message-self', handleDeleteIndividualMessageSelf);
    on('receive-reaction-individual-message', handleReactionMessage);
    on('receive-reaction-pop-individual-message', handleReactionPopMessage);

    // Return cleanup function
    return () => {
      off('receive-individual-message', handleIndividualMessage);
      off('receive-individual-message-self', handleIndividualMessageSelf);
      off('receive-edit-individual-message', handleEditedMessage);
      off('receive-edit-individual-message-self', handleEditedMessageSelf);
      off('receive-delete-individual-message', handleDeleteIndividualMessage);
      off('receive-delete-individual-message-self', handleDeleteIndividualMessageSelf);
      off('receive-reaction-individual-message', handleReactionMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, roomId, addIndividualMessage, reactionIndividualMessage]);

  return { setupSocialSocketListeners };
}

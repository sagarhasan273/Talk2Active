import type { UserType } from 'src/types/type-user';
import type { Message, ReactionMessageData } from 'src/types/type-room';

import { useEffect } from 'react';

import { useMessagesTools } from 'src/core/slices';
import { useSocketContext } from 'src/core/contexts/socket-context';

// ----------------------------------------------------------------------

export function useSocialSocketListeners() {

  // Room management
  const {
    addIndividualMessage,
    editIndividualMessage,
    deleteIndividualMessage,
    reactionIndividualMessage,
  } = useMessagesTools();

  // Socket
  const { socket, on, off } = useSocketContext();

  // WebRTC and socket event handlers
  useEffect(() => {
    if (!socket) {
      return () => { };
    }

    // Message handlers
    const handleIndividualMessage = (data: any) => {
      const receiveMessage: any = {
        id: data.messageId,
        text: data.text,
        time: data.time,
        sender: data.sender,
        startOfUnread: data.startOfUnread || false,
        isUnread: true,
        type: data.type,
        senderInfo: data.senderInfo,
        receiverInfo: data?.receiverInfo,
        mentions: data.mentions || [],
        parentMessage: data?.parentMessage,
        senderSocketId: data?.senderSocketId,
        receiverSocketId: data?.receiverSocketId,
      };

      addIndividualMessage({ userId: data.senderInfo?.id || '', message: receiveMessage });
    };

    const handleIndividualMessageSelf = (data: any) => {
      const receiveMessage: any = {
        id: data.messageId,
        text: data.text,
        time: data.time,
        sender: data.sender,
        isUnread: false,
        type: data.type,
        startOfUnread: false,
        senderInfo: data.senderInfo,
        receiverInfo: data?.receiverInfo,
        parentMessage: data?.parentMessage,
        senderSocketId: data?.senderSocketId,
        receiverSocketId: data?.receiverSocketId,
      };

      addIndividualMessage({ userId: data.receiverInfo?.id || '', message: receiveMessage });
    };

    const handleReactionMessage = (data: ReactionMessageData) => {
      reactionIndividualMessage({
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
      receiverInfo: Partial<UserType>;
    }) => {
      const { messageId, text, receiverInfo } = data;
      editIndividualMessage({
        userId: receiverInfo?.id || '',
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

    off('receive-individual-message', handleIndividualMessage);
    off('receive-individual-message-self', handleIndividualMessageSelf);
    off('receive-edit-individual-message', handleEditedMessage);
    off('receive-edit-individual-message-self', handleEditedMessageSelf);
    off('receive-delete-individual-message', handleDeleteIndividualMessage);
    off('receive-delete-individual-message-self', handleDeleteIndividualMessageSelf);
    off('receive-reaction-individual-message', handleReactionMessage);

    // Register listeners
    on('receive-individual-message', handleIndividualMessage);
    on('receive-individual-message-self', handleIndividualMessageSelf);
    on('receive-edit-individual-message', handleEditedMessage);
    on('receive-edit-individual-message-self', handleEditedMessageSelf);
    on('receive-delete-individual-message', handleDeleteIndividualMessage);
    on('receive-delete-individual-message-self', handleDeleteIndividualMessageSelf);
    on('receive-reaction-individual-message', handleReactionMessage);

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
  }, [socket, addIndividualMessage, reactionIndividualMessage]);
}

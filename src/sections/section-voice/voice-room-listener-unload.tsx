// src/components/room-unload-listener.tsx
import { useCredentials, useRoomTools } from '@/core/slices';
import { useRoomUnloadBeacon } from '@/hooks/use-room-unload-beacon';
import React from 'react';

interface VoiceRoomListenerUnloadProps {

    enabled?: boolean;
}

export const VoiceRoomListenerUnload: React.FC<VoiceRoomListenerUnloadProps> = ({
    enabled
}) => {
    const { user } = useCredentials();
    const { room } = useRoomTools();

    useRoomUnloadBeacon({ roomId: room?.roomId, userId: user.userId, enabled });
    return null;
};
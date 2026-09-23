// src/sections/section-voice-room/hooks/use-participant-connection-state.ts

import { useRoomContext } from '@livekit/components-react';
import { ConnectionQuality, ConnectionState, Participant, RemoteParticipant, RoomEvent } from 'livekit-client';
import { useEffect, useMemo, useState } from 'react';

export type ParticipantConnectionStatus =
    | 'connecting'
    | 'connected'
    | 'reconnecting'
    | 'disconnected'
    | 'closed';

interface Props {
    participantId: string;
    isSelf?: boolean;
    hasJoin?: boolean;
}

export function useParticipantConnectionState({
    participantId,
    isSelf = false,
    hasJoin = true,
}: Props): ParticipantConnectionStatus {
    const room = useRoomContext();

    // 1. Helper: Find peer by identity (LiveKit map keys use internal SID, not identity)
    const isPeerConnected = () => {
        if (!room) return false;
        for (const p of room.remoteParticipants.values()) {
            if (p.identity === participantId) return true;
        }
        return false;
    };

    // 2. Track connection state
    const [status, setStatus] = useState<ParticipantConnectionStatus>(() => {
        if (isSelf) return 'connected';
        return isPeerConnected() ? 'connected' : 'connecting';
    });

    useEffect(() => {
        if (isSelf || !room) return;

        // Sync on mount or when participantId updates
        if (isPeerConnected()) setStatus('connected');

        const onConnected = (p: RemoteParticipant) => {
            if (p.identity === participantId) setStatus('connected');
        };

        const onDisconnected = (p: RemoteParticipant) => {
            if (p.identity === participantId) setStatus('disconnected');
        };

        const onQuality = (quality: ConnectionQuality, p: Participant) => {
            if (p.identity !== participantId) return;
            if (quality === ConnectionQuality.Lost || quality === ConnectionQuality.Poor) {
                setStatus('reconnecting');
            } else {
                setStatus('connected');
            }
        };

        room.on(RoomEvent.ParticipantConnected, onConnected);
        room.on(RoomEvent.ParticipantDisconnected, onDisconnected);
        room.on(RoomEvent.ConnectionQualityChanged, onQuality);

        return () => {
            room.off(RoomEvent.ParticipantConnected, onConnected);
            room.off(RoomEvent.ParticipantDisconnected, onDisconnected);
            room.off(RoomEvent.ConnectionQualityChanged, onQuality);
        };
    }, [room, participantId, isSelf]);

    // 3. Fallbacks for self and closed stage
    return useMemo(() => {
        if (!hasJoin) return 'closed';

        if (isSelf) {
            if (room?.state === ConnectionState.Connecting) return 'connecting';
            if (room?.state === ConnectionState.Reconnecting) return 'reconnecting';
            if (room?.state === ConnectionState.Disconnected) return 'disconnected';
            return 'connected';
        }

        return status;
    }, [hasJoin, isSelf, room?.state, status]);
}
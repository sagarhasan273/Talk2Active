// src/sections/section-voice-room/hooks/use-participant-connection-state.ts

import { useRoomContext } from '@livekit/components-react';
import {
    ConnectionQuality,
    ConnectionState,
    Participant,
    RemoteParticipant,
    RoomEvent,
} from 'livekit-client';
import { useEffect, useMemo, useState } from 'react';

export type ParticipantConnectionStatus =
    | 'connecting'
    | 'connected'
    | 'reconnecting'
    | 'disconnected'
    | 'closed';

interface UseParticipantConnectionStateProps {
    participantId: string;
    isSelf?: boolean;
    hasJoin?: boolean;
}

export function useParticipantConnectionState({
    participantId,
    isSelf = false,
    hasJoin = true,
}: UseParticipantConnectionStateProps): ParticipantConnectionStatus {
    const room = useRoomContext();

    // 1. Check if LiveKit has established the WebRTC session for this participant
    const remoteParticipant = useMemo(() => {
        if (isSelf || !room) return undefined;
        return room.remoteParticipants.get(participantId);
    }, [room, participantId, isSelf]);

    // 2. Initial state: If in stage list but not yet in WebRTC room, they are CONNECTING
    const [remoteStatus, setRemoteStatus] = useState<
        'connecting' | 'connected' | 'reconnecting' | 'disconnected'
    >(() => {
        if (isSelf) return 'connected';
        return remoteParticipant ? 'connected' : 'connecting';
    });

    // --------------------------------------------------------------------------
    // A. LOCAL PARTICIPANT: Broadcast when connection is back / established
    // --------------------------------------------------------------------------
    useEffect(() => {
        if (!isSelf || !room || !room.localParticipant) return;

        const broadcastStatus = async (status: 'connected' | 'reconnecting' | 'disconnected') => {
            try {
                const payload = JSON.stringify({
                    type: 'PARTICIPANT_CONNECTION_STATUS',
                    identity: room.localParticipant.identity,
                    status,
                });

                await room.localParticipant.publishData(new TextEncoder().encode(payload), {
                    reliable: status === 'connected',
                    topic: 'room_interactions',
                });
            } catch {
                // Socket may be offline during reconnect
            }
        };

        const handleStateChange = (state: ConnectionState) => {
            if (state === ConnectionState.Connected) {
                broadcastStatus('connected');
            } else if (state === ConnectionState.Reconnecting) {
                broadcastStatus('reconnecting');
            }
        };

        room.on(RoomEvent.ConnectionStateChanged, handleStateChange);
        return () => {
            room.off(RoomEvent.ConnectionStateChanged, handleStateChange);
        };
    }, [isSelf, room]);

    // --------------------------------------------------------------------------
    // B. REMOTE PARTICIPANT: Listen to SFU Engine & Data Channel
    // --------------------------------------------------------------------------
    useEffect(() => {
        if (isSelf || !room) return;

        // 1. If remote peer just joined the room session
        const handleParticipantConnected = (peer: RemoteParticipant) => {
            if (peer.identity === participantId) {
                setRemoteStatus('connected');
            }
        };

        // 2. If remote peer left or connection timed out
        const handleParticipantDisconnected = (peer: RemoteParticipant) => {
            if (peer.identity === participantId) {
                setRemoteStatus('disconnected');
            }
        };

        // 3. SFU RTCP Watchdog: Triggers "reconnecting" within 1.5s of Wi-Fi loss
        const handleQualityChange = (quality: ConnectionQuality, p: Participant) => {
            if (p.identity !== participantId) return;

            if (quality === ConnectionQuality.Lost || quality === ConnectionQuality.Poor) {
                setRemoteStatus('reconnecting');
            } else if (
                quality === ConnectionQuality.Good ||
                quality === ConnectionQuality.Excellent
            ) {
                setRemoteStatus('connected');
            }
        };

        // 4. Manual recovery message from the peer
        const handleDataReceived = (payload: Uint8Array) => {
            try {
                const text = new TextDecoder().decode(payload);
                const data = JSON.parse(text);

                if (data.type === 'PARTICIPANT_CONNECTION_STATUS' && data.identity === participantId) {
                    setRemoteStatus(data.status);
                }
            } catch {
                // Ignore other payloads
            }
        };

        room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
        room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
        room.on(RoomEvent.ConnectionQualityChanged, handleQualityChange);
        room.on(RoomEvent.DataReceived, handleDataReceived);

        return () => {
            room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
            room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
            room.off(RoomEvent.ConnectionQualityChanged, handleQualityChange);
            room.off(RoomEvent.DataReceived, handleDataReceived);
        };
    }, [isSelf, room, participantId]);

    // --------------------------------------------------------------------------
    // C. Derive final status
    // --------------------------------------------------------------------------
    return useMemo(() => {
        if (!hasJoin) return 'closed';

        if (isSelf) {
            if (room?.state === ConnectionState.Connecting) return 'connecting';
            if (room?.state === ConnectionState.Reconnecting) return 'reconnecting';
            if (room?.state === ConnectionState.Disconnected) return 'disconnected';
            return 'connected';
        }

        return remoteStatus;
    }, [hasJoin, isSelf, room?.state, remoteStatus]);
}
// src/sections/section-voice/context/voice-room-stage-context.tsx

import { useLocalParticipant, useParticipants } from '@livekit/components-react';
import { ConnectionState, type Participant } from 'livekit-client';
import React, { createContext, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { selectParticipants, selectRoom, useCredentials } from '@/core/slices';
import type { ParticipantStageType } from '@/types/type-room';

export interface RoomStageContextValue {
    participants: ParticipantStageType[];
    participantsMap: Record<string, ParticipantStageType>;
    totalCount: number;
    hostParticipant?: ParticipantStageType;
    hostId: string;
}

const RoomStageContext = createContext<RoomStageContextValue | null>(null);

export interface RoomStageProviderProps {
    children: React.ReactNode;
    raisedHandsSet: Set<string>;
    participantReactions: Record<string, string>;
}

export function RoomStageProvider({
    children,
    raisedHandsSet,
    participantReactions,
}: RoomStageProviderProps) {
    // 1. LiveKit Subscriptions
    const remoteParticipants = useParticipants();
    const { localParticipant } = useLocalParticipant();

    // 2. Redux Subscriptions
    const activeRoom = useSelector(selectRoom);
    const reduxParticipants = useSelector(selectParticipants) || {};

    // 3. Credentials & Relations
    const {
        currentUserId,
        checkIfFollowing,
        checkIfFriend,
        checkIfBlocked,
    } = useCredentials();

    // 4. Resolve Host ID
    const hostId = useMemo(() => {
        if (!activeRoom?.host) return '';
        const h = activeRoom.host as any;
        return String(h?.userId);
    }, [activeRoom?.host]);

    const localIdentity = localParticipant?.identity;

    // 5. Merge Redux + LiveKit Participant Data
    const { participants, participantsMap, hostParticipant } = useMemo(() => {
        const list: ParticipantStageType[] = [];
        const map: Record<string, ParticipantStageType> = {};
        let host: ParticipantStageType | undefined;

        // If there is no active room in Redux, abort and provide empty list
        if (!activeRoom) {
            return { participants: [], participantsMap: {}, hostParticipant: undefined };
        }

        // Index all active LiveKit participants
        const livekitMap = new Map<string, Participant>();

        if (localParticipant?.identity) {
            livekitMap.set(String(localParticipant.identity), localParticipant);
        }
        remoteParticipants.forEach((p) => {
            if (p?.identity) {
                livekitMap.set(String(p.identity), p);
            }
        });

        // Extract valid Redux participants that belong strictly to the current active room
        const currentReduxParticipants: Record<string, any> = {};
        Object.entries(reduxParticipants).forEach(([key, val]: [string, any]) => {
            // If your participant object stores a roomId, verify it matches
            if (!val?.roomId || val.roomId === activeRoom?.roomId) {
                currentReduxParticipants[key] = val;
            }
        });

        // Collect distinct keys
        const allIdentities = new Set<string>([
            ...Object.keys(currentReduxParticipants),
            ...livekitMap.keys(),
        ]);

        allIdentities.forEach((participantIdentity) => {
            if (!participantIdentity) return;

            const livekitP = livekitMap.get(participantIdentity);
            const roomData = (currentReduxParticipants[participantIdentity] || {}) as any;

            const isSelf =
                participantIdentity === localIdentity ||
                participantIdentity === String(currentUserId);

            const handRaised = raisedHandsSet.has(participantIdentity);

            let parsedMeta: Record<string, any> = {};
            try {
                if (livekitP?.metadata) {
                    parsedMeta = JSON.parse(livekitP.metadata);
                }
            } catch {
                // Fallback for non-JSON strings
            }

            const isHostParticipant = Boolean(
                (hostId && participantIdentity === hostId) ||
                parsedMeta.isHost ||
                roomData.isHost
            );

            const enriched: ParticipantStageType = {
                ...roomData,
                id: participantIdentity,
                userId: roomData.userId || parsedMeta.userId || participantIdentity,
                name:
                    livekitP?.name ||
                    parsedMeta.name ||
                    roomData.name ||
                    (isSelf ? 'You' : 'Anonymous'),
                username: parsedMeta.username || roomData.username || '',
                verified: Boolean(parsedMeta.verified ?? roomData.verified),
                profilePhoto: parsedMeta.profilePhoto || roomData.profilePhoto || '',
                genUserId: parsedMeta.genUserId || roomData.genUserId || '',
                accountType: parsedMeta.accountType || roomData.accountType,
                status: parsedMeta.status || roomData.status || 'online',
                isHost: isHostParticipant,
                handRaised,
                activeReactionEmoji: participantReactions[participantIdentity] || null,
                isSelf,
                role: isHostParticipant ? 'host' : (roomData.role || 'listener'),
                rawParticipant: livekitP,

                // Only mark Connecting if we are genuinely joined to a room
                connectionStatus: livekitP
                    ? (roomData.connectionStatus || ConnectionState.Connected)
                    : ConnectionState.Connecting,

                isFollowing: !isSelf && checkIfFollowing?.(participantIdentity),
                isFriend: !isSelf && checkIfFriend?.(participantIdentity),
                isBlocked: !isSelf && checkIfBlocked?.(participantIdentity),
            };

            list.push(enriched);
            map[participantIdentity] = enriched;

            if (isHostParticipant && !host) {
                host = enriched;
            }
        });

        return {
            participants: list,
            participantsMap: map,
            hostParticipant: host,
        };
    }, [
        activeRoom,
        remoteParticipants,
        localParticipant,
        reduxParticipants,
        localIdentity,
        currentUserId,
        hostId,
        raisedHandsSet,
        participantReactions,
        checkIfFollowing,
        checkIfFriend,
        checkIfBlocked,
    ]);

    const value = useMemo<RoomStageContextValue>(
        () => ({
            participants,
            participantsMap,
            totalCount: participants.length,
            hostParticipant,
            hostId,
        }),
        [participants, participantsMap, hostParticipant, hostId]
    );

    return (
        <RoomStageContext.Provider value={value}>
            {children}
        </RoomStageContext.Provider>
    );
}

export function useRoomStage(): RoomStageContextValue {
    const context = useContext(RoomStageContext);
    if (!context) {
        throw new Error('useRoomStage must be used within a RoomStageProvider');
    }
    return context;
}
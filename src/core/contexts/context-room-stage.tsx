// src/sections/section-voice/context/voice-room-stage-context.tsx

import { useLocalParticipant, useParticipants } from '@livekit/components-react';
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
    // 1. LiveKit Real-Time Subscriptions
    const remoteParticipants = useParticipants();
    const { localParticipant } = useLocalParticipant();

    // 2. Redux Store Subscriptions
    const activeRoom = useSelector(selectRoom);
    const reduxParticipants = useSelector(selectParticipants) || {};

    // 3. Social Relations & Fast Set Lookups
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
        return String(h?.userId || h?._id || h);
    }, [activeRoom?.host]);

    const localIdentity = localParticipant?.identity;

    // 5. Merge Redux + LiveKit Participant Data
    const { participants, participantsMap, hostParticipant } = useMemo(() => {
        const list: ParticipantStageType[] = [];
        const map: Record<string, ParticipantStageType> = {};
        let host: ParticipantStageType | undefined;

        for (let i = 0; i < remoteParticipants.length; i += 1) {
            const p = remoteParticipants[i];
            const participantIdentity = String(p.identity);
            const isSelf = participantIdentity === localIdentity || participantIdentity === currentUserId;
            const handRaised = raisedHandsSet.has(participantIdentity);

            // Extract stored Redux room participant data
            const roomData = (reduxParticipants[participantIdentity] || {}) as any;

            let parsedMeta: Record<string, any> = {};
            try {
                if (p.metadata) parsedMeta = JSON.parse(p.metadata);
            } catch {
                // Fallback for non-JSON metadata strings
            }

            const isHostParticipant = Boolean(
                (hostId && participantIdentity === hostId) || parsedMeta.isHost || roomData.isHost
            );

            const enriched: ParticipantStageType = {
                ...roomData,
                id: participantIdentity,
                userId: roomData.userId || parsedMeta.userId || participantIdentity,
                name: parsedMeta.name || roomData.name || p.name || 'Anonymous',
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
                rawParticipant: p,

                isFollowing: !isSelf && checkIfFollowing(participantIdentity),
                isFriend: !isSelf && checkIfFriend(participantIdentity),
                isBlocked: !isSelf && checkIfBlocked(participantIdentity),
            };

            list.push(enriched);
            map[participantIdentity] = enriched;

            if (isHostParticipant) {
                host = enriched;
            }
        }

        return {
            participants: list,
            participantsMap: map,
            hostParticipant: host,
        };
    }, [
        remoteParticipants,
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

// Consumer Hook with Explicit Return Type
export function useRoomStage(): RoomStageContextValue {
    const context = useContext(RoomStageContext);
    if (!context) {
        throw new Error('useRoomStage must be used within a RoomStageProvider');
    }
    return context;
}
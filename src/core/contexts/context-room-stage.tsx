import { useLocalParticipant, useParticipants } from '@livekit/components-react';
import React, { createContext, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { selectRoom, useCredentials } from '@/core/slices';

import type { ParticipantStageType } from '@/types/type-room';

interface RoomStageContextValue {
    participants: ParticipantStageType[];
    participantsMap: Record<string, ParticipantStageType>;
    totalCount: number;
    hostParticipant?: ParticipantStageType;
    hostId: string;
}

const RoomStageContext = createContext<RoomStageContextValue | null>(null);

interface RoomStageProviderProps {
    children: React.ReactNode;
    raisedHandsSet: Set<string>;
    participantReactions: Record<string, string>;
}

export function RoomStageProvider({
    children,
    raisedHandsSet,
    participantReactions,
}: RoomStageProviderProps) {
    // 1. LiveKit Real-Time Room Subscriptions
    const remoteParticipants = useParticipants();
    const { localParticipant } = useLocalParticipant();

    // 2. Select only the room document from Redux (avoids rerendering when other participants change in Redux)
    const reduxRoom = useSelector(selectRoom);
    const activeRoom = reduxRoom;

    // 3. Social Relations & Fast Set Lookups
    const {
        currentUserId,
        checkIfFollowing,
        checkIfFriend,
        checkIfBlocked,
    } = useCredentials();

    // 4. Resolve Host ID cleanly
    const hostId = useMemo(() => {
        if (!activeRoom?.host) return '';
        const h = activeRoom.host as any;
        return String(h?.userId || h?._id || h);
    }, [activeRoom?.host]);

    const localIdentity = localParticipant?.identity;

    // 5. Build Enriched Stage Participant List & Map
    const { participants, participantsMap, hostParticipant } = useMemo(() => {
        const list: ParticipantStageType[] = [];
        const map: Record<string, ParticipantStageType> = {};
        let host: ParticipantStageType | undefined;

        for (let i = 0; i < remoteParticipants.length; i += 1) {
            const p = remoteParticipants[i];
            const participantIdentity = String(p.identity);
            const isSelf = participantIdentity === localIdentity || participantIdentity === currentUserId;
            const handRaised = raisedHandsSet.has(participantIdentity);

            let parsedMeta: Record<string, any> = {};
            try {
                if (p.metadata) parsedMeta = JSON.parse(p.metadata);
            } catch {
                // Fallback for non-JSON metadata strings
            }

            const isHostParticipant = Boolean(
                (hostId && participantIdentity === hostId) || parsedMeta.isHost
            );

            const enriched: ParticipantStageType = {
                id: participantIdentity,
                userId: participantIdentity,
                name: parsedMeta.name || p.name || 'Anonymous',
                username: parsedMeta.username || '',
                verified: Boolean(parsedMeta.verified),
                profilePhoto: parsedMeta.profilePhoto || '',
                genUserId: parsedMeta.genUserId || '',
                accountType: parsedMeta.accountType,
                isHost: isHostParticipant,
                handRaised,
                activeReactionEmoji: participantReactions[participantIdentity] || null,
                isSelf,
                role: isHostParticipant ? 'host' : 'listener',
                rawParticipant: p,

                isFollowing: !isSelf && checkIfFollowing(participantIdentity),
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
        localIdentity,
        currentUserId,
        hostId,
        raisedHandsSet,
        participantReactions,
        checkIfFollowing,
        checkIfFriend,
        checkIfBlocked,
    ]);

    const value = useMemo(
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

// Consumer hook
export function useVoiceRoomStage() {
    const context = useContext(RoomStageContext);
    if (!context) {
        throw new Error('useVoiceRoomStage must be used within a RoomStageProvider');
    }
    return context;
}
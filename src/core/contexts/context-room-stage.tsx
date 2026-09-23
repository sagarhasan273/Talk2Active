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
    const remoteParticipants = useParticipants();
    const { localParticipant } = useLocalParticipant();

    const activeRoom = useSelector(selectRoom);
    const reduxParticipants = useSelector(selectParticipants) || {};

    const { currentUserId, checkIfFollowing, checkIfBlocked } = useCredentials();

    const hostId = useMemo(() => {
        const h = activeRoom?.host as any;
        return String(h?.userId || h?._id || h?.id || '');
    }, [activeRoom?.host]);

    const { participants, participantsMap, hostParticipant } = useMemo(() => {
        if (!activeRoom) {
            return { participants: [], participantsMap: {}, hostParticipant: undefined };
        }

        // 1. Index all connected LiveKit peers by identity
        const livekitMap = new Map<string, Participant>();
        if (localParticipant?.identity) livekitMap.set(String(localParticipant.identity), localParticipant);
        remoteParticipants.forEach((p) => {
            if (p?.identity) livekitMap.set(String(p.identity), p);
        });

        // 2. Filter Redux participants for current room only
        const validRedux: Record<string, any> = {};
        Object.entries(reduxParticipants).forEach(([key, val]: [string, any]) => {
            if (!val?.roomId || val.roomId === activeRoom.roomId) validRedux[key] = val;
        });

        const allKeys = new Set([...Object.keys(validRedux), ...livekitMap.keys()]);
        const list: ParticipantStageType[] = [];
        const map: Record<string, ParticipantStageType> = {};
        let host: ParticipantStageType | undefined;

        allKeys.forEach((key) => {
            const roomData = validRedux[key] || {};
            const dataUserId = roomData.userId ? String(roomData.userId) : undefined;

            // Find in LiveKit by key or userId
            const livekitP = livekitMap.get(key) || (dataUserId ? livekitMap.get(dataUserId) : undefined);

            let meta: Record<string, any> = {};
            try {
                if (livekitP?.metadata) meta = JSON.parse(livekitP.metadata);
            } catch {
                // Fallback
            }

            const id = String(livekitP?.identity || dataUserId || key);
            const isSelf = id === String(localParticipant?.identity) || id === String(currentUserId);
            const isHost = Boolean((hostId && id === hostId) || meta.isHost || roomData.isHost);

            const enriched: ParticipantStageType = {
                ...roomData,
                id,
                userId: dataUserId || meta.userId || id,
                name: livekitP?.name || meta.name || roomData.name || (isSelf ? 'You' : 'Anonymous'),
                username: meta.username || roomData.username || '',
                verified: Boolean(meta.verified ?? roomData.verified),
                profilePhoto: meta.profilePhoto || roomData.profilePhoto || '',
                genUserId: meta.genUserId || roomData.genUserId || '',
                accountType: meta.accountType || roomData.accountType,
                status: meta.status || roomData.status || 'online',
                isHost,
                handRaised: raisedHandsSet.has(id),
                activeReactionEmoji: participantReactions[id] || null,
                isSelf,
                role: isHost ? 'host' : (roomData.role || 'listener'),
                rawParticipant: livekitP,

                // If found in LiveKit -> Connected, otherwise still Connecting
                connectionStatus: livekitP ? ConnectionState.Connected : ConnectionState.Connecting,

                joinedAt: roomData.joinedAt || meta.joinedAt || new Date().toISOString(),
                follower_count: roomData.follower_count ?? meta.follower_count ?? 0,
                following_count: roomData.following_count ?? meta.following_count ?? 0,
                friend_count: roomData.friend_count ?? meta.friend_count ?? 0,

                isFollowing: !isSelf && checkIfFollowing?.(id),
                isBlocked: !isSelf && checkIfBlocked?.(id),
            };

            list.push(enriched);
            map[id] = enriched;
            if (isHost && !host) host = enriched;
        });

        return { participants: list, participantsMap: map, hostParticipant: host };
    }, [
        activeRoom,
        remoteParticipants,
        localParticipant,
        reduxParticipants,
        currentUserId,
        hostId,
        raisedHandsSet,
        participantReactions,
        checkIfFollowing,
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

    return <RoomStageContext.Provider value={value}>{children}</RoomStageContext.Provider>;
}

export function useRoomStage(): RoomStageContextValue {
    const context = useContext(RoomStageContext);
    if (!context) {
        throw new Error('useRoomStage must be used within a RoomStageProvider');
    }
    return context;
}
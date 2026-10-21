// src/sections/section-voice/voice-room-stage/room-stage-participants.tsx

import { useSocket } from '@/core/contexts';
import useRoomSounds from '@/hooks/use-room-sounds';
import { SOCKET_EVENTS } from '@/lib/socket-events';
import type { ParticipantStageType, RoomParticipantType } from '@/types/type-room';
import { getCachedUserInfo } from '@/utils/user-cache';
import {
  ParticipantContext,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
  useTracks,
} from '@livekit/components-react';
import { Box, BoxProps } from '@mui/material';
import { RoomEvent, Track, type Participant } from 'livekit-client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EmptySlotTile } from './room-stage-empty-slot-tile';
import ParticipantTile from './room-stage-participant-tile';

const extractParticipantId = (payload: any): string =>
  String(
    payload?.participantId ||
    payload?.userId ||
    payload?.participant?.userId ||
    payload?.user?.userId ||
    ''
  );

function parseParticipant(
  data: Partial<RoomParticipantType> & { userId: string },
  livekitP?: Participant,
  localIdentity?: string,
  isHandRaised = false,
  activeReactionEmoji: string | null = null,
  isGhost = false
): ParticipantStageType {
  const id = String(data.userId);
  const isSelf = Boolean(data.isSelf || (localIdentity && localIdentity === id));
  const isHost = Boolean(data.isHost);

  return {
    userId: id,
    id,
    genUserId: data.genUserId ?? '',
    name: livekitP?.name || data.name || (isSelf ? 'You' : 'Anonymous'),
    username: data.username ?? '',
    profilePhoto: data.profilePhoto ?? '',
    bio: data.bio ?? '',
    verified: Boolean(data.verified),
    accountType: data.accountType ?? 'member',
    follower_count: data.follower_count ?? 0,
    following_count: data.following_count ?? 0,
    friend_count: data.friend_count ?? 0,
    isFollowing: Boolean(data.isFollowing),
    isBlocked: Boolean(data.isBlocked),
    isHost,
    isSelf,
    joinedAt: data.joinedAt ? new Date(data.joinedAt).toISOString() : new Date().toISOString(),
    status: isGhost ? 'offline' : 'online',
    role: isHost ? 'host' : 'listener',
    handRaised: isGhost ? false : isHandRaised,
    activeReactionEmoji: isGhost ? null : activeReactionEmoji,
    rawParticipant: livekitP,
    isGhost,
  };
}

export interface RoomStageParticipantsProps extends BoxProps {
  participants: RoomParticipantType[];
  raisedHandsSet?: Set<string>;
  participantReactions?: Record<string, string>;
  openSlots: number;
  maxParticipants: number;
}

export const RoomStageParticipants = ({
  participants = [],
  raisedHandsSet = new Set(),
  participantReactions = {},
  openSlots,
  maxParticipants,
  sx,
  ...other
}: RoomStageParticipantsProps) => {
  const room = useRoomContext();
  const remoteLiveKitParticipants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const { socket } = useSocket();
  const { playUserLeave } = useRoomSounds();

  const [ghostIds, setGhostIds] = useState<Set<string>>(new Set());

  const screenShareTracks = useTracks([Track.Source.ScreenShare]);
  const sharingParticipantIds = useMemo(
    () =>
      new Set(
        screenShareTracks
          .filter((t) => Boolean(t?.publication))
          .map((t) => String(t.participant.identity))
      ),
    [screenShareTracks]
  );

  const clearGhostId = useCallback((id: string) => {
    if (!id) return;
    setGhostIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // 1. Socket listener for leave & join
  useEffect(() => {
    if (!socket) return undefined;

    const handleUserLeave = (payload: any) => {
      const targetId = extractParticipantId(payload);
      if (!targetId) return;

      setGhostIds((prev) => {
        if (prev.has(targetId)) return prev;
        const next = new Set(prev);
        next.add(targetId);
        return next;
      });
      playUserLeave?.();
    };

    const handleUserJoin = (payload: any) => {
      clearGhostId(extractParticipantId(payload));
    };

    socket.on(SOCKET_EVENTS.BROADCAST_USER_LEAVE, handleUserLeave);
    socket.on(SOCKET_EVENTS.BROADCAST_USER_JOIN, handleUserJoin);

    return () => {
      socket.off(SOCKET_EVENTS.BROADCAST_USER_LEAVE, handleUserLeave);
      socket.off(SOCKET_EVENTS.BROADCAST_USER_JOIN, handleUserJoin);
    };
  }, [socket, playUserLeave, clearGhostId]);

  useEffect(() => {
    if (!room) return undefined;

    const handleParticipantConnected = (lkParticipant: Participant) => {
      clearGhostId(String(lkParticipant.identity));
    };

    const handleTrackPubOrUnmute = (_pub: unknown, lkParticipant: Participant) => {
      if (lkParticipant?.identity) {
        clearGhostId(String(lkParticipant.identity));
      }
    };

    const handleTrackSubscribed = (
      _track: unknown,
      _pub: unknown,
      lkParticipant: Participant
    ) => {
      if (lkParticipant?.identity) {
        clearGhostId(String(lkParticipant.identity));
      }
    };

    const handleActiveSpeakers = (speakers: Participant[]) => {
      speakers.forEach((s) => clearGhostId(String(s.identity)));
    };

    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.TrackPublished, handleTrackPubOrUnmute);
    room.on(RoomEvent.TrackUnmuted, handleTrackPubOrUnmute);
    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakers);

    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.TrackPublished, handleTrackPubOrUnmute);
      room.off(RoomEvent.TrackUnmuted, handleTrackPubOrUnmute);
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.off(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakers);
    };
  }, [room, clearGhostId]);

  useEffect(() => {
    setGhostIds((prev) => {
      if (prev.size === 0) return prev;

      const apiIds = new Set(participants.map((p) => String(p.userId)));
      const lkIds = new Set(remoteLiveKitParticipants.map((p) => String(p.identity)));

      let changed = false;
      const next = new Set(prev);

      prev.forEach((id) => {
        if (!apiIds.has(id) && !lkIds.has(id)) {
          next.delete(id);
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [participants, remoteLiveKitParticipants]);

  const displayParticipants = useMemo(() => {
    const livekitMap = new Map<string, Participant>();

    if (localParticipant?.identity) {
      livekitMap.set(String(localParticipant.identity), localParticipant);
    }
    remoteLiveKitParticipants.forEach((p) => {
      if (p?.identity) livekitMap.set(String(p.identity), p);
    });

    const processedIds = new Set<string>();

    const parsed = participants.map((p) => {
      const id = String(p.userId);
      processedIds.add(id);

      return parseParticipant(
        p,
        livekitMap.get(id),
        localParticipant?.identity,
        raisedHandsSet.has(id),
        participantReactions[id] || null,
        ghostIds.has(id)
      );
    });

    livekitMap.forEach((lkParticipant, id) => {
      if (!processedIds.has(id)) {
        const lkCachedP = getCachedUserInfo(id);

        parsed.push(
          parseParticipant(
            { userId: id, name: lkParticipant.name, profilePhoto: lkCachedP?.avatarUrl },
            lkParticipant,
            localParticipant?.identity,
            raisedHandsSet.has(id),
            participantReactions[id] || null,
            ghostIds.has(id)
          )
        );
      }
    });

    const others = parsed.filter((p) => !p.isSelf);
    const self = parsed.filter((p) => p.isSelf);

    return [...others, ...self];
  }, [
    participants,
    ghostIds,
    remoteLiveKitParticipants,
    localParticipant,
    raisedHandsSet,
    participantReactions,
  ]);

  return (
    <Box sx={{ display: 'contents', width: 1, ...sx }} {...other}>
      {displayParticipants.map((participant) => {
        const isSharingScreen = sharingParticipantIds.has(participant.id);

        return (
          <Box key={participant.id} sx={{ display: 'contents' }}>
            {participant.rawParticipant && !participant.isGhost ? (
              <ParticipantContext.Provider value={participant.rawParticipant}>
                <ParticipantTile
                  participant={participant}
                  isSharingScreen={isSharingScreen}
                />
              </ParticipantContext.Provider>
            ) : (
              <ParticipantTile
                participant={participant}
                isSharingScreen={isSharingScreen}
              />
            )}
          </Box>
        );
      })}
      {openSlots > 0 && <EmptySlotTile openSlots={openSlots} maxParticipants={maxParticipants} />}
    </Box>
  );
};

export default RoomStageParticipants;

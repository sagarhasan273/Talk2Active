// src/sections/section-voice/voice-room-stage/room-stage-participants.tsx

import useRoomSounds from '@/hooks/use-room-sounds';
import type { ParticipantStageType, RoomParticipantType } from '@/types/type-room';
import {
  ParticipantContext,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
  useTracks,
} from '@livekit/components-react';
import { alpha, Box, BoxProps, Typography } from '@mui/material';
import { ConnectionState, Track, type Participant } from 'livekit-client';
import { Monitor } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EmptySlotTile } from './room-stage-empty-slot-tile';
import ParticipantTile from './room-stage-participant-tile';

const GHOST_DURATION_MS = 3000;

function parseParticipant(
  data: Partial<RoomParticipantType> & { userId: string },
  livekitP?: Participant,
  roomState?: ConnectionState,
  localIdentity?: string,
  isHandRaised = false,
  activeReactionEmoji: string | null = null,
  isGhost = false
): ParticipantStageType {
  const id = String(data.userId);
  const isSelf = Boolean(data.isSelf || (localIdentity && localIdentity === id));
  const isHost = Boolean(data.isHost);

  const connectionStatus = isGhost
    ? ConnectionState.Disconnected
    : isSelf
      ? roomState || ConnectionState.Connected
      : livekitP
        ? ConnectionState.Connected
        : ConnectionState.Connecting;

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
    rawParticipant: isGhost ? undefined : livekitP,
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
  const { playUserLeave } = useRoomSounds();

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

  const [ghostIds, setGhostIds] = useState<Set<string>>(new Set());
  const [orderedParticipants, setOrderedParticipants] = useState<RoomParticipantType[]>(participants);

  const ghostTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const playUserLeaveRef = useRef(playUserLeave);

  useEffect(() => {
    playUserLeaveRef.current = playUserLeave;
  }, [playUserLeave]);

  useEffect(() => {
    return () => {
      Object.values(ghostTimersRef.current).forEach(clearTimeout);
      ghostTimersRef.current = {};
    };
  }, []);

  useEffect(() => {
    const propsMap = new Map(participants.map((p) => [String(p.userId), p]));

    setGhostIds((prevGhosts) => {
      let modified = false;
      const nextGhosts = new Set(prevGhosts);

      participants.forEach((p) => {
        const id = String(p.userId);
        if (nextGhosts.has(id)) {
          nextGhosts.delete(id);
          modified = true;
          if (ghostTimersRef.current[id]) {
            clearTimeout(ghostTimersRef.current[id]);
            delete ghostTimersRef.current[id];
          }
        }
      });

      return modified ? nextGhosts : prevGhosts;
    });

    setOrderedParticipants((prevOrdered) => {
      const existingIds = new Set<string>();

      const updatedList = prevOrdered.map((old) => {
        const id = String(old.userId);
        existingIds.add(id);

        const freshData = propsMap.get(id);
        if (freshData) return freshData;

        if (!ghostTimersRef.current[id]) {
          setGhostIds((g) => new Set(g).add(id));

          ghostTimersRef.current[id] = setTimeout(() => {
            setGhostIds((g) => {
              const next = new Set(g);
              next.delete(id);
              return next;
            });

            setOrderedParticipants((current) =>
              current.filter((item) => String(item.userId) !== id)
            );

            playUserLeaveRef.current?.();
            delete ghostTimersRef.current[id];
          }, GHOST_DURATION_MS);
        }

        return old;
      });

      const newcomers = participants.filter((p) => !existingIds.has(String(p.userId)));
      return newcomers.length > 0 ? [...updatedList, ...newcomers] : updatedList;
    });
  }, [participants]);

  const displayParticipants = useMemo(() => {
    const livekitMap = new Map<string, Participant>();

    if (localParticipant?.identity) {
      livekitMap.set(String(localParticipant.identity), localParticipant);
    }
    remoteLiveKitParticipants.forEach((p) => {
      if (p?.identity) livekitMap.set(String(p.identity), p);
    });

    const processedIds = new Set<string>();

    const parsed = orderedParticipants.map((p) => {
      const id = String(p.userId);
      processedIds.add(id);

      const isGhost = ghostIds.has(id) && !livekitMap.has(id);

      return parseParticipant(
        p,
        livekitMap.get(id),
        room?.state,
        localParticipant?.identity,
        raisedHandsSet.has(id),
        participantReactions[id] || null,
        isGhost
      );
    });

    livekitMap.forEach((lkParticipant, id) => {
      if (!processedIds.has(id)) {
        parsed.push(
          parseParticipant(
            { userId: id, name: lkParticipant.name },
            lkParticipant,
            room?.state,
            localParticipant?.identity,
            raisedHandsSet.has(id),
            participantReactions[id] || null,
            false
          )
        );
      }
    });

    const others = parsed.filter((p) => !p.isSelf);
    const self = parsed.filter((p) => p.isSelf);

    return [...others, ...self];
  }, [
    orderedParticipants,
    ghostIds,
    remoteLiveKitParticipants,
    localParticipant,
    room?.state,
    raisedHandsSet,
    participantReactions,
  ]);

  console.log(remoteLiveKitParticipants);

  return (
    <Box sx={{ display: 'contents', width: 1, ...sx }} {...other}>
      {displayParticipants.map((participant) => {
        const isGhost = Boolean(participant.isGhost);
        const isSharingScreen = sharingParticipantIds.has(participant.id);

        return (
          <Box
            key={participant.id}
            sx={{
              width: { xs: 128, sm: 140, md: 168 },
              minWidth: { xs: 128, sm: 140, md: 168 },
              minHeight: 148,
              position: 'relative',
              flexShrink: 0,
              transition: 'opacity 0.4s ease, filter 0.4s ease',
              opacity: isGhost ? 0.35 : 1,
              filter: isGhost ? 'grayscale(90%)' : 'none',
              pointerEvents: isGhost ? 'none' : 'auto',
            }}
          >
            {isSharingScreen && !isGhost && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  zIndex: 6,
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 0.75,
                  bgcolor: 'info.main',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.4,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  pointerEvents: 'none',
                }}
              >
                <Monitor size={10} />
                <Typography
                  sx={{
                    fontSize: '0.55rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    lineHeight: 1,
                  }}
                >
                  Live
                </Typography>
              </Box>
            )}

            {isGhost && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: alpha('#000', 0.78),
                  backdropFilter: 'blur(6px)',
                  color: '#fff',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  zIndex: 4,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Left
                </Typography>
              </Box>
            )}

            {participant.rawParticipant && !isGhost ? (
              <ParticipantContext.Provider value={participant.rawParticipant}>
                <ParticipantTile participant={participant} />
              </ParticipantContext.Provider>
            ) : (
              <ParticipantTile participant={participant} />
            )}
          </Box>
        );
      })}
      {openSlots > 0 && <EmptySlotTile openSlots={openSlots} maxParticipants={maxParticipants} />}
    </Box>
  );
};

export default RoomStageParticipants;

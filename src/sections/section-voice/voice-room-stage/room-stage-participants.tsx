import type { ParticipantStageType, RoomParticipantType } from '@/types/type-room';
import {
  ParticipantContext,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
} from '@livekit/components-react';
import { alpha, Box, BoxProps, Typography } from '@mui/material';
import { ConnectionState, type Participant } from 'livekit-client';
import { useEffect, useMemo, useRef, useState } from 'react';
import ParticipantTile from './room-stage-participant-tile';

const GHOST_DURATION_MS = 3000;

function parseParticipant(
  data: RoomParticipantType,
  livekitP?: Participant,
  roomState?: ConnectionState,
  localIdentity?: string,
  isHandRaised: boolean = false,
  activeReactionEmoji: string | null = null,
  isGhost: boolean = false
): ParticipantStageType & { isGhost?: boolean } {
  const id = String(data.userId);
  const isSelf = Boolean(data.isSelf || (localIdentity && localIdentity === id));

  const connectionStatus = isGhost
    ? ConnectionState.Disconnected
    : isSelf
      ? roomState || ConnectionState.Connected
      : livekitP
        ? ConnectionState.Connected
        : ConnectionState.Connecting;

  return {
    ...data,
    id,
    userId: id,
    name: livekitP?.name || data.name || (isSelf ? 'You' : 'Anonymous'),
    username: data.username || '',
    profilePhoto: data.profilePhoto || '',
    genUserId: data.genUserId || '',
    accountType: data.accountType || 'member',
    status: isGhost ? 'offline' : 'online',
    isHost: Boolean(data.isHost),
    handRaised: isGhost ? false : isHandRaised,
    activeReactionEmoji: isGhost ? null : activeReactionEmoji,
    role: data.isHost ? 'host' : 'listener',
    isSelf,
    isFollowing: Boolean(data.isFollowing),
    isBlocked: Boolean(data.isBlocked),
    verified: Boolean(data.verified),
    follower_count: data.follower_count ?? 0,
    following_count: data.following_count ?? 0,
    friend_count: data.friend_count ?? 0,
    joinedAt: new Date(data.joinedAt).toISOString(),
    rawParticipant: isGhost ? undefined : livekitP,
    connectionStatus,
    isGhost,
  } as ParticipantStageType & { isGhost?: boolean };
}

export interface RoomStageParticipantsProps extends BoxProps {
  participants: RoomParticipantType[];
  raisedHandsSet?: Set<string>;
  participantReactions?: Record<string, string>;
}

export const RoomStageParticipants = ({
  participants = [],
  raisedHandsSet = new Set(),
  participantReactions = {},
  sx,
  ...other
}: RoomStageParticipantsProps) => {
  const room = useRoomContext();
  const remoteLiveKitParticipants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  const [ghostIds, setGhostIds] = useState<Set<string>>(new Set());
  const [orderedParticipants, setOrderedParticipants] = useState<RoomParticipantType[]>(participants);

  const ghostTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.values(ghostTimersRef.current).forEach(clearTimeout);
      ghostTimersRef.current = {};
    };
  }, []);

  // Sync incoming participants: keep slots stable, update data, ghost dropouts
  useEffect(() => {
    const propsMap = new Map(participants.map((p) => [String(p.userId), p]));

    // 1. Cancel ghost status for any user that returned
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

      // 2. Update existing entries in-place so props changes (like follower_count / isFollowing) reflect immediately
      const updatedList = prevOrdered.map((old) => {
        const id = String(old.userId);
        existingIds.add(id);

        const freshData = propsMap.get(id);

        if (freshData) {
          return freshData; // Data updated, position preserved
        }

        // 3. User is missing from props -> start 3s ghost timer if not already active
        if (!ghostTimersRef.current[id]) {
          setGhostIds((g) => new Set(g).add(id));

          ghostTimersRef.current[id] = setTimeout(() => {
            setGhostIds((g) => {
              const next = new Set(g);
              next.delete(id);
              return next;
            });
            setOrderedParticipants((current) => current.filter((item) => String(item.userId) !== id));
            delete ghostTimersRef.current[id];
          }, GHOST_DURATION_MS);
        }

        return old;
      });

      // 4. Append actual newcomers to the bottom without shuffling
      const newcomers = participants.filter((p) => !existingIds.has(String(p.userId)));

      return newcomers.length > 0 ? [...updatedList, ...newcomers] : updatedList;
    });
  }, [participants]);

  // Map to LiveKit participant details
  const displayParticipants = useMemo(() => {
    const livekitMap = new Map<string, Participant>();

    if (localParticipant?.identity) {
      livekitMap.set(String(localParticipant.identity), localParticipant);
    }
    remoteLiveKitParticipants.forEach((p) => {
      if (p?.identity) livekitMap.set(String(p.identity), p);
    });

    return orderedParticipants.map((p) => {
      const id = String(p.userId);
      const isGhost = ghostIds.has(id);
      const isHandRaised = raisedHandsSet.has(id);
      const activeReactionEmoji = participantReactions[id] || null;

      return parseParticipant(
        p,
        livekitMap.get(id),
        room?.state,
        localParticipant?.identity,
        isHandRaised,
        activeReactionEmoji,
        isGhost
      );
    });
  }, [
    orderedParticipants,
    ghostIds,
    remoteLiveKitParticipants,
    localParticipant,
    room?.state,
    raisedHandsSet,
    participantReactions,
  ]);

  return (
    <>
      {displayParticipants.map((participant) => {
        const isGhost = Boolean(participant.isGhost);

        return (
          <Box
            key={participant.id}
            sx={{
              width: { xs: 'calc(50% - 8px)', sm: 140, md: 160 },
              minHeight: 160,
              position: 'relative',
              transition: 'opacity 0.4s ease, filter 0.4s ease',
              opacity: isGhost ? 0.35 : 1,
              filter: isGhost ? 'grayscale(90%)' : 'none',
              pointerEvents: isGhost ? 'none' : 'auto',
              ...sx,
            }}
            {...other}
          >
            {isGhost && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: alpha('#000', 0.7),
                  backdropFilter: 'blur(4px)',
                  color: '#fff',
                  px: 1,
                  py: 0.2,
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
    </>
  );
};

export default RoomStageParticipants;
import type { ParticipantStageType, RoomParticipantType } from '@/types/type-room';
import {
  ParticipantContext,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
} from '@livekit/components-react';
import { Box, BoxProps } from '@mui/material';
import { ConnectionState, type Participant } from 'livekit-client';
import { useMemo } from 'react';
import ParticipantTile from './room-stage-participant-tile';

// Helper 1: For users present in the props array
function parseParticipant(
  data: RoomParticipantType,
  livekitP?: Participant,
  roomState?: ConnectionState,
  localIdentity?: string,
  isHandRaised: boolean = false,
  activeReactionEmoji: string | null = null
): ParticipantStageType {
  const id = String(data.userId);
  const isSelf = Boolean(data.isSelf || (localIdentity && localIdentity === id));

  const connectionStatus = isSelf
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
    status: 'online',
    isHost: Boolean(data.isHost),
    handRaised: isHandRaised,
    activeReactionEmoji,
    role: data.isHost ? 'host' : 'listener',
    isSelf,
    isFollowing: Boolean(data.isFollowing),
    isBlocked: Boolean(data.isBlocked),
    verified: Boolean(data.verified),
    follower_count: data.follower_count ?? 0,
    following_count: data.following_count ?? 0,
    friend_count: data.friend_count ?? 0,
    joinedAt: new Date(data.joinedAt).toISOString(),
    rawParticipant: livekitP,
    connectionStatus,
  } as ParticipantStageType;
}

// Helper 2: For users in LiveKit who haven't arrived in props yet
function parseLiveKitOnlyParticipant(
  livekitP: Participant,
  localIdentity?: string,
  isHandRaised: boolean = false,
  activeReactionEmoji: string | null = null
): ParticipantStageType {
  let meta: Record<string, any> = {};
  try {
    if (livekitP.metadata) meta = JSON.parse(livekitP.metadata);
  } catch {
    // Non-JSON fallback
  }

  const id = String(livekitP.identity);
  const isSelf = Boolean(localIdentity && localIdentity === id);

  return {
    id,
    userId: meta.userId || id,
    name: livekitP.name || meta.name || (isSelf ? 'You' : 'Anonymous'),
    username: meta.username || '',
    profilePhoto: meta.profilePhoto || '',
    genUserId: meta.genUserId || '',
    accountType: meta.accountType || 'member',
    status: 'online',
    isHost: Boolean(meta.isHost),
    handRaised: isHandRaised,
    activeReactionEmoji,
    role: meta.isHost ? 'host' : 'listener',
    isSelf,
    verified: Boolean(meta.verified),
    follower_count: meta.follower_count ?? 0,
    following_count: meta.following_count ?? 0,
    friend_count: meta.friend_count ?? 0,
    joinedAt: meta.joinedAt || new Date().toISOString(),
    rawParticipant: livekitP,
    connectionStatus: ConnectionState.Connected,
  } as ParticipantStageType;
}

export interface RoomStageParticipantsProps extends BoxProps {
  participants: RoomParticipantType[];
  raisedHandsSet?: Set<string>;
  participantReactions?: Record<string, string>;
  onProfileClick?: (participant: ParticipantStageType) => void;
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

  const displayParticipants = useMemo<ParticipantStageType[]>(() => {
    // 1. Index all active LiveKit peers
    const livekitMap = new Map<string, Participant>();

    if (localParticipant?.identity) {
      livekitMap.set(String(localParticipant.identity), localParticipant);
    }
    remoteLiveKitParticipants.forEach((p) => {
      if (p?.identity) livekitMap.set(String(p.identity), p);
    });

    const renderedIds = new Set<string>();

    // 2. Render all users from props with real-time hand raise and reaction state
    const list: ParticipantStageType[] = participants.map((p) => {
      const id = String(p.userId);
      renderedIds.add(id);

      const isHandRaised = raisedHandsSet.has(id);
      const activeReactionEmoji = participantReactions[id] || null;

      return parseParticipant(
        p,
        livekitMap.get(id),
        room?.state,
        localParticipant?.identity,
        isHandRaised,
        activeReactionEmoji
      );
    });

    // 3. Catch any active LiveKit peer missing from props
    livekitMap.forEach((livekitP, identity) => {
      if (!renderedIds.has(identity)) {
        const isHandRaised = raisedHandsSet.has(identity);
        const activeReactionEmoji = participantReactions[identity] || null;

        list.push(
          parseLiveKitOnlyParticipant(
            livekitP,
            localParticipant?.identity,
            isHandRaised,
            activeReactionEmoji
          )
        );
      }
    });

    return list;
  }, [
    participants,
    remoteLiveKitParticipants,
    localParticipant,
    room?.state,
    raisedHandsSet,
    participantReactions,
  ]);

  return (
    <>
      {displayParticipants.map((participant) => (
        <Box
          key={participant.id}
          sx={{
            width: { xs: 'calc(50% - 8px)', sm: 140, md: 160 },
            minHeight: 160,
            ...sx,
          }}
          {...other}
        >
          {participant.rawParticipant ? (
            <ParticipantContext.Provider value={participant.rawParticipant}>
              <ParticipantTile
                participant={participant}
              />
            </ParticipantContext.Provider>
          ) : (
            <ParticipantTile
              participant={participant}
            />
          )}
        </Box>
      ))}
    </>
  );
};

export default RoomStageParticipants;

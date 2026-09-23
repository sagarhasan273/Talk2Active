// src/sections/section-voice-room/voice-room-workspace/room-stage-participants.tsx

import type { ParticipantStageType, RoomParticipantType } from '@/types/type-room';
import {
  ParticipantContext,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
} from '@livekit/components-react';
import { Box, BoxProps } from '@mui/material';
import {
  ConnectionQuality,
  ConnectionState,
  Participant,
  RemoteParticipant,
  RoomEvent,
} from 'livekit-client';
import { useEffect, useMemo, useRef, useState } from 'react';
import ParticipantTile from './room-stage-participant-tile';

type RemoteStatus =
  | 'connecting'
  | 'connected'
  | 'poor'
  | 'reconnecting'
  | 'disconnected';

interface RemoteParticipantStatus {
  status: RemoteStatus;
  quality: ConnectionQuality;
}

export interface RoomStageParticipantsProps extends BoxProps {
  participants: RoomParticipantType[];
}

export const RoomStageParticipants = ({
  participants = [],
  sx,
  ...other
}: RoomStageParticipantsProps) => {
  const room = useRoomContext();
  const remoteLiveKitParticipants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  // 1. Connection states per identity
  const [remoteStatusMap, setRemoteStatusMap] = useState<
    Record<string, { status: ConnectionState; quality: ConnectionQuality }>
  >({});

  // 2. Ghost participants during disconnect countdown
  const [ghostParticipants, setGhostParticipants] = useState<
    Record<string, ParticipantStageType>
  >({});

  const participantsRef = useRef<RoomParticipantType[]>(participants);
  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  const disconnectTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // --------------------------------------------------------------------------
  // LiveKit Connection & RTCP Watchdog
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!room) return;

    const handleParticipantConnected = (peer: RemoteParticipant) => {
      const identity = peer.identity;

      // Clear any pending ghost removal timer
      if (disconnectTimersRef.current[identity]) {
        clearTimeout(disconnectTimersRef.current[identity]);
        delete disconnectTimersRef.current[identity];
      }

      setGhostParticipants((prev) => {
        if (!prev[identity]) return prev;
        const next = { ...prev };
        delete next[identity];
        return next;
      });

      setRemoteStatusMap((prev) => ({
        ...prev,
        [identity]: {
          status: ConnectionState.Connected,
          quality: peer.connectionQuality ?? ConnectionQuality.Unknown,
        },
      }));
    };

    const handleParticipantDisconnected = (peer: RemoteParticipant) => {
      const identity = peer.identity;

      setRemoteStatusMap((prev) => ({
        ...prev,
        [identity]: {
          status: ConnectionState.Disconnected,
          quality: peer.connectionQuality ?? ConnectionQuality.Unknown,
        },
      }));

      // Snapshot the participant into ghost state for 3 seconds
      const currentSnapshot = participantsRef.current.find(
        (p) => String(p.userId) === identity
      );

      if (currentSnapshot) {
        setGhostParticipants((prev) => ({
          ...prev,
          [identity]: {
            ...currentSnapshot,
            id: currentSnapshot.userId,
            joinedAt: new Date(currentSnapshot.joinedAt).toISOString(),
            connectionStatus: ConnectionState.Disconnected,
            rawParticipant: undefined,
            role: 'participant',
            handRaised: false,
            activeReactionEmoji: null,
          } as unknown as ParticipantStageType,
        }));
      }

      if (disconnectTimersRef.current[identity]) {
        clearTimeout(disconnectTimersRef.current[identity]);
      }

      disconnectTimersRef.current[identity] = setTimeout(() => {
        setGhostParticipants((prev) => {
          const next = { ...prev };
          delete next[identity];
          return next;
        });

        setRemoteStatusMap((prev) => {
          const next = { ...prev };
          delete next[identity];
          return next;
        });

        delete disconnectTimersRef.current[identity];
      }, 3000);
    };

    const handleConnectionQualityChanged = (quality: ConnectionQuality, p: Participant) => {
      if (p.isLocal) return;
      const identity = p.identity;

      setRemoteStatusMap((prev) => {
        const isDegraded =
          quality === ConnectionQuality.Poor || quality === ConnectionQuality.Lost;

        return {
          ...prev,
          [identity]: {
            status: isDegraded ? ConnectionState.Reconnecting : ConnectionState.Connected,
            quality,
          },
        };
      });
    };

    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    room.on(RoomEvent.ConnectionQualityChanged, handleConnectionQualityChanged);

    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
      room.off(RoomEvent.ConnectionQualityChanged, handleConnectionQualityChanged);

      Object.values(disconnectTimersRef.current).forEach(clearTimeout);
      disconnectTimersRef.current = {};
    };
  }, [room]);

  // --------------------------------------------------------------------------
  // Merge Room Participants with LiveKit WebRTC Tracks & Ghosts
  // --------------------------------------------------------------------------
  const displayParticipants = useMemo<ParticipantStageType[]>(() => {
    // 1. Build fast identity lookup map for active LiveKit peers
    const livekitMap = new Map<string, Participant>();
    if (localParticipant?.identity) {
      livekitMap.set(String(localParticipant.identity), localParticipant);
    }
    remoteLiveKitParticipants.forEach((p) => {
      if (p?.identity) {
        livekitMap.set(String(p.identity), p);
      }
    });

    const list: ParticipantStageType[] = [];
    const processedIds = new Set<string>();

    // 2. Map and enrich incoming participants prop
    participants.forEach((p) => {
      const id = String(p.userId);
      processedIds.add(id);

      const livekitP = livekitMap.get(id);
      const isSelf = Boolean(p.isSelf || (localParticipant && localParticipant.identity === id));

      // Resolve connection status
      let status: ConnectionState;
      if (isSelf) {
        status = room?.state || ConnectionState.Connected;
      } else if (remoteStatusMap[id]) {
        status = remoteStatusMap[id].status;
      } else {
        status = livekitP ? ConnectionState.Connected : ConnectionState.Connecting;
      }

      list.push({
        ...p,
        id,
        joinedAt: new Date(p.joinedAt).toISOString(),
        isSelf,
        rawParticipant: livekitP,
        connectionStatus: status,
      } as ParticipantStageType);
    });

    // 3. Append remaining ghosts that are no longer in the active participants prop
    Object.entries(ghostParticipants).forEach(([ghostId, ghost]) => {
      if (!processedIds.has(ghostId)) {
        list.push(ghost);
      }
    });

    return list;
  }, [
    participants,
    ghostParticipants,
    remoteLiveKitParticipants,
    localParticipant,
    remoteStatusMap,
    room?.state,
  ]);

  return (
    <>
      {displayParticipants.map((participant) => {
        const tile = <ParticipantTile participant={participant} />;

        return (
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
                {tile}
              </ParticipantContext.Provider>
            ) : (
              tile
            )}
          </Box>
        );
      })}
    </>
  );
};

export default RoomStageParticipants;

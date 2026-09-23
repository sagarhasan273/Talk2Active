// src/sections/section-voice-room/voice-room-workspace/room-stage-participants.tsx

import type { ParticipantStageType } from '@/types/type-room';
import {
  ParticipantContext,
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
  participants: ParticipantStageType[];
}

export const RoomStageParticipants = ({
  participants = [],
  sx,
  ...other
}: RoomStageParticipantsProps) => {
  const room = useRoomContext();

  const [remoteStatusMap, setRemoteStatusMap] = useState<
    Record<string, RemoteParticipantStatus>
  >({});

  const [ghostParticipants, setGhostParticipants] = useState<
    Record<string, ParticipantStageType>
  >({});

  const participantsRef = useRef<ParticipantStageType[]>(participants);
  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  const disconnectTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // --------------------------------------------------------------------------
  // 1. Synchronize 'connecting' state when `participants` prop changes
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!room) return;

    setRemoteStatusMap((prev) => {
      const next = { ...prev };
      let changed = false;

      participants.forEach((p) => {
        const identity = p.rawParticipant?.identity || String(p.id);

        // Skip local participant
        if (room.localParticipant?.identity === identity) return;

        // If the peer is already registered in our map and not disconnected, keep it
        if (next[identity] && next[identity].status !== 'disconnected') return;

        // Check if LiveKit already has them connected
        const isAlreadyConnected = room.remoteParticipants.has(identity);

        next[identity] = {
          status: isAlreadyConnected ? 'connected' : 'connecting',
          quality: ConnectionQuality.Unknown,
        };
        changed = true;
      });

      return changed ? next : prev;
    });
  }, [participants, room]);

  // --------------------------------------------------------------------------
  // 2. Room Event Listeners (Connected, Disconnected, Quality)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!room) return;

    const handleParticipantConnected = (participant: RemoteParticipant) => {
      const identity = participant.identity;

      // Cancel pending ghost timers
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
          status: 'connected',
          quality: participant.connectionQuality ?? ConnectionQuality.Unknown,
        },
      }));
    };

    const handleParticipantDisconnected = (participant: RemoteParticipant) => {
      const identity = participant.identity;

      setRemoteStatusMap((prev) => ({
        ...prev,
        [identity]: {
          status: 'disconnected',
          quality: participant.connectionQuality ?? ConnectionQuality.Unknown,
        },
      }));

      const snapshot = participantsRef.current.find(
        (p) => (p.rawParticipant?.identity || String(p.id)) === identity
      );

      if (snapshot) {
        setGhostParticipants((prev) => ({
          ...prev,
          [identity]: snapshot,
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

    const handleConnectionQualityChanged = (
      quality: ConnectionQuality,
      participant: Participant
    ) => {
      if (participant.isLocal) return;
      const identity = participant.identity;

      setRemoteStatusMap((prev) => {
        const current = prev[identity];
        if (!current || current.status === 'disconnected') return prev;

        const isDegraded =
          quality === ConnectionQuality.Poor || quality === ConnectionQuality.Lost;

        return {
          ...prev,
          [identity]: {
            status: isDegraded ? 'poor' : 'connected',
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
  // 3. Merge Live & Ghost Participants
  // --------------------------------------------------------------------------
  const displayParticipants = useMemo(() => {
    const list = [...participants];
    const liveIds = new Set(
      participants.map((p) => p.rawParticipant?.identity || String(p.id))
    );

    Object.entries(ghostParticipants).forEach(([ghostId, ghostParticipant]) => {
      if (!liveIds.has(ghostId)) {
        list.push(ghostParticipant);
      }
    });

    return list;
  }, [participants, ghostParticipants]);

  return (
    <>
      {displayParticipants.map((participant) => {
        const identity =
          participant.rawParticipant?.identity || String(participant.id);

        const isLocal = room.localParticipant?.identity === identity;
        const remoteInfo = remoteStatusMap[identity];

        let currentStatus: ConnectionState;

        if (isLocal) {
          currentStatus = room.state;
        } else if (remoteInfo?.status === 'disconnected') {
          currentStatus = ConnectionState.Disconnected;
        } else if (remoteInfo?.status === 'connecting' || !remoteInfo) {
          currentStatus = ConnectionState.Connecting;
        } else if (remoteInfo?.status === 'reconnecting' || remoteInfo?.status === 'poor') {
          currentStatus = ConnectionState.Reconnecting;
        } else {
          currentStatus = ConnectionState.Connected;
        }

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
            <ParticipantContext.Provider value={participant?.rawParticipant}>
              <ParticipantTile
                participant={{
                  ...participant,
                  connectionStatus: currentStatus,
                }}
              />
            </ParticipantContext.Provider>
          </Box>
        );
      })}
    </>
  );
};

export default RoomStageParticipants;
// src/sections/section-voice-room/voice-room-workspace/room-stage-participants.tsx

import { ParticipantContext, useRoomContext } from '@livekit/components-react';
import { Box, BoxProps } from '@mui/material';
import {
  ConnectionQuality,
  ConnectionState,
  Participant,
  RemoteParticipant,
  RoomEvent,
} from 'livekit-client';
import { useEffect, useMemo, useState } from 'react';

import type { ParticipantStageType } from '@/types/type-room';
import ParticipantTile from './room-stage-participant-tile';

export interface RoomStageParticipantsProps extends BoxProps {
  participants: ParticipantStageType[];
}

export const RoomStageParticipants = ({
  participants = [],
  sx,
  ...other
}: RoomStageParticipantsProps) => {
  const room = useRoomContext();

  // Real-time connection status per participant: { [identity]: ConnectionState }
  const [connectionStatusMap, setConnectionStatusMap] = useState<Record<string, ConnectionState>>({});

  // Hold onto disconnected participants temporarily so their tile does not vanish immediately
  const [ghostParticipants, setGhostParticipants] = useState<Record<string, ParticipantStageType>>({});

  // --------------------------------------------------------------------------
  // Room-level Connection Quality & Disconnection Watchdog
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!room) return;

    // 1. RTCP Quality Monitor (Detects Wi-Fi drops / packet loss within 1-2 seconds)
    const handleQualityChange = (quality: ConnectionQuality, p: Participant) => {
      if (p.isLocal) return;

      setConnectionStatusMap((prev) => {
        if (quality === ConnectionQuality.Lost || quality === ConnectionQuality.Poor) {
          return { ...prev, [p.identity]: ConnectionState.Reconnecting };
        }
        if (quality === ConnectionQuality.Good || quality === ConnectionQuality.Excellent) {
          return { ...prev, [p.identity]: ConnectionState.Connected };
        }
        return prev;
      });
    };

    // 2. Disconnect Handler: Hold participant visible for 3s to show "Disconnected" badge
    const handleParticipantDisconnected = (peer: RemoteParticipant) => {
      const peerIdentity = peer.identity;

      setConnectionStatusMap((prev) => ({
        ...prev,
        [peerIdentity]: ConnectionState.Disconnected,
      }));

      // Snapshot participant to keep rendered
      const snapshot = participants.find((p) => String(p.id) === peerIdentity);
      if (snapshot) {
        setGhostParticipants((prev) => ({
          ...prev,
          [peerIdentity]: snapshot,
        }));
      }

      // Clean up ghost state after 3 seconds
      setTimeout(() => {
        setGhostParticipants((prev) => {
          const next = { ...prev };
          delete next[peerIdentity];
          return next;
        });
        setConnectionStatusMap((prev) => {
          const next = { ...prev };
          delete next[peerIdentity];
          return next;
        });
      }, 3000);
    };

    // 3. New / Re-connected peer
    const handleParticipantConnected = (peer: RemoteParticipant) => {
      setConnectionStatusMap((prev) => ({
        ...prev,
        [peer.identity]: ConnectionState.Connected,
      }));
    };

    room.on(RoomEvent.ConnectionQualityChanged, handleQualityChange);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);

    return () => {
      room.off(RoomEvent.ConnectionQualityChanged, handleQualityChange);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
    };
  }, [room, participants]);

  // --------------------------------------------------------------------------
  // Merge live participants with temporary ghosts
  // --------------------------------------------------------------------------
  const displayParticipants = useMemo(() => {
    const list = [...participants];
    const liveIds = new Set(participants.map((p) => String(p.id)));

    Object.values(ghostParticipants).forEach((ghost) => {
      if (!liveIds.has(String(ghost.id))) {
        list.push(ghost);
      }
    });

    return list;
  }, [participants, ghostParticipants]);

  return (
    <>
      {displayParticipants.map((participant) => {
        const currentStatus =
          connectionStatusMap[String(participant.id)] || participant.connectionStatus;

        return (
          <Box
            key={participant.id}
            sx={{
              width: { xs: 'calc(50% - 8px)', sm: 140, md: 160 },
              minHeight: 160,
            }}
          >
            <ParticipantContext.Provider value={participant.rawParticipant}>
              <ParticipantTile
                participant={{
                  ...participant,
                  connectionStatus: currentStatus as any,
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
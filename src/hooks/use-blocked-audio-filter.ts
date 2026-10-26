// src/core/hooks/use-blocked-audio-filter.ts

import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { useEffect } from 'react';

import { useCredentials } from '@/core/slices';
import { getStoredVolume } from '@/sections/section-voice/voice-room-user-controller/hook-participant-audio-controller';

/**
 * Enforces mutual audio + video isolation for blocked users.
 *
 * If A blocks B:
 *   • A's client: `blockedUserIds` contains B → A unsubscribes from B
 *   • B's client: `blockedByUserIds` contains A → B unsubscribes from A
 *
 * Both `blockedUserIds` and `blockedByUserIds` trigger local unsubscribe,
 * which produces mutual silence. Everyone else's audio/video is untouched.
 *
 * Enforcement re-runs on participant connect / track publish / subscribe
 * so it survives rejoins, reconnects, and republished tracks.
 *
 * NOTE: this requires the backend to push `blockedByUserIds` to the
 * blocked party via socket when a block is created. Without that, one
 * side (the blocked user) will not learn about the block until they
 * refetch `/me`.
 */
export function useBlockedAudioFilter() {
  const room = useRoomContext();
  const { blockedUserIds, blockedByUserIds } = useCredentials();

  useEffect(() => {
    if (!room) return undefined;

    const blockedSet = new Set<string>([
      ...(blockedUserIds || []).map(String),
      ...(blockedByUserIds || []).map(String),
    ]);

    if (blockedSet.size === 0) {
      // Nothing to enforce — make sure previously-unsubscribed tracks
      // are restored if the user just unblocked everyone.
      room.remoteParticipants.forEach((participant) => {
        participant.audioTrackPublications.forEach((pub) => {
          if (!pub.isSubscribed) pub.setSubscribed(true);
        });
        participant.videoTrackPublications.forEach((pub) => {
          if (!pub.isSubscribed) pub.setSubscribed(true);
        });
      });
      return undefined;
    }

    const isBlocked = (identity: string) => blockedSet.has(String(identity));

    const enforce = () => {
      room.remoteParticipants.forEach((participant) => {
        const shouldBlock = isBlocked(participant.identity);

        participant.audioTrackPublications.forEach((pub) => {
          const desired = !shouldBlock;
          if (pub.isSubscribed !== desired) {
            pub.setSubscribed(desired);
          }

          if (pub.track) {
            const volume = shouldBlock
              ? 0
              : Math.max(0, Math.min(1, getStoredVolume(participant.identity) / 100));

            pub.track.attachedElements.forEach((el: HTMLMediaElement) => {
              el.volume = volume;
            });
          }
        });

        participant.videoTrackPublications.forEach((pub) => {
          const desired = !shouldBlock;
          if (pub.isSubscribed !== desired) {
            pub.setSubscribed(desired);
          }
        });
      });
    };

    enforce();

    room.on(RoomEvent.ParticipantConnected, enforce);
    room.on(RoomEvent.ParticipantDisconnected, enforce);
    room.on(RoomEvent.TrackSubscribed, enforce);
    room.on(RoomEvent.TrackPublished, enforce);
    room.on(RoomEvent.TrackUnpublished, enforce);

    return () => {
      room.off(RoomEvent.ParticipantConnected, enforce);
      room.off(RoomEvent.ParticipantDisconnected, enforce);
      room.off(RoomEvent.TrackSubscribed, enforce);
      room.off(RoomEvent.TrackPublished, enforce);
      room.off(RoomEvent.TrackUnpublished, enforce);
    };
  }, [room, blockedUserIds, blockedByUserIds]);
}

export default useBlockedAudioFilter;

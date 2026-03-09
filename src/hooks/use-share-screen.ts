import { useRef, useState, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// useScreenShare
//
// Responsible ONLY for:
//   1. Calling getDisplayMedia to get the local screen stream
//   2. Tracking isSharing / screenStream state
//   3. Firing onStreamReady(stream) on start and onStreamReady(null) on stop
//
// WebRTC signaling (creating PCs, sending offers, pushing tracks to peers) is
// handled entirely by useScreenShareWebRTC — this hook doesn't touch peers.
// ─────────────────────────────────────────────────────────────────────────────

export type UseScreenShareReturn = {
  screenStream: MediaStream | null;
  isSharing: boolean;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  isSupported: boolean;
  error: string | null;
};

/**
 * @param onStreamReady - fired with the captured stream on start, null on stop.
 *   Use this to call screenShareWebRTC.startSharing / stopSharing.
 */
export function useScreenShare(
  onStreamReady?: (stream: MediaStream | null) => void
): UseScreenShareReturn {
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stable ref so stopScreenShare always has the latest stream
  const screenStreamRef = useRef<MediaStream | null>(null);

  const isSupported =
    typeof navigator !== 'undefined' &&
    'mediaDevices' in navigator &&
    'getDisplayMedia' in navigator.mediaDevices;

  // ── Stop ──────────────────────────────────────────────────────────────────

  const stopScreenShare = useCallback(() => {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    setScreenStream(null);
    setIsSharing(false);
    onStreamReady?.(null);
  }, [onStreamReady]);

  // ── Start ─────────────────────────────────────────────────────────────────

  const startScreenShare = useCallback(async () => {
    if (!isSupported) {
      setError('Screen sharing is not supported in this browser.');
      return;
    }
    try {
      setError(null);

      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { cursor: 'always', frameRate: 30, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: true,
      });

      // Auto-stop when user clicks browser's native "Stop sharing" button
      stream.getVideoTracks()[0].addEventListener('ended', () => stopScreenShare());

      screenStreamRef.current = stream;
      setScreenStream(stream);
      setIsSharing(true);

      // Delegate WebRTC work to useScreenShareWebRTC via this callback
      onStreamReady?.(stream);
    } catch (err: any) {
      if (err?.name !== 'NotAllowedError') {
        setError('Could not start screen share. Please try again.');
      }
    }
  }, [isSupported, stopScreenShare, onStreamReady]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(
    () => () => {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return { screenStream, isSharing, startScreenShare, stopScreenShare, isSupported, error };
}

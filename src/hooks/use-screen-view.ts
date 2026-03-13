import { useRef, useState, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// useScreenShare
// ─────────────────────────────────────────────────────────────────────────────

export type UseScreenShareReturn = {
  screenStream: MediaStream | null;
  isSharing: boolean;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  isSupported: boolean;
  error: string | null;
};

export function useScreenView(
  onStreamReady?: (stream: MediaStream | null) => void
): UseScreenShareReturn {
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const screenStreamRef = useRef<MediaStream | null>(null);

  const isSupported =
    typeof navigator !== 'undefined' &&
    'mediaDevices' in navigator &&
    'getDisplayMedia' in navigator.mediaDevices;

  const stopScreenShare = useCallback(() => {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    setScreenStream(null);
    setIsSharing(false);
    onStreamReady?.(null);
  }, [onStreamReady]);

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

      screenStreamRef.current = stream;
      stream.getVideoTracks()[0].addEventListener('ended', () => stopScreenShare());

      setScreenStream(stream);
      setIsSharing(true);
      onStreamReady?.(stream);
    } catch (err: any) {
      if (err?.name !== 'NotAllowedError') {
        setError('Could not start screen share. Please try again.');
      }
    }
  }, [isSupported, stopScreenShare, onStreamReady]);

  useEffect(
    () => () => {
      screenStream?.getTracks().forEach((t) => t.stop());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return { screenStream, isSharing, startScreenShare, stopScreenShare, isSupported, error };
}

import type { Socket } from 'socket.io-client';

import { useRef, useMemo, useEffect } from 'react';

// ----------------------------------------------------------------------

export type UseSocketReturn = {
  socket: Socket | null;
};

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = (window as any).socket;
    }
  }, []);

  const memoizedValue = useMemo(
    () => ({
      socket: socketRef.current,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [socketRef.current]
  );

  return memoizedValue;
}

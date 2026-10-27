// src/sections/section-voice/voice-room-card/room-list-lazy.tsx
//
// Everything that is NOT needed for the first paint is code-split here.

import { Box, type SxProps } from '@mui/material';
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

export const LazyRoomParticipantsDialog = lazy(() =>
  import('./room-list-card-dialog').then((m) => ({ default: m.RoomParticipantsDialog }))
);

export const LazyVoiceModalCreateRoom = lazy(() =>
  import('../voice-modal-create-room').then((m) => ({ default: m.VoiceModalCreateRoom }))
);

export const LazyUserDisplayer = lazy(() => import('@/sections/section-common/user-displayer'));

export const LazyLoginPromptDialog = lazy(() =>
  import('@/components/custom-dialog').then((m) => ({ default: m.LoginPromptDialog }))
);

export const LazySocialView = lazy(() =>
  import('@/sections/section-social-chat').then((m) => ({ default: m.SocialView }))
);

export const LazyRoomListFooter = lazy(() => import('./room-list-footer'));

/** Warm the chunks during idle time so the first tap on a card never waits on the network. */
export const prefetchRoomListChunks = () => {
  void import('./room-list-card-dialog').catch(() => undefined);
  void import('@/sections/section-common/user-displayer').catch(() => undefined);
  void import('../voice-modal-create-room').catch(() => undefined);
};

// ----------------------------------------------------------------------

type DeferredMountProps = {
  children: ReactNode;
  /** Scroll container to observe against (needed because we scroll inside a div, not the window). */
  rootRef?: RefObject<Element | null>;
  rootMargin?: string;
  /** Reserve space so nothing below/above shifts when the real content mounts. */
  sx?: SxProps;
};

/** Renders `children` only once the placeholder is close to the viewport. */
export const DeferredMount = ({
  children,
  rootRef,
  rootMargin = '600px 0px',
  sx,
}: DeferredMountProps) => {
  const holderRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return undefined;
    const el = holderRef.current;
    if (!el) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setShow(true);
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { root: rootRef?.current ?? null, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show, rootMargin, rootRef]);

  if (show) return <Suspense fallback={<Box sx={sx} />}>{children}</Suspense>;
  return <Box ref={holderRef} sx={sx} />;
};

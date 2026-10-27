// src/sections/section-voice/voice-room-card/room-list-scheduler.ts
//
// Small scheduling helpers that keep the main thread free while the user scrolls:
//  - runWhenIdle:      requestIdleCallback with a Safari-safe fallback
//  - hydrationQueue:   upgrades "lite" cards to full cards ONE per idle slot (never in a burst)
//  - hydratedRooms:    remembers which rooms were already upgraded, so a card that scrolls
//                      out and back in is rendered full immediately (no flicker)

import { useEffect, useRef, useState } from 'react';

export const runWhenIdle = (cb: () => void, timeout = 1000): (() => void) => {
  if (typeof window === 'undefined') return () => undefined;
  const w = window as any;
  if (typeof w.requestIdleCallback === 'function') {
    const id = w.requestIdleCallback(cb, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, 50); // Safari has no requestIdleCallback
  return () => window.clearTimeout(id);
};

// ── Hydrated rooms cache ────────────────────────────────────────────────

const hydrated = new Set<string>();

export const hydratedRooms = {
  has: (id: string) => hydrated.has(id),
  add: (id: string) => {
    if (hydrated.size > 400) hydrated.clear();
    hydrated.add(id);
  },
};

// ── Hydration queue ─────────────────────────────────────────────────────

const createHydrationQueue = () => {
  const jobs = new Map<string, () => void>();
  let cancelPending: (() => void) | null = null;
  let paused = false;

  const schedule = () => {
    if (cancelPending || paused || jobs.size === 0) return;
    cancelPending = runWhenIdle(() => {
      cancelPending = null;
      if (paused) return;
      const first = jobs.entries().next();
      if (first.done) return;
      const [key, job] = first.value;
      jobs.delete(key);
      job();
      schedule();
    }, 300);
  };

  return {
    enqueue(key: string, job: () => void) {
      jobs.set(key, job);
      schedule();
      return () => {
        jobs.delete(key);
      };
    },
    /** Called on fast scroll: stop upgrading cards until the list settles. */
    pause() {
      paused = true;
      cancelPending?.();
      cancelPending = null;
    },
    resume() {
      if (!paused) return;
      paused = false;
      schedule();
    },
  };
};

export const hydrationQueue = createHydrationQueue();

// ── Hooks ───────────────────────────────────────────────────────────────

/** Becomes true once, `delay` ms after mount, during an idle slot. */
export const useIdleReady = (delay = 600) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelIdle: (() => void) | undefined;
    const t = window.setTimeout(() => {
      cancelIdle = runWhenIdle(() => setReady(true), 1500);
    }, delay);
    return () => {
      window.clearTimeout(t);
      cancelIdle?.();
    };
  }, [delay]);

  return ready;
};

/** Latches to true the first time `value` is true (mount-on-first-open pattern). */
export const useEverTrue = (value: boolean) => {
  const ref = useRef(value);
  if (value) ref.current = true;
  return ref.current;
};

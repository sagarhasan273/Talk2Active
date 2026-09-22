import { CONFIG } from '@/config-global';
import { useEffect, useRef } from 'react';

interface UseRoomUnloadBeaconProps {
    roomId?: string | null;
    userId?: string | null;
    enabled?: boolean;
}

export function useRoomUnloadBeacon({
    roomId,
    userId,
    enabled = true,
}: UseRoomUnloadBeaconProps) {
    const roomRef = useRef(roomId);
    const userRef = useRef(userId);
    const isFiredRef = useRef(false);

    useEffect(() => {
        roomRef.current = roomId;
        userRef.current = userId;
    }, [roomId, userId]);

    useEffect(() => {
        if (!enabled) return;

        const handleUnload = () => {
            if (isFiredRef.current) return;
            isFiredRef.current = true;

            const activeRoomId = roomRef.current;
            const activeUserId = userRef.current;

            if (!activeRoomId || !activeUserId) return;

            const payload = JSON.stringify({
                roomId: activeRoomId,
                userId: activeUserId,
                kicked: false,
            });

            const targetUrl = `${CONFIG.serverUrl}/room/on-reload`;

            if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
                const blob = new Blob([payload], { type: 'text/plain' });
                const sent = navigator.sendBeacon(targetUrl, blob);
                if (sent) return;
            }

            try {
                fetch(targetUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload,
                    keepalive: true,
                }).catch(() => {
                    console.error('Suppress errors during window destruction');
                });
            } catch {
                console.error('Suppress synchronous network dispatch failures during teardown');
            }
        };

        const handlePageShow = (e: PageTransitionEvent) => {
            if (e.persisted) {
                isFiredRef.current = false;
            }
        };

        window.addEventListener('pagehide', handleUnload);
        window.addEventListener('beforeunload', handleUnload);
        window.addEventListener('pageshow', handlePageShow);

        return () => {
            window.removeEventListener('pagehide', handleUnload);
            window.removeEventListener('beforeunload', handleUnload);
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, [enabled]);
}
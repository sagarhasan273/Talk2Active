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

    // Keep references synced without causing re-binding of window listeners
    useEffect(() => {
        roomRef.current = roomId;
        userRef.current = userId;
    }, [roomId, userId]);

    useEffect(() => {
        if (!enabled) return;

        const handleUnload = () => {
            const activeRoomId = roomRef.current;
            const activeUserId = userRef.current;

            if (!activeRoomId || !activeUserId) return;

            const payload = JSON.stringify({
                roomId: activeRoomId,
                userId: activeUserId,
                kicked: false,
            });

            const targetUrl = `${CONFIG.serverUrl}/room/on-reload`;

            // 1. Primary: sendBeacon with text/plain to bypass CORS preflight during unload
            if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
                const blob = new Blob([payload], { type: 'text/plain' });
                const sent = navigator.sendBeacon(targetUrl, blob);
                if (sent) return;
            }

            // 2. Fallback: Modern fetch with keepalive: true
            try {
                fetch(targetUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload,
                    keepalive: true,
                }).catch(() => {
                    // Suppress errors during window destruction
                });
            } catch {
                // Suppress synchronous network dispatch failures during teardown
            }
        };

        // 'pagehide' handles mobile/safari unload reliably; 'beforeunload' handles desktop fallback
        window.addEventListener('pagehide', handleUnload);
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            window.removeEventListener('pagehide', handleUnload);
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [enabled]);
}
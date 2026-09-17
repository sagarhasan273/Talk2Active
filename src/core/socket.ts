import { io, Socket } from 'socket.io-client';
import { STORAGE_KEY } from 'src/auth/context/jwt';
import { CONFIG } from 'src/config-global';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    console.log(socket, 'ehlo')
    if (!socket) {
        const accessToken = sessionStorage.getItem(STORAGE_KEY);
        const serverUrl = CONFIG.serverUrl || 'http://localhost:5000';

        socket = io(serverUrl, {
            autoConnect: false,
            transports: ['websocket', 'polling'],
            auth: {
                token: accessToken ? `Bearer ${accessToken}` : undefined,
            },
        });
    }
    return socket;
};

export const connectSocket = (userId: string): Socket => {
    const s = getSocket();

    if (!s.connected) {
        s.connect();
    }

    // Once connected or immediately if already active, register to personal room
    if (s.connected) {
        s.emit('join_global_chat', userId);
    } else {
        s.once('connect', () => {
            s.emit('join_global_chat', userId);
        });
    }

    return s;
};

export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
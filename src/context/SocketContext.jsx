import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../utils/api';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isMaintenance, setIsMaintenance] = useState(false);

    useEffect(() => {
        // Get root URL for socket (strip /api)
        const socketUrl = API_BASE_URL.replace(/\/api$/, '');
        
        const newSocket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            console.log('🔌 Connected to real-time server');
        });

        newSocket.on('system:maintenance', (status) => {
            console.log('⚠️ Maintenance mode update:', status);
            setIsMaintenance(!!status);
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isMaintenance }}>
            {children}
        </SocketContext.Provider>
    );
};

import { Server } from 'socket.io';

let io;

export const init = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*", // Adjust in production
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);

        // Allow joining user-specific room
        socket.on('join-user', (userId) => {
            if (userId) {
                socket.join(`user:${userId}`);
                console.log(`👤 Client ${socket.id} joined room: user:${userId}`);
            }
        });

        socket.on('disconnect', () => {
            console.log(`👋 Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

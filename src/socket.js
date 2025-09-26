// src/socket.js
import { Server } from 'socket.io';
import http from 'http';
import app from './app.js';

export const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const userSocketMap = {}; // {userId: socketId}
export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

const initializeSocket = (io) => {
    io.use((socket, next) => {
        const userId = socket.handshake.query.userId;
        if (!userId) {
            return next(new Error("Authentication error: userId is required"));
        }
        socket.userId = userId;
        next();
    });

    io.on("connection", (socket) => {
        try {
            console.log("✅ New user connected:", socket?.userId);
            const userId = socket.userId;
            if (!userId) {
                socket.disconnect();
                return;
            }

            // Store user connection
            userSocketMap[userId] = socket.id;

            // Broadcast online users
            io.emit("getOnlineUsers", Object.keys(userSocketMap));

            // Handle connection error
            socket.on("connect_error", (error) => {
                console.error("Connection error:", error);
                delete userSocketMap[userId];
            });

            // // ✅ Chat message event
            // socket.on("chat", ({ chat, sender, receiver }) => {
            //     const receiverSocketId = getReceiverSocketId(receiver);
            //     if (receiverSocketId) {
            //         io.to(receiverSocketId).emit("chat", { chat, sender, receiver });
            //         // send "delivered" status to sender
            //         socket.emit("message_delivered", { messageId: chat._id });
            //     }
            // });

            // ✅ Message received → notify sender (for read receipts)
            socket.on("message_received", ({ messageId, sender }) => {
                const senderSocketId = getReceiverSocketId(sender);
                if (senderSocketId) {
                    io.to(senderSocketId).emit("message_read", { messageId });
                }
            });

            // ✅ Typing event
            socket.on("typing", (data) => {
                try {
                    const receiverSocketId = getReceiverSocketId(data.receiverId);
                    if (receiverSocketId) {
                        socket.to(receiverSocketId).emit("typing", {
                            senderId: userId,
                            ...data
                        });
                    }
                } catch (error) {
                    console.error("Error in typing event:", error);
                    socket.emit("error", "Failed to process typing event");
                }
            });

            // ✅ Stop typing event
            socket.on("stopTyping", (data) => {
                try {
                    const receiverSocketId = getReceiverSocketId(data.receiverId);
                    if (receiverSocketId) {
                        socket.to(receiverSocketId).emit("stopTyping", {
                            senderId: userId,
                            ...data
                        });
                    }
                } catch (error) {
                    console.error("Error in stopTyping event:", error);
                    socket.emit("error", "Failed to process stopTyping event");
                }
            });

            // ✅ Handle disconnection
            socket.on("disconnect", () => {
                console.log("❌ User disconnected:", socket.id);
                delete userSocketMap[userId];
                io.emit("getOnlineUsers", Object.keys(userSocketMap));
            });

            // ✅ Handle reconnection
            socket.on("reconnect", (attemptNumber) => {
                console.log("User reconnected on attempt:", attemptNumber);
                userSocketMap[userId] = socket.id;
                io.emit("getOnlineUsers", Object.keys(userSocketMap));
            });

        } catch (error) {
            console.error("Error in socket connection:", error);
            socket.disconnect();
        }
    });
};

initializeSocket(io);
export { io };

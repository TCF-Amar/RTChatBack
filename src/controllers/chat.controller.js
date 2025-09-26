import Chat from "../models/chat.model.js"
import { io, getReceiverSocketId } from "../socket.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/AsyncHandler.js"

export const getChats = asyncHandler(async (req, res) => {
    const signinUser = req.user._id;
    const receiver = req.params.id;

    const chat = await Chat.find({
        $or: [
            { sender: signinUser, receiver: receiver },
            { sender: receiver, receiver: signinUser }
        ]
    }).sort({ createdAt: 1 }); // ascending order by time

    res.status(200).json(new ApiResponse(200, "Chat fetched successfully", chat));
});


export const sendChat = asyncHandler(async (req, res) => {
    const { message, messageType, image, video } = req.body;
    const sender = req.user._id;
    const receiver = req.params.id;

    const chat = await Chat.create({
        sender,
        receiver,
        message,
        messageType,
        image,
        video,
    });

    try {
        const receiverSocketId = getReceiverSocketId(receiver);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("chat", {
                chat,
                sender,
                receiver,
            });
            console.log(`User ${receiver} is online, notification sent`);
        } else {
            console.log(`User ${receiver} is offline, storing as unread`);
            // future: maintain unread chats table
        }

        res.status(200).json(new ApiResponse(200, "Chat sent successfully", chat));
    } catch (error) {
        console.error("Error sending socket event:", error);
        res.status(200).json(new ApiResponse(200, "Chat saved but notification might be delayed", chat));
    }
});

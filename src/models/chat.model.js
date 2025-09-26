import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        message: {
            type: String,
            trim: true
        },
        image: {
            type: String
        },
        video: {
            type: String
        },
        pin: {
            type: Boolean,
            default: false
        },
        messageType: {
            type: String,
            enum: ["text", "image", "video"],
            default: "text"
        }
    },
    { timestamps: true } // Auto add createdAt & updatedAt
);

// Index for faster queries
chatSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);
export default Chat

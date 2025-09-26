import mongoose from "mongoose";
const DATABASE = "ChatApp";


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI + DATABASE);
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.log("❌ MongoDB Connection Error:", error.message);
    }
}

export default connectDB
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (filePath) => {
    try {
        if (!filePath) {
            throw new Error("No file uploaded")
        }
        const uploadResponse = await cloudinary.uploader.upload(filePath, {
            folder: "social",
            use_filename: true,
            unique_filename: false,
            resource_type: "auto"
        })
        fs.unlinkSync(filePath)
        // console.log("uploadResponse", uploadResponse)// for testing
        return uploadResponse
    } catch (error) {
        fs.unlinkSync(filePath)
        throw error
    }
}
import User from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const getAllUsers = asyncHandler(async (req, res) => {
    const loggedInUserId = req.user._id; // middleware से आने वाला user id

    const users = await User.aggregate([
        {
            $match: {
                _id: { $ne: loggedInUserId }  // current user exclude
            }
        },
        {
            $lookup: {
                from: "messages",
                localField: "_id",
                foreignField: "senderId",
                as: "messages",
                pipeline: [
                    { $sort: { createdAt: -1 } },
                    { $project: { message: 1, createdAt: 1 } }
                ]
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                username: 1,
                email: 1,
                photoURL: 1,
                coverPhotoURL: 1,
                messages: 1
            }
        }
    ]);

    if (!users || users.length === 0) {
        throw new ApiError(404, "No users found");
    }

    res.status(200).json(
        new ApiResponse(200, "All users", { count: users.length, users })
    );
});

import { asyncHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { fetchUser } from "../utils/FetchUser.js";
import User from "../models/user.model.js";
import validator from "validator"

export const signupUser = asyncHandler(async (req, res) => {
    const { name, username, email, password } = req.body;

    //  Check required data
    if (!name || !username || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    //  Validate email
    if (email && !validator.isEmail(email)) {
        throw new ApiError(400, "Invalid email address");
    }


    //  Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        throw new ApiError(400, "User with this email or username already exists");
    }

    //  Create user
    const newUser = await User.create({
        name,
        username,
        email,
        password, // password will be hashed in pre-save hook
    });

    const createdUser = await fetchUser(newUser._id)
    const accessToken = newUser.generateAccessToken()
    const refreshToken = newUser.generateRefreshToken()

    await User.updateOne(
        { _id: createdUser._id },
        { $set: { refreshToken } }
    );


    //  Send response
    res
        .status(201)
        .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000 // 1d 
        })
        .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30d
        })
        .json(new ApiResponse(201, "Signup Successful", createdUser));
});


export const signinUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // 1️⃣ Check required data
    if (!username && !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    // 2️⃣ Validate email
    if (email && !validator.isEmail(email)) {
        throw new ApiError(400, "Invalid email address");
    }


    // 3️⃣ Check if user exists
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (!user) {
        throw new ApiError(400, "User not found");
    }
    const isPasswordMatched = await user.comparePassword(password)
    if (!isPasswordMatched) {
        throw new ApiError(400, "Invalid credentials")
    }

    const signinUser = await fetchUser(user._id)

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    await User.updateOne({ _id: signinUser._id }, {
        $set: { refreshToken }
    })

    res
        .status(200)
        .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000 // 1d 
        })
        .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30d
        })
        .json(new ApiResponse(200, "Signin successfully", signinUser))
})

export const protectedAuth = asyncHandler(async(req, res) => {

    const user = await fetchUser(req.user._id)

    res.status(200).json(new ApiResponse(200, "Protected route",user ))
})

export const signoutUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id)
    await User.updateOne({ _id: user._id }, {
        $set: { refreshToken: "" }
    })
    

    res
        .status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse(200, "Signout successfully"));
})
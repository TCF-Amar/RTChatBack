import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';


export const authVerify = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "") || "";
        if (!token) {
            return next(new ApiError(401, "Unauthorized: No token provided"));
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.id);


        if (!user) {
            return next(new ApiError(401, "Unauthorized: Invalid user"));
        }

        req.user = user
        return next()
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            // return next(new ApiError(401, 'Unauthorized: Token expired'));
            const refreshToken = req.cookies?.refreshToken || req.headers.authorization?.replace("Bearer ", "") || "";
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                return next(new ApiError(401, "Unauthorized: Invalid user"));
            }
            if (user.refreshToken !== refreshToken) {
                return next(new ApiError(401, "Unauthorized: Invalid refresh token"));
            }
            const accessToken = user.generateAccessToken();
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                sameSite: 'none',
                secure: true
            });
            req.user = user
            return next()
        }


    }


}
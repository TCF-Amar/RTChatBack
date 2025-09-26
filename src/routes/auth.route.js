import { Router } from "express";
import {
    protectedAuth,
    signinUser,
    signoutUser,
    signupUser
} from "../controllers/auth.controller.js";
import { authVerify } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/signup").post(signupUser);
router.route("/signin").post(signinUser);
router.route("/signout").post(authVerify, signoutUser)
router.route("/protected").get(authVerify, protectedAuth)


export default router;
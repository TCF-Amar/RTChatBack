import { Router } from "express";
import { getAllUsers } from "../controllers/user.controller.js";
import { authVerify } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/all").get(authVerify, getAllUsers);


export default router;
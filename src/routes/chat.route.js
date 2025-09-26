import { Router } from "express";
import { authVerify } from "../middlewares/auth.middleware.js";
import { getChats, sendChat } from "../controllers/chat.controller.js";

const router = Router();

router.route("/:id").get(authVerify, getChats);

router.route("/:id").post(authVerify, sendChat);
export default router;
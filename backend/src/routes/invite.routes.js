import { Router } from "express";
import { acceptInvite } from "../controllers/invite.controller.js";

const router = Router();

router.post("/invite/:token",acceptInvite);

export default router;
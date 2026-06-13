import { Router } from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { requireLevel } from "../../middlewares/requireLevel.middleware.js";
import {
  getInvitations,
  resendInvitation,
  cancelInvitation
} from "./invitations.controller.js";

const router = Router();

// Solo HR (70) o superior puede gestionar invitaciones
router.get("/", verifyToken, requireLevel(70), getInvitations);
router.post("/:id/resend", verifyToken, requireLevel(70), resendInvitation);
router.delete("/:id", verifyToken, requireLevel(70), cancelInvitation);

export default router;
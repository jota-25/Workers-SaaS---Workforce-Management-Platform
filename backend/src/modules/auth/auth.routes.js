import { Router } from "express";
import { register } from "./auth.controller.js";
import { login } from "./auth.controller.js";
import { loginLimiter } from "../../middlewares/rateLimit.middleware.js";
import { refreshToken } from "./auth.controller.js";
import { verifyEmail } from "./auth.controller.js";
import { forgotPassword , logout } from "./auth.controller.js";
import { resetPassword } from "./auth.controller.js";
import { activityLogger } from "../../middlewares/activity.middleware.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { getInviteInfo } from "./auth.controller.js";
import { acceptInvite } from "./auth.controller.js";


const router = Router();

router.post("/register", register);

router.get("/verify-email", verifyEmail);

router.get("/invite/:token", getInviteInfo);

router.post("/accept-invite", acceptInvite);

router.post("/login", loginLimiter, activityLogger("LOGIN","auth"), login);

router.post("/refresh", refreshToken);

router.get("/verify-email", verifyEmail);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", activityLogger("PASSWORD_RESET","auth"), resetPassword);


router.post("/logout", verifyToken, logout);






export default router;


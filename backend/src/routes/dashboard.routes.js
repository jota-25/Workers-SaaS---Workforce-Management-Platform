import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireLevel } from "../middlewares/requireLevel.middleware.js";
import { dashboardStatsHandler } from "../controllers/dashboard.controller.js";


const router = Router();

router.get("/stats", verifyToken, dashboardStatsHandler);

router.get("/", verifyToken, (req, res) => {
  res.json({
    message: "Bienvenido al dashboard",
    user: req.user
  });
});



router.get(
  "/admin",
  verifyToken,
  requireLevel(90),
  (req, res) => {
    res.json({ message: "Panel de admin" });
  }
);

export default router;


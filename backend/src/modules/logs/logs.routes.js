import { Router } from "express";
import { getLogs, getLogsStats, exportData } from "./logs.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { requireLevel } from "../../middlewares/requireLevel.middleware.js";




const router = Router();

router.get("/", verifyToken, requireLevel(90), getLogs);


router.get( "/stats", verifyToken, requireLevel(90), getLogsStats);

router.get("/export",verifyToken,requireLevel(90), exportData);


export default router;

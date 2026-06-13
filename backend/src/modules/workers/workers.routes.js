import { Router } from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { requireLevel } from "../../middlewares/requireLevel.middleware.js";
import {
  getWorkers,
  createWorker,
  updateWorker,
  deleteWorker
} from "./workers.controller.js";
import { activityLogger } from "../../middlewares/activity.middleware.js";


const router = Router();

router.get("/", verifyToken,requireLevel(50), getWorkers);

router.post(
  "/",
  verifyToken,
  requireLevel(70),
  activityLogger("WORKER_CREATED","worker"),
  createWorker
);

router.put(
  "/:id",
  verifyToken,
  requireLevel(70),
  activityLogger("WORKER_UPDATED","worker"),
  updateWorker
);

router.delete(
  "/:id",
  verifyToken,
  requireLevel(70),
  activityLogger("WORKER_DELETED","worker"),
  deleteWorker
);

export default router;

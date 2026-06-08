import { Router } from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import {
  getMySessions,
  deleteSession,
  deleteOtherSessions,
  deleteAllSessions
} from "./sessions.controller.js";

const router = Router();

// Ver sesiones activas
router.get("/", verifyToken, getMySessions);

// el all va primero ya que es específico y no tiene params (si ponemos el :id primero, el all lo va a tomar como un id y no va a funcionar)
// Cerrar absolutamente todas
router.delete("/all", verifyToken, deleteAllSessions);


// Cerrar todas menos la actual
router.delete("/", verifyToken, deleteOtherSessions);

// el id va al final ya que es el más genérico (si lo ponemos antes del all, el all lo va a tomar como un id y no va a funcionar)
// Cerrar sesión específica
router.delete("/:id", verifyToken, deleteSession);




export default router;
import { pool } from "../db.js";
import { hashToken } from "../utils/hash.js";
// ================================
// VER MIS SESIONES ACTIVAS
// ================================
export const getMySessions = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        ip,
        user_agent,
        created_at,
        last_used_at,
        expires_at
       FROM sessions
       WHERE user_id = $1
       AND expires_at > NOW()
       ORDER BY last_used_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};


// ================================
// CERRAR UNA SESIÓN ESPECÍFICA
// ================================
export const deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ✅ Verificamos que la sesión pertenece al usuario que hace la request
    // Un usuario no puede cerrar la sesión de otro usuario
    const result = await pool.query(
      `DELETE FROM sessions
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Sesión no encontrada" });
    }

    res.json({ message: "Sesión cerrada" });
  } catch (error) {
    next(error);
  }
};


// ================================
// CERRAR TODAS LAS SESIONES MENOS LA ACTUAL
// ================================
export const deleteOtherSessions = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    //  Hasheamos para comparar correctamente con la DB
    const hashedToken = hashToken(refreshToken);

    //  Borramos todas las sesiones del usuario EXCEPTO la actual
    const result = await pool.query(
      `DELETE FROM sessions
       WHERE user_id = $1
       AND refresh_token != $2`,
      [req.user.id, hashedToken]
    );

    res.json({ 
      message: "Otras sesiones cerradas",
      closed: result.rowCount  // cuántas sesiones se cerraron
    });
  } catch (error) {
    next(error);
  }
};


// ================================
// CERRAR ABSOLUTAMENTE TODAS LAS SESIONES
// ================================
export const deleteAllSessions = async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM sessions WHERE user_id = $1",
      [req.user.id]
    );

    res.json({ 
      message: "Todas las sesiones cerradas",
      closed: result.rowCount
    });
  } catch (error) {
    next(error);
  }
};
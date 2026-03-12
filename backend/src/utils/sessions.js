import { pool } from "../db.js";

//  Invalida todas las sesiones de un usuario
// Se llama después de cualquier cambio de contraseña
export const invalidateUserSessions = async (userId) => {
  await pool.query(
    "DELETE FROM sessions WHERE user_id = $1",
    [userId]
  );
};

//  Invalida todas las sesiones EXCEPTO la actual
// Útil cuando el propio usuario cambia su contraseña
// — no queremos cerrarlo a él mismo
export const invalidateOtherSessions = async (userId, currentRefreshToken) => {
  const { hashToken } = await import("./hash.js");
  const hashedToken = hashToken(currentRefreshToken);

  await pool.query(
    `DELETE FROM sessions
     WHERE user_id = $1
     AND refresh_token != $2`,
    [userId, hashedToken]
  );
};
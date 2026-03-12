import { pool } from "../db.js";

export const requireLevel = (minLevel) => {
  return async (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const result = await pool.query(`
      SELECT r.level
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.id = $1
    `, [req.user.id]);

    if (result.rowCount === 0)
      return res.status(403).json({ message: "No role assigned" });

    const userLevel = result.rows[0].level;

    if (userLevel < minLevel)
      return res.status(403).json({ message: "Insufficient permissions" });

    next();
  };
};
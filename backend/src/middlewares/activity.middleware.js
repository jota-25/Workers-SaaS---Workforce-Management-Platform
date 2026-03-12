import { pool } from "../db.js";

export const activityLogger = (action, resource = null) => {
  return async (req, res, next) => {

    res.on("finish", async () => {
      try {

        if (res.statusCode >= 400) return;

        await pool.query(
          `INSERT INTO activity_logs 
          (user_id, action, resource, resource_id, ip)
          VALUES ($1,$2,$3,$4,$5)`,
          [
            req.user?.id || null,
            action,
            resource,
            req.params?.id || null,
            req.ip
          ]
        );

      } catch (err) {
        console.error("Activity log error", err);
      }
    });

    next();
  };
};
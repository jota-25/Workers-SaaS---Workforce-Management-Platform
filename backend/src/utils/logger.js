import { pool } from "../db.js";

export const logActivity = async ({
  userId,
  action,
  resource,
  resourceId,
  ip
}) => {
  await pool.query(
    `INSERT INTO activity_logs 
     (user_id, action, resource, resource_id, ip)
     VALUES ($1,$2,$3,$4,$5)`,
    [userId, action, resource, resourceId, ip]
  );
};

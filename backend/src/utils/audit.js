import { pool } from "../db.js";

export const logAudit = async ({
  userId,
  action,
  resource,
  resourceId,
  before,
  after
}) => {
  try {
    await pool.query(
      `INSERT INTO audit_trail
      (user_id, action, resource, resource_id, before_data, after_data)
      VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        userId,
        action,
        resource,
        resourceId,
        before ? JSON.stringify(before) : null,
        after ? JSON.stringify(after) : null
      ]
    );
  } catch (error) {
    console.error("Audit error:", error);
  }
};
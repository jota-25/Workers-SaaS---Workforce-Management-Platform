import { pool } from "../db.js";

export const getDashboardStats = async () => {

  const [
    usersResult,
    workersResult,
    invitesResult,
    activityResult,
    lastLoginsResult
  ] = await Promise.all([

    pool.query(`SELECT COUNT(*) FROM users WHERE is_active = true`),
    pool.query(`SELECT COUNT(*) FROM workers WHERE is_active = true`), 
    pool.query(`SELECT COUNT(*) FROM invitations WHERE used = false`),

    pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as total
      FROM activity_logs
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 7
    `),

  
    pool.query(`
      SELECT user_id, ip, created_at
      FROM activity_logs
      WHERE action = 'LOGIN'
      ORDER BY created_at DESC
      LIMIT 10
    `)

  ]);

  return {
    activeUsers:    usersResult.rows[0].count,
    activeWorkers:  workersResult.rows[0].count,
    pendingInvites: invitesResult.rows[0].count,
    activityByDay:  activityResult.rows,
    lastLogins:     lastLoginsResult.rows
  };
};
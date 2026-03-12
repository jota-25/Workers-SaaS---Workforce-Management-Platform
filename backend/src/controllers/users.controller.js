import { pool } from "../db.js";
import bcrypt from "bcrypt";


// =========================
// GET ALL USERS
// =========================

export const getUsers = async (req, res) => {
  const result = await pool.query(`
    SELECT 
      u.id,
      u.email,
      u.nickname,
      u.is_active,
      u.is_verified,
      u.force_password_change,
      r.name as role,
      r.level,
      u.created_at
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    ORDER BY u.id
  `);

  res.json(result.rows);
};



// =========================
// GET USER BY ID
// =========================

export const getUserById = async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(`
    SELECT 
      u.id,
      u.email,
      u.nickname,
      u.is_active,
      u.is_verified,
      r.name as role,
      r.level
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE u.id = $1
  `,[id]);

  if (result.rowCount === 0)
    return res.status(404).json({ message: "User not found" });

  res.json(result.rows[0]);
};



// =========================
// UPDATE PROFILE
// =========================

export const updateMyProfile = async (req, res) => {
  const { nickname, email } = req.body;

  await pool.query(`
    UPDATE users
    SET nickname = $1,
        email = $2,
        is_verified = false,
        updated_at = NOW()
    WHERE id = $3
  `,[nickname,email,req.user.id]);

  res.json({ message: "Profile updated. Verify email again." });
};



// =========================
// CHANGE PASSWORD
// =========================

export const changePassword = async (req,res) => {

  const { currentPassword,newPassword } = req.body;

  const result = await pool.query(
    "SELECT password FROM users WHERE id=$1",
    [req.user.id]
  );

  const user = result.rows[0];

  const valid = await bcrypt.compare(currentPassword,user.password);

  if(!valid)
    return res.status(400).json({message:"Incorrect password"});

  const hashed = await bcrypt.hash(newPassword,10);

  await pool.query(`
    UPDATE users
    SET password=$1,
        force_password_change=false,
        updated_at=NOW()
    WHERE id=$2
  `,[hashed,req.user.id]);

  res.json({message:"Password updated"});
};



// =========================
// ADMIN RESET PASSWORD
// =========================

export const adminResetPassword = async (req,res) => {

  const {id} = req.params;
  const {newPassword} = req.body;

  const hashed = await bcrypt.hash(newPassword,10);

  await pool.query(`
    UPDATE users
    SET password=$1,
        force_password_change=true,
        updated_at=NOW()
    WHERE id=$2
  `,[hashed,id]);

  res.json({message:"Password reset"});
};



// =========================
// DEACTIVATE USER
// =========================

export const deactivateUser = async (req,res) => {

  const {id} = req.params;

  await pool.query(`
    UPDATE users
    SET is_active=false,
        updated_at=NOW()
    WHERE id=$1
  `,[id]);

  res.json({message:"User deactivated"});
};
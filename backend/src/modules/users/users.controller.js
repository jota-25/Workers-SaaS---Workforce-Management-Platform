import { userService } from "./users.service.js";

// =========================
// GET ALL USERS
// =========================

export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers();

    res.json(users);
  } catch (error) {
    next(error);
  }
};

// =========================
// GET USER BY ID
// =========================

export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(
      req.params.id
    );

    res.json(user);
  } catch (error) {
    next(error);
  }
};
// =========================
// UPDATE PROFILE
// =========================

export const updateMyProfile = async (
  req,
  res,
  next
) => {
  try {
    const user = await userService.updateMyProfile(
      req.user.id,
      req.body
    );

    res.json({
      message: "Perfil actualizado",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// USER CHANGE PASSWORD
// =========================

export const changePassword = async (
  req,
  res,
  next
) => {
  try {
    await userService.changePassword(
      req.user.id,
      {
        currentPassword:
          req.body.currentPassword,
        newPassword:
          req.body.newPassword,
        refreshToken:
          req.cookies?.refreshToken,
      }
    );

    res.json({
      message:
        "Contraseña actualizada correctamente",
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// ADMIN RESET PASSWORD
// =========================

export const adminResetPassword = async (
  req,
  res,
  next
) => {
  try {
    await userService.adminResetPassword(
      req.params.id,
      req.body.newPassword
    );

    res.json({
      message:
        "Contraseña restablecida correctamente",
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// DEACTIVATE USER
// =========================

export const deactivateUser = async (
  req,
  res,
  next
) => {
  try {
    await userService.deactivateUser(
      req.params.id
    );

    res.json({
      message:
        "Usuario desactivado correctamente",
    });
  } catch (error) {
    next(error);
  }
};
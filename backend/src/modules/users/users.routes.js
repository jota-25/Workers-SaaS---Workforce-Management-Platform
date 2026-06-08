import { Router } from "express";

import {
  getUsers,
  getUserById,
  updateMyProfile,
  changePassword,
  adminResetPassword,
  deactivateUser
} from "./users.controller.js";

import { verifyToken } from "../../middlewares/auth.middleware.js";
import { requireLevel } from "../../middlewares/requireLevel.middleware.js";

const router = Router();


// rutas especificas
  // editar perfil propio
    router.put(
      "/me",
      verifyToken,
      updateMyProfile
    );


  // cambiar contraseña
    router.put(
      "/change-password",
      verifyToken,
      changePassword
    );

// ruta de admin con nivel 

  // obtener todos los usuarios
    router.get(
      "/",
      verifyToken,
      requireLevel(50),
      getUsers
    );

  // admin reset password
    router.post(
      "/:id/reset-password",
      verifyToken,
      requireLevel(70),
      adminResetPassword
    );


  // desactivar usuario
    router.delete(
      "/:id",
      verifyToken,
      requireLevel(90),
      deactivateUser
    );


// rutas generales o parametros al final 
  // obtener usuario
    router.get(
      "/:id",
      verifyToken,
      requireLevel(50),
      getUserById
    );


export default router;
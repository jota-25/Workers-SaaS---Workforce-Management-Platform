import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { hashToken } from "../../shared/utils/hash.js";

import { sessionRepository } from "../sessions/sessions.repository.js";
import { userRepository } from "../users/users.repository.js";
import { roleRepository } from "../roles/roles.repository.js";
import { invitationRepository } from "../invitations/invitations.repository.js";

import { workerRepository } from "../workers/workers.repository.js";
import { sendEmail } from "../../shared/utils/mailer.js";
import { AppError } from "../../middlewares/appError.middleware.js";

export const authService = {

  async register(data) {

    const {
      name,
      email,
      password,
    } = data;

    const existingUser =
      await userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError(
        "Ya existe un usuario con ese correo",
        400
      );
    }

    const emailToken =
      crypto.randomBytes(32).toString("hex");

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const exists =
      await userRepository.existsAnyUser();

          if (exists) {
            throw new AppError(
              "El registro público está deshabilitado",
              403
            );
         }

      

     const role =
        await roleRepository.findByName(
          "super_admin"
        );

      if (!role) {
        throw new AppError(
          "Rol super_admin no encontrado",
          500
        );
      };

    const user =
      await userRepository.create({
        name,
        email,
        password: hashedPassword,
        roleId: role.id,
        emailVerificationToken: emailToken,
      });

    const verifyLink =
      `${process.env.FRONTEND_URL}/verify-email?token=${emailToken}`;

    await sendEmail({
      to: email,
      subject: "Verifica tu correo",
      html: `
        <h2>Verificación de correo</h2>

        <a href="${verifyLink}">
          Verificar correo
        </a>
      `,
    });

    return user;
  },
// creo que el de abajo es la rpueba

  async login({ login, password, ip, userAgent }) {

  /*const debugUser =
    await userRepository.findById(1);

  console.log("DEBUG:", debugUser);*/

  const user =
    await userRepository.findByLogin(login);

    //hasta aquie es la prueba

    if (!user) {
      throw new AppError(
        "Credenciales inválidas",
        401
      );
    }

    if (!user.isVerified) {
      throw new AppError(
        "Verifica tu email primero",
        403
      );
    }

    if (!user.isActive) {
      throw new AppError(
        "Cuenta desactivada",
        403
      );
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!validPassword) {
      throw new AppError(
        "Credenciales inválidas",
        401
      );
    }

    if (user.forcePasswordChange) {
      return {
        forcePasswordChange: true,
      };
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        roleId: user.roleId,
        level: user.role.level,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const hashedToken =
      hashToken(refreshToken);

    await sessionRepository.create({
      userId: user.id,
      refreshToken: hashedToken,
      ip,
      userAgent,
      expiresAt: new Date(
        Date.now() +
        7 * 24 * 60 * 60 * 1000
      ),
    });

    return {
      accessToken,
      refreshToken,
    };
  },

  async refreshToken(refreshToken) {

    const hashedToken =
      hashToken(refreshToken);

    const session =
      await sessionRepository.findValidSession(
        hashedToken
      );

    if (!session) {
      throw new AppError(
        "Sesión inválida o expirada",
        401
      );
    }

    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const accessToken = jwt.sign(
      {
        id: payload.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    const newRefreshToken = jwt.sign(
      {
        id: payload.id,
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const hashedNewToken =
      hashToken(newRefreshToken);

    await sessionRepository.update(
      session.id,
      {
        refreshToken: hashedNewToken,
        expiresAt: new Date(
          Date.now() +
          7 * 24 * 60 * 60 * 1000
        ),
        lastUsedAt: new Date(),
      }
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  },

  async verifyEmail(token) {
    const result =
      await userRepository.verifyEmail(token);

    if (result.count === 0) {
      throw new AppError("Token inválido", 404);
  
    }

    return {
      message: "Email verificado correctamente",
    };
  },

  async forgotPassword(email) {

    const user =
      await userRepository.findByEmail(email);

    if (!user) {
      return {
        message:
          "Si existe, se enviará un correo",
      };
    }

    const token =
      crypto.randomBytes(32).toString("hex");

    const expires =
      new Date(Date.now() + 15 * 60 * 1000);

    await userRepository.saveResetToken(
      email,
      token,
      expires
    );

    // enviar email
    const resetLink =
      `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

      await sendEmail({
        to: email,
        subject: "Restablecer contraseña",
        html: `
          <h2>Recuperación de contraseña</h2>

          <a href="${resetLink}">
            Restablecer contraseña
          </a>

          <p>Este enlace expira en 15 minutos.</p>
        `,
      });

    return {
      message: "Revisa tu correo",
    };
  },

  async resetPassword(
    token,
    newPassword
    ) {

    const user =
      await userRepository.findByResetToken(
        token
      );

    if (!user) {
      throw new AppError(
        "Token inválido o expirado",
        400
      );
    }

    const hashed =
      await bcrypt.hash(newPassword, 10);

      await userRepository.updatePassword(
        user.id,
        hashed
      );

      await sessionRepository.deleteByUserId(
        user.id
      );

    return {
      message: "Contraseña actualizada",
    };
  },

  
async acceptInvite({
  token,
  password,
  nickname,
  }) {

  const invitation =
    await invitationRepository.findValidToken(
      token
    );

  if (!invitation) {
    throw new AppError(
      "Invitación inválida",
      404
    );
  }

  const existingNickname =
    await userRepository.findByNickname(
      nickname
    );

  if (existingNickname) {
    throw new AppError(
      "Nickname ya utilizado",
      400
    );
  }

  const hashedPassword =
    await bcrypt.hash(password, 10);

  const user =
    await userRepository.create({
      email: invitation.email,
      password: hashedPassword,
      nickname,
      roleId: invitation.roleId,
      isVerified: true,
    });

  await workerRepository.assignUser(
    invitation.workerId,
    user.id
  );

  await invitationRepository.markAsUsed(
    invitation.id
  );

  return {
    message:
      "Cuenta creada correctamente",
  };
},
  
async getInviteInfo(token) {

  const invite =
    await invitationRepository.findInviteInfo(
      token
    );

  if (!invite) {
    throw new AppError(
      "Invitación inválida o expirada",
      404
    );
  }

  return invite;
},

async logout(refreshToken) {

  const hashedToken =
    hashToken(refreshToken);

  await sessionRepository
    .deleteByRefreshToken(
      hashedToken
    );

  return {
    message:
      "Sesión cerrada",
  };
},


};
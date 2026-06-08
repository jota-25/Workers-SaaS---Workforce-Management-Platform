import { authService } from "./auth.service.js";
import { loginSchema } from "./auth.validator.js";
export const register = async (
    req,
    res,
    next
  ) => {
    try {

      const user =
        await authService.register(
          req.body
        );

      res.status(201).json(user);

    } catch (error) {
      next(error);
    }
  };

export const login = async (
    req,
    res,
    next
  ) => {
    try {

      const data =
      loginSchema.parse(req.body);

    const result =
      await authService.login({
        login: data.login,
        password: data.password,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

    res.json(result);

  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
    req,
    res,
    next
  ) => {
    try {

      const result =
        await authService.refreshToken(
          req.body.refreshToken
        );

      res.json(result);

    } catch (error) {
      next(error);
    }
};

export const verifyEmail = async (
    req,
    res,
    next
  ) => {
    try {

      const result =
        await authService.verifyEmail(
          req.query.token
        );

      res.json(result);

    } catch (error) {
      next(error);
    }
};


export const forgotPassword = async (
    req,
    res,
    next
  ) => {
    try {

      const result =
        await authService.forgotPassword(
          req.body.email
        );

      res.json(result);

    } catch (error) {
      next(error);
    }
};

export const resetPassword = async (
    req,
    res,
    next
  ) => {
    try {
      const { token, newPassword } = req.body;

      const result =
        await authService.resetPassword(
          token,
          newPassword
        );

      res.json(result);

    } catch (error) {
      next(error);
    }
};

export const acceptInvite = async (req, res, next) => {
  try {
    const { token, password, nickname } = req.body;

const result =
  await authService.acceptInvite({
    token,
    password,
    nickname,
  });
    res.json(result);
  } catch (error) {
    next(error);
  } 
};

export const getInviteInfo = async (req, res, next) => {
  try {
    const { token } = req.params; 
    const result = await authService.getInviteInfo(token);
    res.json(result);
  } catch (error) { 
    next(error);
  } 
};



// logout: recibe el refresh token, lo borra de la DB (o marca como expirado) y listo. Así se invalida esa sesión específica (útil para logout desde múltiples dispositivos)

export const logout = async (req, res, next) => { 
  try {
    const { refreshToken } = req.body;  
    const result =
    await authService.logout(
      refreshToken
    );

  res.json(result);
  } catch (error) {
    next(error);
  }
};
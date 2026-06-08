import { sessionService } from "./session.service.js";

// ================================
// VER MIS SESIONES ACTIVAS
// ================================
export const getMySessions = async (
  req,
  res,
  next
) => {
  try {

    const sessions =
      await sessionService.getMySessions(
        req.user.id
      );

    res.json(sessions);

  } catch (error) {
    next(error);
  }
};


// ================================
// CERRAR UNA SESIÓN ESPECÍFICA
// ================================
export const deleteSession = async (
  req,
  res,
  next
) => {
  try {

    await sessionService.deleteSession(
      req.params.id,
      req.user.id
    );

    res.json({
      message: "Sesión cerrada",
    });

  } catch (error) {
    next(error);
  }
};

// ================================
// CERRAR TODAS LAS SESIONES MENOS LA ACTUAL
// ================================
export const deleteOtherSessions = async (
  req,
  res,
  next
) => {
  try {

    const closed =
      await sessionService.deleteOtherSessions(
        req.user.id,
        req.body.refreshToken
      );

    res.json({
      message:
        "Otras sesiones cerradas",
      closed,
    });

  } catch (error) {
    next(error);
  }
};


// ================================
// CERRAR ABSOLUTAMENTE TODAS LAS SESIONES
// ================================
export const deleteAllSessions = async (
  req,
  res,
  next
) => {
  try {

    const closed =
      await sessionService.deleteAllSessions(
        req.user.id
      );

    res.json({
      message:
        "Todas las sesiones cerradas",
      closed,
    });

  } catch (error) {
    next(error);
  }
};
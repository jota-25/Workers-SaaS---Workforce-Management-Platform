import { invitationService } from "./invitations.service.js";

// ================================
// LISTAR INVITACIONES
// ================================
export const getInvitations = async (
    req,
    res,
    next
  ) => {
    try {

      const invitations =
        await invitationService.getInvitations();

      res.json(invitations);

    } catch (error) {
      next(error);
    }
  };

// ================================
// REENVIAR INVITACIÓN
// ================================
export const resendInvitation = async (
  req,
  res,
  next
) => {
  try {

    await invitationService.resendInvitation(
      req.params.id
    );

    res.json({
      message:
        "Invitación reenviada",
    });

  } catch (error) {
    next(error);
  }
};
// ================================
// CANCELAR INVITACIÓN
// ================================
export const cancelInvitation = async (
  req,
  res,
  next
) => {
  try {

    await invitationService.cancelInvitation(
      req.params.id
    );

    res.json({
      message:
        "Invitación cancelada",
    });

  } catch (error) {
    next(error);
  }
};
import { userRepository } from "../modules/users/users.repository.js";

export const requireLevel = (minLevel) => {
  return async (req, res, next) => {
    try {

      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const user =
        await userRepository.findByIdWithRole(
          req.user.id
        );

      if (!user?.role) {
        return res.status(403).json({
          message: "No role assigned",
        });
      }

      if (user.role.level < minLevel) {
        return res.status(403).json({
          message:
            "Insufficient permissions",
        });
      }

      next();

    } catch (error) {
      next(error);
    }
  };
};
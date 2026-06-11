export const requireLevel = (minLevel) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (req.user.level < minLevel) {
      return res.status(403).json({
        message: "Insufficient permissions",
      });
    }

    next();
  };
};
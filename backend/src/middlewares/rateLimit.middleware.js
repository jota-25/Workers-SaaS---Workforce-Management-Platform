import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 intentos

  validate: { xForwardedForHeader: false },
  
  message: {
    message: "Demasiados intentos, intenta más tarde"
  }
});

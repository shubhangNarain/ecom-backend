import rateLimit from "express-rate-limit";

const make = (windowMinutes, max, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({ message }),
  });

export const loginLimiter = make(60, 50, "Too many login attempts. Try again after 1 hour.");
export const registerLimiter = make(60, 100, "Too many registrations from this IP. Try again after 1 hour.");
export const createLimiter = make(15, 200, "Too many create requests. Try again after 15 minutes.");
export const updateLimiter = make(15, 300, "Too many update requests. Try again after 15 minutes.");
export const deleteLimiter = make(15, 100, "Too many delete requests. Try again after 15 minutes.");
export const readLimiter = make(1, 1000, "Too many requests. Try again after 1 minute.");

export default loginLimiter;

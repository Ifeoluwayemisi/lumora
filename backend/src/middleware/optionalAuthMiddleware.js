import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient.js";

/**
 * Optional Authentication Middleware
 * Attempts to authenticate user if token provided, but doesn't fail if absent
 * Useful for endpoints that work for both authenticated and unauthenticated users
 */
export async function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // If no token provided, continue without authentication
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) return next();

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (user) {
        req.user = user;
      }
    } catch (jwtError) {
      // Token is invalid or expired, but that's ok for optional auth
      console.debug(
        "[OPTIONAL_AUTH] Token verification failed:",
        jwtError.message
      );
    }

    next();
  } catch (error) {
    console.error("[OPTIONAL_AUTH] Unexpected error:", error.message);
    next(); // Continue even if something goes wrong
  }
}

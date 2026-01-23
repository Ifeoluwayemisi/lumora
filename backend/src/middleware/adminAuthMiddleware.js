import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient.js";

/**
 * Admin Authentication Middleware
 * Validates JWT tokens for admin endpoints
 * Extracts adminId from token and loads admin user
 */
export async function adminAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if this is an admin token
      if (decoded.type !== "admin" || !decoded.adminId) {
        return res.status(401).json({ error: "Invalid admin token" });
      }

      // Fetch admin user from database
      const admin = await prisma.adminUser.findUnique({
        where: { id: decoded.adminId },
      });

      if (!admin) {
        return res.status(401).json({ error: "Admin user not found" });
      }

      if (!admin.isActive) {
        return res.status(401).json({ error: "Admin account is inactive" });
      }

      // Attach admin to request
      req.admin = admin;
      req.adminId = admin.id;
      next();
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token has expired" });
      }
      console.error("[ADMIN_AUTH] JWT verification error:", jwtError.message);
      return res.status(401).json({ error: "Invalid token" });
    }
  } catch (error) {
    console.error("[ADMIN_AUTH_MIDDLEWARE] Unexpected error:", error);
    return res.status(500).json({ error: "Authentication check failed" });
  }
}

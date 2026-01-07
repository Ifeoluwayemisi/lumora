import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient";

export async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) return res.json(401).json({ error: "User not found" });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

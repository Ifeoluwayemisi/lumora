import jwt from 'jsonwebtoken';
import prisma from '../models/prismaClient.js';

export async function optionalAuthMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ') [1];
    if (!token) return next();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await prisma.user.findUnique({ where: {id: decoded.id}});
    } catch {

    }
    next();
}
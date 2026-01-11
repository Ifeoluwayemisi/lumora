import prisma from '../models/prismaClient.js';

export async function checkRateLimit(userId, ipAddress) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await prisma.verificationLog.count({
        where: {
            createdAt: { gte: today},
            OR: [
                userId ? {userId} : {},
            ],
        },
    });

    const limit = userId ? 30 : 5;

    if (count >= limit) {
        throw new Error('Rate limit exceeded');
    }
}
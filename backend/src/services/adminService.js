import prisma from "../models/prismaClient";
import { analyzeHotspots } from "../utils/aiClient";

export async function getAllVerifications({page = 1, limit = 50 }) {
    const skip = (page - 1) * limit;
    const total = await prisma.verificationLog.count();

    const data = await prisma.verificationLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc'},
        include: {
            code: true,
            batch: true,
            product: true,
            user: true
        }
    });
    return {total, page, limit, data};
}
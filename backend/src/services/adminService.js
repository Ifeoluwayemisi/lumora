import prisma from "../models/prismaClient";
import { analyzeHotspots } from "../utils/aiClient";

export async function getAllVerifications({ page = 1, limit = 50 }) {
  const skip = (page - 1) * limit;
  const total = await prisma.verificationLog.count();

  const data = await prisma.verificationLog.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      code: true,
      batch: true,
      product: true,
      user: true,
    },
  });
  return { total, page, limit, data };
}

export async function getAllIncidents({ status }) {
    return prisma.incident.findMany({
        where: status ? {status} : {},
        orderBy: {createdAt: 'desc'},
        include: {verificationLog: true}
    });
}

export async function getHighRiskCodes() {
    return prisma.code.findMany({
        where: {
            status: { in: ['CODE_ALREADY_USED', 'SUSPICIOUS_PATTERN', 'UNREGISTERED_PRODUCT']}
        },
        include: {
            batch: { include: { product: true}}
        },
        orderBy: {createdAt: 'desc'}
    });
}

// ai-powered predictions for internal dashboard
export async function getAdminPredictionHotspots(days = 30) {
    const logs = await prisma.verificationLog.findMany({
        where: {
            createdAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)},
            verificationState: { in: ['CODE_ALREADY_USED', 'SUSPICIOUS_PATTERN', 'UNREGISTERED_PRODUCT']}
        },
        select: {
            latitude: true, longitude: true, codeValue: true, verificationState: true
        }
    });
    if (!logs.length) return [];
    return analyzeHotspots(logs);
}

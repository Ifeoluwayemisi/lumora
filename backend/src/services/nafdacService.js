import prisma from "../models/prismaClient.js";
import { analyzeHotspots } from "../utils/aiClient.js";

export async function getIncidents(filter = {}) {
  return prisma.incident.findMany({
    where: {
      status: filter.status || "OPEN",
    },
    include: {
      verificationLog: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
export async function updateIncidentStatus(incidentId, status) {
  return prisma.incident.update({
    where: { id: incidentId },
    data: { status },
  });
}

export  async function getHotspots() {
    return prisma.verificationLog.groupBy({
        by: ['latitude', 'longitude'],
        where: {
            verificationState: {
                in: ['CODE_ALREADY_USED', 'SUSPICIOUS_PATTERN']
            }
        },
        _count: true
    });
}

export async function getPredictedHotspots(days = 30) {
    // pull verification logs from las N days with high-risk states
    const logs = await prisma.verificationLog.findMany({
        where: {
            createdAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
            verificationState: { in: ['CODE_ALREADY_USED', 'SUSPICIOUS_PATTERN', 'UNREGISTERED_PRODUCT'] }
        },
        select: {
            latitude: true,
            longitude: true,
            codeValue: true,
            verificationState: true,
        }
    });

    if (!logs.length) return [];

    // send data to AI for analysis
    const predictions = await analyzeHotspots(logs);
    return predictions;
}
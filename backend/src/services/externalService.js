import { analyzeHotspots } from "../utils/aiClient";
import prisma from "../models/prismaClient";

export async function analyzeExternalProduct(codeValue, latitude, longitude) {
    /**
     * Accepts codevalue (unregistered products) and optional lat/lng
     * Returns AI-predicted riskscore and advisory
     */

    // prepare a minimal dataset for ai context
    // pull last 30 days logs for similar unregistered codes if any
    const recentLogs = await prisma.verificationLog.findMany({
        where: {
            verificationState: { in: ['UNREGISTERED_PRODUCT', 'SUSPICIOUS_PATTERN']}
        },
        take: 50, //small sample for ai
        select: { codeValue:  true, latitude: true, longitude: true, verificationState: true
        }
    });

    const aiInput = [
        ...recentLogs, 
        {codeValue, latitude, longitude, verificationState: 'UNREGISTERED_PRODUCT'}
    ];

    const aiResult = await analyzeHotspots(aiInput);

    //find ai output corresponding to our codevalue (should return one object)
    const prediction = aiResult.find(p =>p.codeValue === codeValue)|| aiResult[0];
        return prediction;;
}

export async function getExternalRiskByLocation(days = 30) {
    /**
     * Aggregate unregistered products & high-risk codes by location
     * Pass to AI for risk scoring 
     */

    const logs = await prisma.verificationLog.findMany({
        where: {
            createdAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)},
            verificationState: { in: ['UNREGISTERED_PRODUCT', 'SUSPICIOUS_PATTERN', 'CODE_ALREADY_USED']}
        },
        select: { codeValue: true, latitude: true, longitude: true, verificationState: true}
    });
    if (!logs.length) return [];

    return analyzeHotspots(logs);
}
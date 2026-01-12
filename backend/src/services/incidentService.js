import prisma from '../models/prismaClient.js';

export async function maybeCreateIncident({
    codeValue,
    state,
    riskScore,
    trustDecision,
}) {
    if (
        trustDecision !== 'REPORT_TO_NAFDAC' && trustDecision !== 'DO_NOT_USE'
    ) {
        return null;
    }

    return prisma.incident.create({
        data: {
            codeValue,
            state,
            riskScore,
            status: 'OPEN'
        },
    });
}
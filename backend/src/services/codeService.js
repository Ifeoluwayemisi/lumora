import prisma from "../models/prismaClient.js";
import { generateUniqueCode } from "../utils/generateCode.js";
import { generateQRCode } from "../utils/qrGenerator.js";

export async function generateCodesForBatch(manufacturerId, drugId, batchNumber, expirationDate, quantity) {
    const batch = await prisma.batch.create({data: {
        manufacturerId,
        drugId,
        batchNumber,
        expirationDate,
    },
});
    const codes = [];
    for (let i =0; i < quantity; i++) {
        const codeValue = await generateUniqueCode();
        const qrPath = await generateQRCode(codeValue);
        const code = await prisma.code.create({
            data: {
                codeValue,
                batchId: batch.id,
                manufacturerId,
                qrImagePath: qrPath,
            },
        });
        codes.push(code);
    }
    return {batch, codes};
}
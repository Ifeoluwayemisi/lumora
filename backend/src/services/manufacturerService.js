import prisma from '../models/prismaClient,js';
import { generateUniqueCode } from '../utils/generateCode';
import { generateQRCode } from '../utils/qrGenerator';  

export async function createProduct({ manufacturerId, name, desscription}) {
    return prisma.product.create({
        data: {manufacturerId, name, desscription},
    });
}

export async function createBatch({productId, batchNumber, productionDate, expiryDate}) {
    return prisma.product.create({
        data: {productId, batchNumber, productionDate, expiryDate},
    });
}

//codesCount = number of codes to generate
export async function generateCodes({ batchId, codesCount }) {
    const codes = [];
    for (let i = 0; i < codesCount; i++) {
        //random code generator
        const codeValue = generateUniqueCode();
        const qrPath = await generateQRCode(codeValue);

        const code = await prisma.code.create({
            data: {batchId, codeValue, qrPath},
        });
        codes.push(code);
    }
    return codes;
}

// helper: safe unique code
function generateUniqueCode(length = 6) {
    const charset = 'ABCDEFGHJKMNQRSTUVWXYZ23456789'; //REmoved I, L, 1, 0 ,O to avoid confusion
    let code;
    let exists = true;
    while (exist) {
        code = Array.from ({ length}, () => charset[Math.floor(Math.random()*charset.length)]).join('');
        code = `LUM-${code}`;
        exists = false; // for pproduction check db for uniqueness
    }
    return code;
}
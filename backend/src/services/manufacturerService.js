import prisma from "../models/prismaClient.js";
import { generateQRCode } from "../utils/qrGenerator.js";

//  PRODUCTS 
export async function createProduct({ manufacturerId, name, description }) {
  return prisma.product.create({
    data: { manufacturerId, name, description },
  });
}

//  BATCHES 
export async function createBatch({
  productId,
  batchNumber,
  productionDate,
  expiryDate,
}) {
  return prisma.batch.create({
    data: { productId, batchNumber, productionDate, expiryDate },
  });
}

//  CODES 
export async function generateCodes({ batchId, codesCount }) {
  if (!codesCount || codesCount < 1) {
    throw new Error("codesCount must be greater than 0");
  }

  return prisma.$transaction(async (tx) => {
    const createdCodes = [];

    for (let i = 0; i < codesCount; i++) {
      const codeValue = await generateUniqueCode(tx);
      const qrPath = await generateQRCode(codeValue);

      const code = await tx.code.create({
        data: { batchId, codeValue, qrPath },
      });

      createdCodes.push(code);
    }

    return createdCodes;
  });
}

//  HELPERS 
async function generateUniqueCode(tx, length = 6) {
  const charset = "ABCDEFGHJKMNQRSTUVWXYZ23456789";
  let code;
  let exists = true;

  while (exists) {
    const random = Array.from(
      { length },
      () => charset[Math.floor(Math.random() * charset.length)]
    ).join("");

    code = `LUM-${random}`;

    const found = await tx.code.findUnique({
      where: { codeValue: code },
    });

    exists = Boolean(found);
  }

  return code;
}

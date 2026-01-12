import prisma from "../models/prismaClient.js";
import { generateQRCode } from "../utils/qrGenerator.js";
import { checkDailyCodeLimit } from "./subscriptionService.js";

/**
 * CREATE PRODUCT
 */
export async function createProduct({ manufacturerId, name, description }) {
  return prisma.product.create({
    data: { manufacturerId, name, description },
  });
}

/**
 * HELPER: VERIFY MANUFACTURER + SUBSCRIPTION
 */
async function verifyManufacturer(manufacturerId) {
  const manufacturer = await prisma.manufacturer.findUnique({
    where: { id: manufacturerId },
  });

  if (!manufacturer) {
    throw new Error("Manufacturer not found");
  }

  if (!manufacturer.verified) {
    throw new Error("Manufacturer must be verified to generate codes");
  }

  // ✅ FREE tier enforces daily limit, PREMIUM skips limit
  if (manufacturer.subscriptionTier === "FREE") {
    await checkDailyCodeLimit(manufacturerId);
  }

  return manufacturer;
}

/**
 * CREATE BATCH + CODES IN ONE TRANSACTION
 */
export async function createBatchWithCodes({
  productId,
  manufacturerId,
  productionDate,
  expirationDate,
  quantity,
}) {
  if (!quantity || quantity < 1) throw new Error("Quantity must be at least 1");

  // 🔐 Verify manufacturer + subscription tier
  await verifyManufacturer(manufacturerId);

  return prisma.$transaction(async (tx) => {
    // Get last batch
    const lastBatch = await tx.batch.findFirst({
      where: { productId },
      orderBy: { createdAt: "desc" },
      select: { batchNumber: true },
    });

    const nextNumber = lastBatch
      ? parseInt(lastBatch.batchNumber.split("-")[1], 10) + 1
      : 1;

    const batchNumber = `BATCH-${String(nextNumber).padStart(3, "0")}`;

    // Create batch
    const batch = await tx.batch.create({
      data: {
        batchNumber,
        productionDate,
        expirationDate,
        product: { connect: { id: productId } },
        manufacturer: { connect: { id: manufacturerId } },
      },
    });

    // Generate codes in same transaction
    const createdCodes = [];
    for (let i = 0; i < quantity; i++) {
      const codeValue = await generateUniqueCode();
      const qrPath = await generateQRCode(codeValue);

      const code = await tx.code.create({
        data: {
          batchId: batch.id,
          manufacturerId,
          codeValue,
          qrImagePath: qrPath,
        },
      });

      createdCodes.push(code);
    }

    return { batch, createdCodes };
  });
}

/**
 * GENERATE CODES (SEPARATE)
 */
export async function generateCodes({ batchId, quantity, manufacturerId }) {
  if (!quantity || quantity < 1) throw new Error("Quantity must be at least 1");

  // 🔐 Verify manufacturer + subscription tier
  await verifyManufacturer(manufacturerId);

  const createdCodes = [];
  for (let i = 0; i < quantity; i++) {
    const codeValue = await generateUniqueCode();
    const qrPath = await generateQRCode(codeValue);

    const code = await prisma.code.create({
      data: {
        batchId,
        manufacturerId,
        codeValue,
        qrImagePath: qrPath,
      },
    });

    createdCodes.push(code);
  }

  return createdCodes;
}

/**
 * UNIQUE CODE GENERATOR
 */
async function generateUniqueCode(length = 6) {
  const charset = "ABCDEFGHJKMNQRSTUVWXYZ23456789";

  while (true) {
    const random = Array.from(
      { length },
      () => charset[Math.floor(Math.random() * charset.length)]
    ).join("");

    const code = `LUM-${random}`;

    const exists = await prisma.code.findUnique({ where: { codeValue: code } });
    if (!exists) return code;
  }
}

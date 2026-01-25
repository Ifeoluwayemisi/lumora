import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkCode() {
  try {
    const code = await prisma.code.findFirst({
      where: { codeValue: "LUM-7YHFGH" },
    });
    if (code) {
      console.log("✅ Code found in DB:");
      console.log("  Code Value:", code.codeValue);
      console.log("  QR Path:", code.qrImagePath);
      console.log("  Batch ID:", code.batchId);
      console.log("  Created:", code.createdAt);
    } else {
      console.log("❌ Code NOT found in database");
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCode();

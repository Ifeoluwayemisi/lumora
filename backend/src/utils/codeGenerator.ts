import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate unique codes for a batch with retry and DB-level uniqueness
 * This uses Prisma createMany and handles duplicates by regenerating when unique constraint fails.
 */
export async function generateCodes(
  prisma: PrismaClient,
  batchId: string,
  quantity: number
) {
  const results: { code: string }[] = [];
  let attempts = 0;
  while (results.length < quantity && attempts < quantity * 3) {
    const remaining = quantity - results.length;
    const batch = [];
    for (let i = 0; i < remaining; i++) {
      const code =
        uuidv4().replace(/-/g, "").slice(0, 20) +
        Date.now().toString().slice(-5);
      batch.push({ batchId, code });
    }
    try {
      await prisma.verificationCode.createMany({
        data: batch,
        skipDuplicates: true,
      });
      // fetch newly created
      const created = await prisma.verificationCode.findMany({
        where: { batchId },
        take: remaining,
        orderBy: { createdAt: "desc" },
      });
      for (const c of created) {
        if (!results.find((r) => r.code === c.code))
          results.push({ code: c.code });
      }
    } catch (err: any) {
      // possible duplicate key or other transient error -> retry
    }
    attempts++;
  }
  return results;
}
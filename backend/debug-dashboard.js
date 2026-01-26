import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function debugDashboard() {
  try {
    console.log("\n========== DASHBOARD DEBUG ==========\n");

    // 1. Check if there are ANY codes
    const totalCodes = await prisma.code.count();
    console.log(`✅ Total codes in system: ${totalCodes}`);

    if (totalCodes > 0) {
      const sampleCodes = await prisma.code.findMany({
        select: { codeValue: true, isUsed: true, manufacturerId: true },
        take: 3,
      });
      console.log("   Sample codes:", sampleCodes);
    }

    // 2. Check if there are ANY verifications
    const totalLogs = await prisma.verificationLog.count();
    console.log(`\n📊 Total verification logs: ${totalLogs}`);

    if (totalLogs > 0) {
      const sampleLogs = await prisma.verificationLog.findMany({
        select: {
          codeValue: true,
          verificationState: true,
          manufacturerId: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
      console.log("   Recent verifications:");
      sampleLogs.forEach((log, i) => {
        console.log(
          `   ${i + 1}. ${log.codeValue} - ${log.verificationState} - Mfg: ${log.manufacturerId || "NULL"} - ${log.createdAt.toLocaleString()}`,
        );
      });
    } else {
      console.log("   ❌ NO verification logs found!");
    }

    // 3. Check by verification state
    console.log("\n📈 Verification breakdown:");
    const breakdown = await prisma.verificationLog.groupBy({
      by: ["verificationState"],
      _count: { id: true },
    });
    if (breakdown.length > 0) {
      breakdown.forEach((b) => {
        console.log(`   ${b.verificationState}: ${b._count.id}`);
      });
    } else {
      console.log("   ❌ NO verification states found!");
    }

    // 4. Check today's verifications
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await prisma.verificationLog.count({
      where: { createdAt: { gte: today } },
    });
    console.log(
      `\n📅 Verifications today (since ${today.toLocaleString()}): ${todayCount}`,
    );

    // 5. Check manufacturers
    const mfgCount = await prisma.manufacturer.count();
    console.log(`\n👥 Total manufacturers: ${mfgCount}`);

    if (mfgCount > 0) {
      const manufacturers = await prisma.manufacturer.findMany({
        select: { id: true, companyName: true },
        take: 3,
      });
      console.log("   Sample manufacturers:");
      for (const mfg of manufacturers) {
        const verCount = await prisma.verificationLog.count({
          where: { manufacturerId: mfg.id },
        });
        console.log(`   - ${mfg.companyName}: ${verCount} verifications`);
      }
    }

    // 6. Check products
    const productCount = await prisma.product.count();
    console.log(`\n📦 Total products: ${productCount}`);

    // 7. Check batches
    const batchCount = await prisma.batch.count();
    console.log(`📦 Total batches: ${batchCount}`);

    console.log("\n========== END DEBUG ==========\n");
  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error(err.stack);
  } finally {
    await prisma.$disconnect();
  }
}

debugDashboard();

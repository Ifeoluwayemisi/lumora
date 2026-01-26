import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkVerificationLogs() {
  try {
    console.log("\n[CHECK] Checking verification logs...\n");

    // Get all verification logs
    const allLogs = await prisma.verificationLog.findMany({
      select: {
        id: true,
        codeValue: true,
        verificationState: true,
        manufacturerId: true,
        batchId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    console.log(`📊 Found ${allLogs.length} recent verification logs:\n`);
    allLogs.forEach((log) => {
      console.log(`  Code: ${log.codeValue}`);
      console.log(`    State: ${log.verificationState}`);
      console.log(`    Manufacturer ID: ${log.manufacturerId || "❌ NULL"}`);
      console.log(`    Batch ID: ${log.batchId || "NULL"}`);
      console.log(`    Timestamp: ${log.createdAt}\n`);
    });

    // Check totals
    const totalLogs = await prisma.verificationLog.count();
    console.log(`\n📈 Total verification logs in database: ${totalLogs}`);

    // Check by manufacturer
    const byManufacturer = await prisma.verificationLog.groupBy({
      by: ["manufacturerId"],
      _count: {
        id: true,
      },
    });

    console.log(`\n👥 Verifications by manufacturer:`);
    for (const group of byManufacturer) {
      if (group.manufacturerId) {
        const mfg = await prisma.manufacturer.findUnique({
          where: { id: group.manufacturerId },
          select: { companyName: true },
        });
        console.log(
          `  ${mfg?.companyName || group.manufacturerId}: ${group._count.id} verifications`,
        );
      } else {
        console.log(`  ❌ NULL manufacturer: ${group._count.id} verifications`);
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkVerificationLogs();

import prisma from "./src/models/prismaClient.js";

async function debugManufacturerCodes() {
  try {
    console.log("\n=== MANUFACTURER CODES DEBUG ===\n");

    // Get all manufacturers
    const manufacturers = await prisma.manufacturer.findMany({
      include: {
        user: {
          select: { email: true },
        },
      },
    });

    console.log(`Found ${manufacturers.length} manufacturers\n`);

    for (const mfr of manufacturers) {
      console.log(`\n--- Manufacturer: ${mfr.name} (${mfr.user.email}) ---`);
      console.log(`ID: ${mfr.id}`);

      // Count codes with this manufacturerId
      const codesCount = await prisma.code.count({
        where: { manufacturerId: mfr.id },
      });

      // Count batches
      const batchesCount = await prisma.batch.count({
        where: { manufacturerId: mfr.id },
      });

      console.log(`Batches: ${batchesCount}`);
      console.log(`Codes: ${codesCount}`);

      // Show sample codes
      if (codesCount > 0) {
        const sampleCodes = await prisma.code.findMany({
          where: { manufacturerId: mfr.id },
          take: 3,
          select: {
            id: true,
            codeValue: true,
            manufacturerId: true,
            batchId: true,
            isUsed: true,
            createdAt: true,
          },
        });

        console.log("\nSample codes:");
        sampleCodes.forEach((code) => {
          console.log(`  - ${code.codeValue} (used: ${code.isUsed})`);
        });
      }

      // Show batches
      if (batchesCount > 0) {
        const batches = await prisma.batch.findMany({
          where: { manufacturerId: mfr.id },
          take: 5,
          select: {
            id: true,
            batchNumber: true,
            manufacturerId: true,
            product: { select: { name: true } },
          },
        });

        console.log("\nBatches:");
        batches.forEach((batch) => {
          console.log(
            `  - ${batch.batchNumber} (Product: ${batch.product?.name})`,
          );
        });
      }
    }

    // Check for codes with NULL manufacturerId
    console.log("\n\n=== CODES WITH NULL MANUFACTURER ===");
    const nullMfrCodes = await prisma.code.count({
      where: { manufacturerId: null },
    });
    console.log(`Codes with NULL manufacturerId: ${nullMfrCodes}`);

    if (nullMfrCodes > 0) {
      const samples = await prisma.code.findMany({
        where: { manufacturerId: null },
        take: 5,
        select: {
          id: true,
          codeValue: true,
          batchId: true,
          batch: { select: { manufacturerId: true } },
        },
      });
      console.log("\nSample codes with NULL manufacturerId:");
      samples.forEach((code) => {
        console.log(
          `  - ${code.codeValue} (batch manufacturerId: ${code.batch?.manufacturerId})`,
        );
      });
    }

    // Total stats
    console.log("\n\n=== TOTAL STATS ===");
    const totalCodes = await prisma.code.count();
    const totalBatches = await prisma.batch.count();
    const totalManufacturers = await prisma.manufacturer.count();

    console.log(`Total Codes: ${totalCodes}`);
    console.log(`Total Batches: ${totalBatches}`);
    console.log(`Total Manufacturers: ${totalManufacturers}`);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugManufacturerCodes();

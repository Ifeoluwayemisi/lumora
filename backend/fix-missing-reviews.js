import prisma from "./src/models/prismaClient.js";

async function fixMissingReview() {
  try {
    console.log("=== FIXING MISSING REVIEWS ===\n");

    // Get manufacturers without review entries
    const manufacturersWithoutReview = await prisma.manufacturer.findMany({
      where: {
        manufacturerReview: null,
      },
    });

    console.log(
      `Found ${manufacturersWithoutReview.length} manufacturers without reviews\n`,
    );

    for (const mfg of manufacturersWithoutReview) {
      try {
        const review = await prisma.manufacturerReview.create({
          data: {
            manufacturerId: mfg.id,
            status: "pending",
          },
        });
        console.log(`✓ Created review for ${mfg.name} (${mfg.email})`);
        console.log(`  Review ID: ${review.id}\n`);
      } catch (err) {
        console.error(`✗ Failed to create review for ${mfg.name}:`);
        console.error(`  ${err.message}\n`);
      }
    }

    console.log("=== VERIFICATION ===\n");
    const reviewCount = await prisma.manufacturerReview.count();
    console.log(`✓ Total manufacturerReview entries now: ${reviewCount}`);

    const stillMissing = await prisma.manufacturer.findMany({
      where: {
        manufacturerReview: null,
      },
    });
    console.log(
      `✓ Manufacturers still missing reviews: ${stillMissing.length}`,
    );
  } catch (error) {
    console.error("Error:", error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

fixMissingReview();

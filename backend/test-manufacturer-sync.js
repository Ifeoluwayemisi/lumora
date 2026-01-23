import prisma from "./src/models/prismaClient.js";

async function testSync() {
  try {
    console.log("=== TESTING MANUFACTURER SYNC ===\n");

    // Check how many manufacturers exist
    const manufacturerCount = await prisma.manufacturer.count();
    console.log(`✓ Total manufacturers in DB: ${manufacturerCount}`);

    // Check how many manufacturerReview entries exist
    const reviewCount = await prisma.manufacturerReview.count();
    console.log(`✓ Total manufacturerReview entries: ${reviewCount}`);

    // Show pending reviews
    const pendingReviews = await prisma.manufacturerReview.findMany({
      where: { status: "pending" },
      include: {
        manufacturer: {
          select: {
            id: true,
            name: true,
            email: true,
            accountStatus: true,
          },
        },
      },
      take: 5,
    });

    console.log(
      `\n✓ Pending reviews (first 5): ${pendingReviews.length} found`,
    );
    pendingReviews.forEach((review, i) => {
      console.log(
        `  [${i + 1}] ${review.manufacturer?.name || "NO NAME"} (${review.manufacturer?.email})`,
      );
      console.log(`      Status: ${review.status}`);
      console.log(`      Mfg ID: ${review.manufacturerId}`);
      console.log(`      Review ID: ${review.id}\n`);
    });

    // Check for manufacturers WITHOUT review entries
    const manufacturersWithoutReview = await prisma.manufacturer.findMany({
      where: {
        manufacturerReview: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      take: 5,
    });

    if (manufacturersWithoutReview.length > 0) {
      console.log(
        `⚠️  Found ${manufacturersWithoutReview.length} manufacturers WITHOUT review entries:`,
      );
      manufacturersWithoutReview.forEach((mfg) => {
        console.log(
          `   - ${mfg.name} (${mfg.email}) - Created: ${mfg.createdAt}`,
        );
      });
    } else {
      console.log("✓ All manufacturers have review entries");
    }

    // Get the most recently created manufacturer
    const recentMfg = await prisma.manufacturer.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        manufacturerReview: true,
      },
    });

    if (recentMfg) {
      console.log("\n=== MOST RECENT MANUFACTURER ===");
      console.log(`Name: ${recentMfg.name}`);
      console.log(`Email: ${recentMfg.email}`);
      console.log(`Status: ${recentMfg.accountStatus}`);
      console.log(`Created: ${recentMfg.createdAt}`);
      console.log(`Has Review Entry: ${!!recentMfg.manufacturerReview}`);
      if (recentMfg.manufacturerReview) {
        console.log(`  Review Status: ${recentMfg.manufacturerReview.status}`);
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testSync();

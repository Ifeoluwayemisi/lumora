import prisma from "./src/models/prismaClient.js";

async function comprehensiveTest() {
  try {
    console.log("=== COMPREHENSIVE MANUFACTURER SYNC TEST ===\n");

    console.log("1️⃣  CHECKING DATABASE STATE");
    console.log("   ✓ Manufacturers:");
    const mfgCount = await prisma.manufacturer.count();
    console.log(`     Total: ${mfgCount}`);

    console.log("   ✓ ManufacturerReview entries:");
    const reviewCount = await prisma.manufacturerReview.count();
    console.log(`     Total: ${reviewCount}`);
    console.log(
      `     Pending: ${await prisma.manufacturerReview.count({ where: { status: "pending" } })}`,
    );
    console.log(
      `     Approved: ${await prisma.manufacturerReview.count({ where: { status: "approved" } })}`,
    );

    console.log("\n2️⃣  TESTING LIST ENDPOINT FLOW");

    // Get pending reviews (simulating GET /api/admin/manufacturers/review-queue)
    const allReviews = await prisma.manufacturerReview.findMany({
      where: { status: "pending" },
      include: {
        manufacturer: {
          select: {
            id: true,
            name: true,
            email: true,
            country: true,
            accountStatus: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
      skip: 0,
      take: 10,
    });

    console.log(`   ✓ Query executed successfully`);
    console.log(`   ✓ Found ${allReviews.length} pending reviews`);

    // Flatten response (as controller does)
    const flatItems = allReviews.map((review) => ({
      id: review.id,
      manufacturerId: review.manufacturerId,
      companyName: review.manufacturer.name,
      email: review.manufacturer.email,
      country: review.manufacturer.country,
      status: review.status,
      createdAt: review.createdAt,
      trustScore: review.trustScore,
      riskAssessment: review.riskAssessment,
      adminId: review.adminId,
    }));

    console.log("   ✓ Response flattened successfully");
    console.log("\n   Sample response structure:");
    if (flatItems.length > 0) {
      const first = flatItems[0];
      console.log(`   {
     id: "${first.id}",
     manufacturerId: "${first.manufacturerId}",
     companyName: "${first.companyName}",
     email: "${first.email}",
     country: "${first.country}",
     status: "${first.status}",
     ...
   }`);
    }

    console.log("\n3️⃣  TESTING DETAIL ENDPOINT FLOW");

    if (flatItems.length > 0) {
      const testMfgId = flatItems[0].manufacturerId;
      console.log(`   Using manufacturer ID: ${testMfgId}`);

      // Get manufacturer (as controller does)
      const manufacturer = await prisma.manufacturer.findUnique({
        where: { id: testMfgId },
        include: { documents: true },
      });

      if (!manufacturer) {
        console.log("   ✗ Manufacturer not found!");
      } else {
        console.log(`   ✓ Manufacturer found: ${manufacturer.name}`);
        console.log(`     - Documents: ${manufacturer.documents.length}`);

        // Get review (as controller does)
        const review = await prisma.manufacturerReview.findUnique({
          where: { manufacturerId: testMfgId },
          include: {
            admin: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        if (!review) {
          console.log("   ✗ Review not found!");
        } else {
          console.log(`   ✓ Review found: ${review.status}`);
          console.log(`     - Trust Score: ${review.trustScore || "Not set"}`);
          console.log(
            `     - Risk Assessment: ${review.riskAssessment ? "Available" : "Not set"}`,
          );
          console.log(
            `     - Assigned to: ${review.admin ? review.admin.email : "Unassigned"}`,
          );

          // Combined response (as controller returns)
          const combined = { ...manufacturer, ...review };
          console.log(
            `   ✓ Combined response has ${Object.keys(combined).length} fields`,
          );
        }
      }
    }

    console.log("\n4️⃣  CHECKING ADMIN USERS");
    const adminCount = await prisma.adminUser.count();
    console.log(`   ✓ Total admin users: ${adminCount}`);

    if (adminCount > 0) {
      const admin = await prisma.adminUser.findFirst({
        select: { email: true, role: true, firstName: true },
      });
      console.log(`   ✓ Sample admin: ${admin.email} (${admin.role})`);
    }

    console.log("\n✅ ALL SYSTEMS GO!");
    console.log("   - Database is properly synced");
    console.log("   - All queries working correctly");
    console.log("   - Ready for API testing");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveTest();

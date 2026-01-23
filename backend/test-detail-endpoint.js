import prisma from "./src/models/prismaClient.js";

async function testDetailEndpoint() {
  try {
    console.log("=== TESTING DETAIL ENDPOINT LOGIC ===\n");

    // Get first pending manufacturer
    const firstPending = await prisma.manufacturerReview.findFirst({
      where: { status: "pending" },
      include: {
        manufacturer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!firstPending) {
      console.log("No pending manufacturers found");
      return;
    }

    const manufacturerId = firstPending.manufacturerId;
    console.log(
      `Testing with: ${firstPending.manufacturer.name} (ID: ${manufacturerId})\n`,
    );

    // Test 1: Get manufacturer
    console.log("Step 1: Getting manufacturer...");
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      include: {
        documents: true,
      },
    });

    if (!manufacturer) {
      console.log("✗ ERROR: Manufacturer not found!");
      return;
    }
    console.log(`✓ Found manufacturer: ${manufacturer.name}`);
    console.log(`  ID: ${manufacturer.id}`);
    console.log(`  Email: ${manufacturer.email}`);
    console.log(`  Documents: ${manufacturer.documents.length}`);

    // Test 2: Get review
    console.log("\nStep 2: Getting manufacturerReview...");
    const review = await prisma.manufacturerReview.findUnique({
      where: { manufacturerId },
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
      console.log("✗ ERROR: ManufacturerReview not found!");
      console.log("  This is the issue - review should exist!");
      return;
    }
    console.log(`✓ Found review:`);
    console.log(`  ID: ${review.id}`);
    console.log(`  Status: ${review.status}`);
    console.log(`  Admin assigned: ${review.adminId || "None"}`);

    // Test 3: Combine response
    console.log("\nStep 3: Combining data...");
    const combined = {
      ...manufacturer,
      ...review,
    };

    console.log(`✓ Combined response ready`);
    console.log(`  Keys: ${Object.keys(combined).length}`);
    console.log(
      `  Would include: id, name, email, status, trustScore, riskAssessment, etc.`,
    );

    // Test 4: Simulate pagination query (like list endpoint)
    console.log("\nStep 4: Simulating list endpoint query...");
    const listQuery = await prisma.manufacturerReview.findMany({
      where: { status: "pending" },
      include: {
        admin: true,
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

    console.log(`✓ Found ${listQuery.length} pending reviews`);
    listQuery.forEach((item, i) => {
      console.log(
        `  [${i + 1}] ${item.manufacturer.name} - Status: ${item.status}`,
      );
    });

    console.log("\n✓ All queries successful - endpoints should work!");
  } catch (error) {
    console.error("Error:", error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testDetailEndpoint();

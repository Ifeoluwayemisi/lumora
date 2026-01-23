import prisma from "./src/models/prismaClient.js";

async function testAdminUsers() {
  try {
    console.log("=== CHECKING ADMIN USERS ===\n");

    const adminCount = await prisma.adminUser.count();
    console.log(`Total admin users: ${adminCount}`);

    if (adminCount > 0) {
      const admins = await prisma.adminUser.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
        take: 5,
      });

      console.log("\nAdmin users:");
      admins.forEach((admin, i) => {
        console.log(
          `[${i + 1}] ${admin.email} - ${admin.role} (${admin.firstName} ${admin.lastName})`,
        );
        console.log(`    Created: ${admin.createdAt}`);
      });
    } else {
      console.log("⚠️  No admin users found in database");
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminUsers();

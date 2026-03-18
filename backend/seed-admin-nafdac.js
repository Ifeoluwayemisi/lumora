import prisma from "./src/models/prismaClient.js";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Starting database seeding...\n");

  try {
    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    console.log("✓ Database connection successful");

    // Delete all users
    console.log("\n📋 Clearing all users...");
    await prisma.user.deleteMany({});
    console.log("✓ All users deleted");

    // Hash passwords
    const nafdacPassword = await bcrypt.hash("@Olorunmi81", 10);
    const adminPassword = await bcrypt.hash("@Olorunmi81", 10);

    // Create NAFDAC user
    console.log("\n👤 Creating NAFDAC user...");
    const nafdacUser = await prisma.user.create({
      data: {
        email: "rachealola@gmail.com",
        name: "Olayode",
        fullName: "Olayode Racheal",
        password: nafdacPassword,
        role: "NAFDAC",
        verified: true,
      },
    });
    console.log("✓ NAFDAC user created:", nafdacUser.email);

    // Create ADMIN user
    console.log("\n👤 Creating ADMIN user...");
    const adminUser = await prisma.user.create({
      data: {
        email: "rae@gmail.com",
        name: "Ifeoluwa",
        fullName: "Ifeoluwa",
        password: adminPassword,
        role: "ADMIN",
        verified: true,
      },
    });
    console.log("✓ ADMIN user created:", adminUser.email);

    console.log("\n✅ Database seeding complete!");
    console.log("\n📦 Created users:");
    console.log("  - NAFDAC: rachealola@gmail.com / @Olorunmi81");
    console.log("  - ADMIN:  rae@gmail.com / @Olorunmi81");
  } catch (error) {
    console.error("❌ Seeding error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

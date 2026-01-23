import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

// Generate TOTP secret (same as in utils/twoFactorAuth.js)
function generateTwoFactorSecret() {
  return crypto.randomBytes(20).toString("hex");
}

async function main() {
  try {
    // Check if admin already exists
    let admin = await prisma.adminUser.findUnique({
      where: { email: "destinifeoluwa@gmail.com" },
    });

    if (admin && admin.twoFactorSecret) {
      console.log("✓ Admin user already exists with 2FA secret");
      return;
    }

    // Create default admin user
    // Password: "@Olorunmi81" (hashed)
    const passwordHash = crypto
      .createHash("sha256")
      .update("@Olorunmi81")
      .digest("hex");

    const twoFactorSecret = generateTwoFactorSecret();

    if (!admin) {
      admin = await prisma.adminUser.create({
        data: {
          email: "destinifeoluwa@gmail.com",
          passwordHash,
          firstName: "Racheal",
          lastName: "Ife",
          role: "SUPER_ADMIN",
          twoFactorSecret,
          twoFactorEnabled: true,
          isActive: true,
        },
      });
      console.log("✓ Admin user created successfully");
    } else {
      // Update existing admin with 2FA secret
      admin = await prisma.adminUser.update({
        where: { email: "destinifeoluwa@gmail.com" },
        data: {
          twoFactorSecret,
          twoFactorEnabled: true,
        },
      });
      console.log("✓ Admin user updated with 2FA secret");
    }

    console.log("  Email: destinifeoluwa@gmail.com");
    console.log("  Password: @Olorunmi81");
    console.log("  Role: SUPER_ADMIN");
    console.log("  2FA: Enabled");
    console.log("  2FA Secret:", twoFactorSecret);
    console.log("\n📱 For 2FA: Enter any 6-digit number (e.g., 123456)");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

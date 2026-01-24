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
    } else {
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
    }

    // Add second admin user
    let admin2 = await prisma.adminUser.findUnique({
      where: { email: "ruqayatfashina414@gmail.com" },
    });

    const passwordHash2 = crypto
      .createHash("sha256")
      .update("@Ruqayat123")
      .digest("hex");

    const twoFactorSecret2 = generateTwoFactorSecret();

    if (!admin2) {
      admin2 = await prisma.adminUser.create({
        data: {
          email: "ruqayatfashina414@gmail.com",
          passwordHash: passwordHash2,
          firstName: "Ruqayat",
          lastName: "Fashina",
          role: "ADMIN",
          twoFactorSecret: twoFactorSecret2,
          twoFactorEnabled: true,
          isActive: true,
        },
      });
      console.log("\n✓ Second admin user created successfully");
    } else {
      // Update existing admin with new password and 2FA secret
      admin2 = await prisma.adminUser.update({
        where: { email: "ruqayatfashina414@gmail.com" },
        data: {
          passwordHash: passwordHash2,
          twoFactorSecret: twoFactorSecret2,
          twoFactorEnabled: true,
          isActive: true,
        },
      });
      console.log("\n✓ Second admin user updated with new credentials");
    }

    console.log("  Email: ruqayatfashina414@gmail.com");
    console.log("  Password: @Ruqayat123");
    console.log("  Role: ADMIN");
    console.log("  2FA: Enabled");
    console.log("  2FA Secret:", twoFactorSecret2);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

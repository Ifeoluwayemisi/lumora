/**
 * Setup NAFDAC Admin Account
 * Creates a NAFDAC admin user for regulatory dashboard access
 *
 * Usage: npm run setup:nafdac-admin
 */

import prisma from "./src/models/prismaClient.js";
import bcrypt from "bcryptjs";

async function setupNafdacAdmin() {
  try {
    console.log("[SETUP] Starting NAFDAC admin account creation...");

    const email = "rae@gmail.com";
    const password = "@Olorunmi81";
    const firstName = "Rae";
    const lastName = "Chelle";

    // Check if NAFDAC admin already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log(
        "[SETUP] NAFDAC admin already exists with this email:",
        email,
      );

      if (existingAdmin.role === "NAFDAC") {
        console.log("[SETUP] ✓ NAFDAC admin account already configured");
        console.log("[SETUP] Email:", email);
        console.log("[SETUP] Role:", existingAdmin.role);
        console.log("[SETUP] 2FA Enabled:", existingAdmin.twoFactorEnabled);
        return;
      } else {
        // Update role to NAFDAC if it's different
        console.log("[SETUP] Updating existing admin role to NAFDAC...");
        const updated = await prisma.adminUser.update({
          where: { email },
          data: { role: "NAFDAC" },
        });
        console.log("[SETUP] ✓ Admin role updated to NAFDAC");
        return;
      }
    }

    // Hash password
    console.log("[SETUP] Hashing password...");
    const passwordHash = await bcrypt.hash(password, 10);

    // Create AdminUser for NAFDAC
    console.log("[SETUP] Creating NAFDAC admin user...");
    const admin = await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: "NAFDAC",
        twoFactorEnabled: false, // Disable for testing, enable later
      },
    });

    console.log("[SETUP] ✓ NAFDAC admin user created successfully");
    console.log("  Email:", admin.email);
    console.log("  Name:", admin.firstName, admin.lastName);
    console.log("  Role:", admin.role);
    console.log("  Status: Active");

    console.log("\n[SETUP] ✅ NAFDAC Admin Account Setup Complete!");
    console.log("\n📋 Login Credentials:");
    console.log("  Email:", email);
    console.log("  Password:", password);
    console.log("\n🔗 Access URLs:");
    console.log("  Admin Login: /admin/login");
    console.log("  NAFDAC Dashboard: /nafdac");
    console.log("  Cases: /nafdac/cases");
    console.log("  Alerts: /nafdac/alerts");

    return admin;
  } catch (err) {
    console.error("[SETUP] ❌ Error creating NAFDAC admin account:");
    console.error("  Message:", err.message);
    console.error("  Code:", err.code);

    if (err.code === "P2002") {
      console.error("\n⚠️  Unique constraint violation:");
      const field = err.meta?.target?.[0];
      if (field === "email") {
        console.error(
          "   An account with this email already exists (checked above).",
        );
      }
    }

    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

// Run setup
setupNafdacAdmin()
  .then(() => {
    console.log("\n[SETUP] Done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n[SETUP] Fatal error:", err.message);
    process.exit(1);
  });

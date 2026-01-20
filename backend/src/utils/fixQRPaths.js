/**
 * Fix QR paths in database - convert absolute paths to relative paths
 * This utility helps migrate existing codes from absolute to relative paths
 */

import prisma from "../models/prismaClient.js";

export async function fixQRPathsInDatabase() {
  try {
    console.log("[FIX_QR_PATHS] Starting database path migration...");

    // Find all codes with absolute paths
    const codesWithAbsolutePaths = await prisma.code.findMany({
      where: {
        qrImagePath: {
          contains: "/opt/render/",
        },
      },
    });

    console.log(
      `[FIX_QR_PATHS] Found ${codesWithAbsolutePaths.length} codes with absolute paths`,
    );

    if (codesWithAbsolutePaths.length === 0) {
      console.log("[FIX_QR_PATHS] No codes with absolute paths found");
      return { fixed: 0, errors: 0 };
    }

    let fixed = 0;
    let errors = 0;

    // Update each code with relative path
    for (const code of codesWithAbsolutePaths) {
      try {
        // Extract relative path from absolute path
        // From: /opt/render/project/src/backend/uploads/qrcodes/LUM-JS8FMW.png
        // To:   /uploads/qrcodes/LUM-JS8FMW.png

        const uploadsIndex = code.qrImagePath.indexOf("/uploads");
        let newPath = code.qrImagePath;

        if (uploadsIndex !== -1) {
          newPath = code.qrImagePath.substring(uploadsIndex);
        }

        if (newPath !== code.qrImagePath) {
          await prisma.code.update({
            where: { id: code.id },
            data: { qrImagePath: newPath },
          });
          console.log(`[FIX_QR_PATHS] Updated ${code.codeValue}: ${newPath}`);
          fixed++;
        }
      } catch (error) {
        console.error(
          `[FIX_QR_PATHS] Error updating ${code.codeValue}:`,
          error.message,
        );
        errors++;
      }
    }

    console.log(
      `[FIX_QR_PATHS] Migration complete - Fixed: ${fixed}, Errors: ${errors}`,
    );

    return { fixed, errors };
  } catch (error) {
    console.error("[FIX_QR_PATHS] Fatal error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixQRPathsInDatabase().then((result) => {
    console.log("[FIX_QR_PATHS] Final result:", result);
    process.exit(result.errors > 0 ? 1 : 0);
  });
}

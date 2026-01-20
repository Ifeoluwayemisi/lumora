/**
 * Regenerate QR files for all existing codes in database
 * This recreates missing QR PNG files on disk
 */

import prisma from "../models/prismaClient.js";
import { generateQRCode } from "./qrGenerator.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export async function regenerateQRFiles() {
  try {
    console.log("[REGENERATE_QR] Starting QR file regeneration...");

    // Get the absolute path for QR codes directory
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const qrCodesDir = path.join(__dirname, "../../uploads/qrcodes");

    // Create directory if it doesn't exist
    if (!fs.existsSync(qrCodesDir)) {
      fs.mkdirSync(qrCodesDir, { recursive: true });
      console.log("[REGENERATE_QR] Created QR codes directory:", qrCodesDir);
    }

    // Get all codes from database
    const allCodes = await prisma.code.findMany({
      select: { id: true, codeValue: true },
    });

    console.log(`[REGENERATE_QR] Found ${allCodes.length} codes to regenerate`);

    let regenerated = 0;
    let errors = 0;
    const errorDetails = [];

    // Regenerate QR file for each code
    for (const code of allCodes) {
      try {
        console.log(
          `[REGENERATE_QR] Generating QR for: ${code.codeValue} (${regenerated + 1}/${allCodes.length})`,
        );

        // Generate QR file (returns relative path)
        const relativePath = await generateQRCode(code.codeValue);

        // Update database with correct relative path
        await prisma.code.update({
          where: { id: code.id },
          data: { qrImagePath: relativePath },
        });

        regenerated++;
      } catch (error) {
        console.error(
          `[REGENERATE_QR] Error generating QR for ${code.codeValue}:`,
          error.message,
        );
        errors++;
        errorDetails.push({
          codeValue: code.codeValue,
          error: error.message,
        });
      }
    }

    // Verify files were created
    let filesOnDisk = 0;
    try {
      const files = fs.readdirSync(qrCodesDir);
      filesOnDisk = files.length;
      console.log(`[REGENERATE_QR] Files on disk: ${filesOnDisk}`);
    } catch (err) {
      console.error("[REGENERATE_QR] Error reading directory:", err.message);
    }

    console.log(
      `[REGENERATE_QR] Regeneration complete - Regenerated: ${regenerated}, Errors: ${errors}, Files on disk: ${filesOnDisk}`,
    );

    return {
      regenerated,
      errors,
      total: allCodes.length,
      filesOnDisk,
      errorDetails,
    };
  } catch (error) {
    console.error("[REGENERATE_QR] Fatal error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  regenerateQRFiles().then((result) => {
    console.log("[REGENERATE_QR] Final result:", result);
    process.exit(result.errors > 0 ? 1 : 0);
  });
}

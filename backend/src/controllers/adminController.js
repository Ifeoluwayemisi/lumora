import {
  getAllVerifications,
  getAdminPredictionHotspots,
  getAllIncidents,
  getHighRiskCodes,
} from "../services/adminService.js";
import prisma from "../models/prismaClient.js";
import { fixQRPathsInDatabase } from "../utils/fixQRPaths.js";
import { regenerateQRFiles } from "../utils/regenerateQRFiles.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export async function listVerifications(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const result = await getAllVerifications({ page, limit });
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch verifications" });
  }
}

export async function listIncidents(req, res) {
  try {
    const { status } = req.query;
    const incidents = await getAllIncidents({ status });
    res.status(200).json(incidents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erroe: "Failed to fetch incidents" });
  }
}

export async function listHighRiskCodes(req, res) {
  try {
    const codes = await getHighRiskCodes();
    res.status(200).json(codes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch high-risk codes" });
  }
}

export async function listPredictedHotspots(req, res) {
  try {
    const days = parseInt(req.query.days) || 30;
    const hotspots = await getAdminPredictionHotspots(days);
    res.status(200).json(hotspots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch AI-predicted hotspots" });
  }
}

/**
 * Fix QR paths in database - converts absolute paths to relative paths
 * Admin only endpoint
 */
export async function fixQRPaths(req, res) {
  try {
    console.log("[ADMIN] Fixing QR paths in database...");
    const result = await fixQRPathsInDatabase();

    res.status(200).json({
      success: true,
      message: `Fixed QR paths: ${result.fixed} updated, ${result.errors} errors`,
      fixed: result.fixed,
      errors: result.errors,
    });
  } catch (err) {
    console.error("[ADMIN_FIX_QR] Error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fix QR paths",
      message: err.message,
    });
  }
}

/**
 * Diagnostic endpoint - check QR files status
 * Admin only
 */
export async function diagnosticQRStatus(req, res) {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const uploadsPath = path.join(__dirname, "../../uploads");
    const qrCodesDir = path.join(uploadsPath, "qrcodes");

    console.log("[DIAGNOSTIC] Checking QR files status...");

    const diagnostics = {
      uploadsPath,
      qrCodesDir,
      uploadsExists: fs.existsSync(uploadsPath),
      qrDirExists: fs.existsSync(qrCodesDir),
      qrFiles: [],
      databaseCodes: [],
      missingFiles: [],
      summary: {},
    };

    // Check database codes
    const allCodes = await prisma.code.findMany({
      select: { codeValue: true, qrImagePath: true },
      take: 20,
    });

    diagnostics.databaseCodes = allCodes;

    // Check actual files
    if (diagnostics.qrDirExists) {
      try {
        const files = fs.readdirSync(qrCodesDir);
        diagnostics.qrFiles = files;
        diagnostics.summary.totalFiles = files.length;

        // Check which database codes are missing files
        for (const code of allCodes) {
          const fileName = path.basename(code.qrImagePath);
          if (!files.includes(fileName)) {
            diagnostics.missingFiles.push({
              codeValue: code.codeValue,
              expectedPath: code.qrImagePath,
              fileName,
            });
          }
        }
      } catch (err) {
        diagnostics.summary.readError = err.message;
      }
    }

    diagnostics.summary = {
      totalDatabaseCodes: allCodes.length,
      totalFilesOnDisk: diagnostics.qrFiles.length,
      missingFiles: diagnostics.missingFiles.length,
      uploadsPathExists: diagnostics.uploadsExists,
      qrDirExists: diagnostics.qrDirExists,
    };

    res.status(200).json(diagnostics);
  } catch (err) {
    console.error("[DIAGNOSTIC] Error:", err);
    res.status(500).json({
      error: "Diagnostic failed",
      message: err.message,
    });
  }
}

/**
 * Regenerate QR files for all codes in database
 * Creates missing QR PNG files on disk
 * Admin only
 */
export async function regenerateQRFilesEndpoint(req, res) {
  try {
    console.log("[ADMIN] Regenerating QR files for all codes...");
    const result = await regenerateQRFiles();

    res.status(200).json({
      success: true,
      message: `QR files regenerated: ${result.regenerated}/${result.total} codes processed, ${result.errors} errors`,
      regenerated: result.regenerated,
      total: result.total,
      errors: result.errors,
      filesOnDisk: result.filesOnDisk,
      errorDetails: result.errorDetails,
    });
  } catch (err) {
    console.error("[ADMIN_REGENERATE_QR] Error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to regenerate QR files",
      message: err.message,
    });
  }
}

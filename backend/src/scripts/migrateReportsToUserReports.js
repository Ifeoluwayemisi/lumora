import prisma from "../models/prismaClient.js";

/**
 * Migration script to copy existing reports from report table to userReport table
 * This ensures old reports show up in the admin dashboard
 */

async function migrateReports() {
  try {
    console.log("[MIGRATION] Starting report migration...");

    // Get all reports from the report table
    const reports = await prisma.report.findMany({
      include: {
        user: true,
      },
    });

    console.log(`[MIGRATION] Found ${reports.length} reports to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    // Process each report
    for (const report of reports) {
      try {
        // Check if this report already exists in userReport (by code and date)
        const existing = await prisma.userReport.findFirst({
          where: {
            productCode: report.codeValue,
            reportedAt: {
              gte: new Date(report.createdAt.getTime() - 1000),
              lte: new Date(report.createdAt.getTime() + 1000),
            },
          },
        });

        if (existing) {
          console.log(
            `[MIGRATION] Skipped report ${report.id} - already exists in userReport`,
          );
          skippedCount++;
          continue;
        }

        // Create userReport from report
        await prisma.userReport.create({
          data: {
            reporterId: report.userId,
            reporterEmail: report.contact || report.user?.email || null,
            productName: report.productName,
            productCode: report.codeValue,
            scanType: "MANUAL",
            location: report.location || "Unknown Location",
            latitude: report.latitude,
            longitude: report.longitude,
            reason: report.reportType,
            description: report.description,
            status: report.status === "OPEN" ? "NEW" : "UNDER_REVIEW",
            riskLevel: "PENDING",
            reportedAt: report.createdAt,
          },
        });

        migratedCount++;
        console.log(
          `[MIGRATION] Migrated report ${report.id} (${migratedCount}/${reports.length})`,
        );
      } catch (err) {
        console.error(
          `[MIGRATION] Error migrating report ${report.id}:`,
          err.message,
        );
      }
    }

    console.log("[MIGRATION] ✅ Migration complete!");
    console.log(
      `[MIGRATION] Migrated: ${migratedCount}, Skipped: ${skippedCount}`,
    );

    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error("[MIGRATION] Fatal error:", err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run migration
migrateReports();

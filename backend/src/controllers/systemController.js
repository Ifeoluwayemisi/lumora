import { spawn } from "child_process";

/**
 * Manually trigger database migrations
 * Admin-only endpoint to help when migrations don't apply automatically
 */
export const triggerMigrations = async (req, res) => {
  try {
    console.log("[SYSTEM] Triggering database migrations...");

    // Run prisma migrate deploy in a child process
    const migrationProcess = spawn("npx", ["prisma", "migrate", "deploy"], {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    migrationProcess.stdout?.on("data", (data) => {
      stdout += data.toString();
      console.log("[MIGRATION]", data.toString());
    });

    migrationProcess.stderr?.on("data", (data) => {
      stderr += data.toString();
      console.error("[MIGRATION ERROR]", data.toString());
    });

    migrationProcess.on("close", (code) => {
      if (code === 0) {
        console.log("[SYSTEM] Migrations completed successfully");
        return res.status(200).json({
          success: true,
          message: "Migrations applied successfully",
          output: stdout,
        });
      } else {
        console.error("[SYSTEM] Migration failed with code:", code);
        return res.status(500).json({
          success: false,
          message: "Migration process failed",
          error: stderr || stdout,
          code,
        });
      }
    });

    // Set timeout in case process hangs
    const timeout = setTimeout(() => {
      migrationProcess.kill();
      console.error("[SYSTEM] Migration process timeout");
      res.status(504).json({
        success: false,
        message: "Migration process timed out",
        error: "Process took too long to complete",
      });
    }, 30000); // 30 second timeout

    // Clear timeout on completion
    migrationProcess.on("close", () => {
      clearTimeout(timeout);
    });
  } catch (error) {
    console.error("[SYSTEM] Error triggering migrations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to trigger migrations",
      error: error.message,
    });
  }
};

/**
 * Check database schema status
 */
export const checkDatabaseStatus = async (req, res) => {
  try {
    const prisma = req.app.get("prisma");

    // Try a simple query to check connection
    await prisma.$queryRaw`SELECT 1`;

    // Check if Manufacturer table has the new columns
    const manufacturerTable = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Manufacturer'
    `;

    const hasNewColumns = {
      email: false,
      phone: false,
      country: false,
      accountStatus: false,
      trustScore: false,
      riskLevel: false,
      plan: false,
    };

    manufacturerTable.forEach((col) => {
      if (col.column_name in hasNewColumns) {
        hasNewColumns[col.column_name] = true;
      }
    });

    const allColumnsPresent = Object.values(hasNewColumns).every((v) => v);

    return res.status(200).json({
      database: {
        connected: true,
        manufacturerTableExists: manufacturerTable.length > 0,
        newColumnsDeployed: hasNewColumns,
        migrationComplete: allColumnsPresent,
        columns: manufacturerTable.map((c) => c.column_name),
      },
    });
  } catch (error) {
    console.error("[SYSTEM] Error checking database status:", error);
    return res.status(500).json({
      database: {
        connected: false,
        error: error.message,
      },
    });
  }
};

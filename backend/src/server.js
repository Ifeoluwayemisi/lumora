import dotenv from "dotenv";
import { execSync } from "child_process";
import app from "./app.js";
import prisma from "./models/prismaClient.js";
import { setupSecurityJobs, cleanupSecurityJobs } from "./jobs/securityJobs.js";
import { initializeAgencies, resetHourlyCounters, resetDailyCounters } from "./utils/initializeAgencies.js";
import { runAnalyticsJobs } from "./jobs/analyticsJobs.js";

// Trigger redeploy - ESM fixes applied

dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

/**
 * Ensure Prisma client is regenerated at startup
 * DISABLED: Causes Windows file locking issues
 */
function ensurePrismaClient() {
  try {
    console.log("🔄 Using cached Prisma client...");
    // execSync("npx prisma generate", { stdio: "inherit" });
    console.log("✓ Prisma client ready");
  } catch (error) {
    console.warn(
      "⚠️  Prisma client generation warning (may be cached):",
      error.message.split("\n")[0],
    );
  }
}

/**
 * Production startup checks
 */
function validateEnvironment() {
  const requiredEnvVars = [
    "JWT_SECRET",
    "BCRYPT_SALT",
    "JWT_EXPIRES_IN",
    "DATABASE_URL",
  ];

  const missing = requiredEnvVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.error(
      `CRITICAL: Missing environment variables: ${missing.join(", ")}`,
    );
    process.exit(1);
  }
  console.log("All required environment variables are configured");
}

/**
 * Test database connection
 */
async function testDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(" Database connection successful");
  } catch (error) {
    console.error(" Database connection failed:", error.message);
    process.exit(1);
  }
}

/**
 * Start server with proper error handling
 */
async function startServer() {
  try {
    // Validate environment in all envs, but be strict in production
    validateEnvironment();

    // Ensure Prisma client is up to date BEFORE using it
    ensurePrismaClient();

    await testDatabaseConnection();

    // Initialize agencies on startup
    await initializeAgencies();

    let securityJobs = undefined;
    let backgroundJobs = [];

    const server = app.listen(PORT, () => {
      console.log(
        `\n🚀 Lumora backend running on port ${PORT} (${NODE_ENV})\n`,
      );

      // Setup background jobs for rate limiting and analytics
      try {
        // Reset counters every hour
        const hourlyResetInterval = setInterval(async () => {
          await resetHourlyCounters();
        }, 60 * 60 * 1000); // 1 hour
        backgroundJobs.push(hourlyResetInterval);

        // Reset counters every day
        const dailyResetInterval = setInterval(async () => {
          await resetDailyCounters();
        }, 24 * 60 * 60 * 1000); // 24 hours
        backgroundJobs.push(dailyResetInterval);

        // Run analytics jobs daily at midnight
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        tomorrow.setHours(0, 0, 0, 0);
        const msUntilMidnight = tomorrow.getTime() - now.getTime();

        // Run immediately on startup
        runAnalyticsJobs();

        // Schedule for midnight daily
        const analyticsInterval = setInterval(() => {
          runAnalyticsJobs();
        }, 24 * 60 * 60 * 1000); // 24 hours
        backgroundJobs.push(analyticsInterval);

        console.log("[JOBS] Background jobs initialized:");
        console.log("  - Hourly rate limit counter reset");
        console.log("  - Daily rate limit counter reset");
        console.log("  - Daily analytics snapshot job");
      } catch (jobErr) {
        console.error("Failed to setup background jobs:", jobErr.message);
      }

      // Initialize security jobs
      // DISABLED: Jobs exhausting connection pool - enable only in production
      // try {
      //   securityJobs = setupSecurityJobs();
      // } catch (err) {
      //   console.error("Failed to setup security jobs:", err.message);
      // }

      if (NODE_ENV === "development") {
        console.log("Environment info:");
        console.log("  ENABLE_AI_RISK:", process.env.ENABLE_AI_RISK || "false");
        console.log("  OPENAI configured:", !!process.env.OPENAI_API_KEY);
      }
    });

    // Handle graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("\n📉 SIGTERM received, shutting down gracefully...");
      // Clear background jobs
      backgroundJobs.forEach((job) => clearInterval(job));
      cleanupSecurityJobs(securityJobs);
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    });

    process.on("SIGINT", async () => {
      console.log("\n SIGINT received, shutting down...");
      // Clear background jobs
      backgroundJobs.forEach((job) => clearInterval(job));
      cleanupSecurityJobs(securityJobs);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();

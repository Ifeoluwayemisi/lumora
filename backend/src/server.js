import dotenv from "dotenv";
import app from "./app.js";
import prisma from "./models/prismaClient.js";
import { exec } from "child_process";
import { promisify } from "util";

dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const execPromise = promisify(exec);

/**
 * Regenerate Prisma client and run migrations
 */
async function setupDatabase() {
  try {
    console.log("🔄 Regenerating Prisma client...");
    await execPromise("npx prisma generate");
    console.log("✓ Prisma client regenerated");

    console.log("🔄 Running database migrations...");
    await execPromise("npx prisma migrate deploy");
    console.log("✓ Database migrations completed");
  } catch (error) {
    console.warn(
      "⚠️  Database setup warning (may be expected in development):",
      error.message.split("\n")[0],
    );
    // Don't fail - may fail if Prisma is locked or no pending migrations
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

    // Setup database (regenerate client and run migrations)
    await setupDatabase();

    await testDatabaseConnection();

    const server = app.listen(PORT, () => {
      console.log(
        `\n🚀 Lumora backend running on port ${PORT} (${NODE_ENV})\n`,
      );
      if (NODE_ENV === "development") {
        console.log("Environment info:");
        console.log("  ENABLE_AI_RISK:", process.env.ENABLE_AI_RISK || "false");
        console.log("  OPENAI configured:", !!process.env.OPENAI_API_KEY);
      }
    });

    // Handle graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("\n📉 SIGTERM received, shutting down gracefully...");
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    });

    process.on("SIGINT", async () => {
      console.log("\n SIGINT received, shutting down...");
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error(" Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();

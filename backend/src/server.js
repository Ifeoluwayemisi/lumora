import dotenv from "dotenv";
import { execSync } from "child_process";
import app from "./app.js";
import prisma from "./models/prismaClient.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

/**
 * Ensure Prisma client is regenerated at startup
 */
function ensurePrismaClient() {
  try {
    console.log("🔄 Ensuring Prisma client is up to date...");
    execSync("npx prisma generate", { stdio: "inherit" });
    console.log("✓ Prisma client verified");
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

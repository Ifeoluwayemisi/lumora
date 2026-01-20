/**
 * Scheduled Jobs for Critical Security Features
 * Runs daily/weekly recalculations and maintenance tasks
 */

import { recalculateAllManufacturerRiskScores } from "../services/aiRiskService.js";
import { recalculateAllTrustScores } from "../services/dynamicTrustScoreService.js";
import { recheckAllManufacturerWebsites } from "../services/websiteLegitimacyService.js";
import { scheduleRateLimitCleanup } from "../services/rateLimitService.js";
import prisma from "../models/prismaClient.js";

/**
 * Setup all security scheduled jobs
 * Should be called once during server startup
 */
export function setupSecurityJobs() {
  console.log("[JOBS] Initializing security scheduled jobs...");

  // ============================================
  // RISK SCORE RECALCULATION (Daily at 2 AM)
  // ============================================
  const riskScoreJob = setInterval(
    async () => {
      try {
        console.log("[JOBS] ⏰ Starting daily risk score recalculation...");
        const startTime = Date.now();

        const results = await recalculateAllManufacturerRiskScores();

        const duration = Date.now() - startTime;
        console.log(
          `[JOBS] ✅ Risk score recalculation completed: ${results.length} manufacturers in ${duration}ms`,
        );
      } catch (err) {
        console.error(
          "[JOBS] ❌ Risk score recalculation failed:",
          err.message,
        );
      }
    },
    24 * 60 * 60 * 1000,
  ); // Every 24 hours

  // ============================================
  // TRUST SCORE RECALCULATION (Daily at 3 AM)
  // ============================================
  const trustScoreJob = setInterval(
    async () => {
      try {
        console.log("[JOBS] ⏰ Starting daily trust score recalculation...");
        const startTime = Date.now();

        const results = await recalculateAllTrustScores();

        const duration = Date.now() - startTime;
        console.log(
          `[JOBS] ✅ Trust score recalculation completed: ${results.length} manufacturers in ${duration}ms`,
        );
      } catch (err) {
        console.error(
          "[JOBS] ❌ Trust score recalculation failed:",
          err.message,
        );
      }
    },
    24 * 60 * 60 * 1000,
  ); // Every 24 hours

  // ============================================
  // WEBSITE LEGITIMACY RECHECK (Weekly on Sunday at midnight)
  // ============================================
  const websiteCheckJob = setInterval(
    async () => {
      try {
        console.log("[JOBS] ⏰ Starting weekly website legitimacy checks...");
        const startTime = Date.now();

        const results = await recheckAllManufacturerWebsites();

        const duration = Date.now() - startTime;
        console.log(
          `[JOBS] ✅ Website checks completed: ${results.length} manufacturers in ${duration}ms`,
        );
      } catch (err) {
        console.error("[JOBS] ❌ Website checks failed:", err.message);
      }
    },
    7 * 24 * 60 * 60 * 1000,
  ); // Every 7 days

  // ============================================
  // RATE LIMIT CLEANUP (Every 24 hours)
  // ============================================
  scheduleRateLimitCleanup(24);

  // ============================================
  // NOTIFICATION CLEANUP (Daily - delete old notifications)
  // ============================================
  const notificationCleanupJob = setInterval(
    async () => {
      try {
        console.log("[JOBS] ⏰ Starting notification cleanup...");

        // Delete notifications older than 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const deleted = await prisma.userNotifications.deleteMany({
          where: {
            createdAt: {
              lt: thirtyDaysAgo,
            },
          },
        });

        console.log(`[JOBS] ✅ Deleted ${deleted.count} old notifications`);
      } catch (err) {
        console.error("[JOBS] ❌ Notification cleanup failed:", err.message);
      }
    },
    24 * 60 * 60 * 1000,
  ); // Every 24 hours

  // ============================================
  // DATABASE BACKUP REMINDER (Weekly)
  // ============================================
  const backupReminderJob = setInterval(
    async () => {
      try {
        console.log("[JOBS] ⏰ Weekly database backup reminder");
        console.log(
          "[JOBS] 📋 Ensure database backups are running on your hosting platform",
        );
      } catch (err) {
        console.error("[JOBS] ❌ Backup check failed:", err.message);
      }
    },
    7 * 24 * 60 * 60 * 1000,
  ); // Every 7 days

  // ============================================
  // STALE VERIFICATION LOG ARCHIVE (Monthly)
  // ============================================
  const archiveOldLogsJob = setInterval(
    async () => {
      try {
        console.log("[JOBS] ⏰ Starting monthly log archival...");

        // Archive logs older than 90 days (optional - just logs for now)
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

        const count = await prisma.verificationLog.count({
          where: {
            createdAt: {
              lt: ninetyDaysAgo,
            },
          },
        });

        console.log(
          `[JOBS] ✅ Found ${count} logs older than 90 days for archival`,
        );
        console.log(
          "[JOBS] 📝 Note: Consider implementing archival/cold storage",
        );
      } catch (err) {
        console.error("[JOBS] ❌ Log archival check failed:", err.message);
      }
    },
    30 * 24 * 60 * 60 * 1000,
  ); // Every 30 days

  // ============================================
  // HEALTH CHECK (Every 5 minutes)
  // ============================================
  const healthCheckJob = setInterval(
    async () => {
      try {
        // Simple health check - count manufacturers
        const mfgCount = await prisma.manufacturer.count();
        console.log(
          `[JOBS] 💚 Health check: ${mfgCount} manufacturers in system`,
        );
      } catch (err) {
        console.error("[JOBS] ⚠️  Health check failed:", err.message);
      }
    },
    5 * 60 * 1000,
  ); // Every 5 minutes

  // ============================================
  // Log initialization summary
  // ============================================
  console.log(`
[JOBS] 🚀 Security jobs initialized:
  ├─ ⏰ Daily risk score recalculation (every 24h)
  ├─ 📊 Daily trust score recalculation (every 24h)
  ├─ 🌐 Weekly website legitimacy checks (every 7 days)
  ├─ 🧹 Daily rate limit cleanup (every 24h)
  ├─ 🗑️  Daily notification cleanup (every 24h)
  ├─ 💾 Weekly backup reminder (every 7 days)
  ├─ 📋 Monthly log archival (every 30 days)
  └─ 💚 Health checks (every 5 minutes)
  `);

  return {
    riskScoreJob,
    trustScoreJob,
    websiteCheckJob,
    notificationCleanupJob,
    backupReminderJob,
    archiveOldLogsJob,
    healthCheckJob,
  };
}

/**
 * Cleanup scheduled jobs on server shutdown
 */
export function cleanupSecurityJobs(jobs) {
  if (jobs) {
    Object.values(jobs).forEach((job) => {
      if (job) clearInterval(job);
    });
    console.log("[JOBS] 🛑 All scheduled jobs stopped");
  }
}

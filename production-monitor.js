#!/usr/bin/env node

/**
 * Production Monitoring Script
 *
 * Real-time monitoring of production systems:
 * - Health endpoints
 * - Response times
 * - Database performance
 * - Error rates
 * - Memory usage
 * - Active connections
 *
 * Run: npm run monitor:prod
 */

import fetch from "node-fetch";
import postgres from "postgres";
import os from "os";
import fs from "fs";

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

class ProductionMonitor {
  constructor(baseUrl, databaseUrl) {
    this.baseUrl = baseUrl;
    this.databaseUrl = databaseUrl;
    this.metrics = {
      apiHealth: null,
      dbHealth: null,
      responseTime: null,
      errorRate: 0,
      uptime: process.uptime(),
      memoryUsage: {},
      activeConnections: 0,
    };
    this.requestCount = 0;
    this.errorCount = 0;
  }

  log(msg, color = "reset") {
    console.log(`${COLORS[color]}${msg}${COLORS.reset}`);
  }

  async checkAPIHealth() {
    try {
      const start = Date.now();
      const response = await fetch(`${this.baseUrl}/api/health`, {
        timeout: 5000,
      });
      const duration = Date.now() - start;

      if (response.ok) {
        this.metrics.apiHealth = "healthy";
        this.metrics.responseTime = duration;
        this.requestCount++;
        return { status: "healthy", duration };
      } else {
        this.metrics.apiHealth = "unhealthy";
        this.errorCount++;
        return { status: "unhealthy", code: response.status };
      }
    } catch (err) {
      this.metrics.apiHealth = "failed";
      this.errorCount++;
      return { status: "failed", error: err.message };
    }
  }

  async checkDatabaseHealth() {
    try {
      const sql = postgres(this.databaseUrl);
      const start = Date.now();

      const result = await sql`SELECT 1 as health`;
      const duration = Date.now() - start;

      this.metrics.dbHealth = "healthy";
      this.metrics.dbResponseTime = duration;

      await sql.end();
      return { status: "healthy", duration };
    } catch (err) {
      this.metrics.dbHealth = "unhealthy";
      return { status: "unhealthy", error: err.message };
    }
  }

  getMemoryMetrics() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const usagePercent = ((usedMemory / totalMemory) * 100).toFixed(1);

    this.metrics.memoryUsage = {
      total: (totalMemory / 1024 / 1024 / 1024).toFixed(2),
      free: (freeMemory / 1024 / 1024 / 1024).toFixed(2),
      used: (usedMemory / 1024 / 1024 / 1024).toFixed(2),
      usagePercent,
    };

    return this.metrics.memoryUsage;
  }

  getCPUMetrics() {
    const cpus = os.cpus();
    const avgLoad = os.loadavg();

    return {
      cores: cpus.length,
      model: cpus[0].model,
      avgLoad1min: avgLoad[0].toFixed(2),
      avgLoad5min: avgLoad[1].toFixed(2),
      avgLoad15min: avgLoad[2].toFixed(2),
    };
  }

  calculateErrorRate() {
    if (this.requestCount === 0) return 0;
    return ((this.errorCount / this.requestCount) * 100).toFixed(2);
  }

  printDashboard() {
    console.clear();

    this.log("\n╔════════════════════════════════════════════════════════╗");
    this.log(
      "║     🚀 LUMORA PRODUCTION MONITORING DASHBOARD 📊      ║",
      "bold",
    );
    this.log("║════════════════════════════════════════════════════════║\n");

    // API Health
    this.log("📡 API HEALTH", "cyan");
    const apiStatus = this.metrics.apiHealth || "unknown";
    const apiColor =
      apiStatus === "healthy"
        ? "green"
        : apiStatus === "failed"
          ? "red"
          : "yellow";
    this.log(`  Status: ${apiStatus.toUpperCase()}`, apiColor);
    if (this.metrics.responseTime) {
      this.log(`  Response Time: ${this.metrics.responseTime}ms`, "blue");
    }

    // Database Health
    this.log("\n🗄️  DATABASE HEALTH", "cyan");
    const dbStatus = this.metrics.dbHealth || "unknown";
    const dbColor =
      dbStatus === "healthy"
        ? "green"
        : dbStatus === "failed"
          ? "red"
          : "yellow";
    this.log(`  Status: ${dbStatus.toUpperCase()}`, dbColor);
    if (this.metrics.dbResponseTime) {
      this.log(`  Response Time: ${this.metrics.dbResponseTime}ms`, "blue");
    }

    // System Metrics
    this.log("\n💻 SYSTEM METRICS", "cyan");
    this.log(`  Uptime: ${(this.metrics.uptime / 60).toFixed(1)} minutes`);
    this.log(`  Uptime: ${(this.metrics.uptime / 3600).toFixed(1)} hours`);

    // Memory
    this.log("\n📈 MEMORY USAGE", "cyan");
    const mem = this.metrics.memoryUsage;
    const memColor = mem.usagePercent > 80 ? "red" : "green";
    this.log(`  Total: ${mem.total} GB`);
    this.log(`  Used: ${mem.used} GB`);
    this.log(`  Free: ${mem.free} GB`);
    this.log(`  Usage: ${mem.usagePercent}%`, memColor);

    // CPU
    this.log("\n🔧 CPU METRICS", "cyan");
    const cpu = this.getCPUMetrics();
    this.log(`  Cores: ${cpu.cores}`);
    this.log(`  Model: ${cpu.model}`);
    this.log(`  Load Avg (1m): ${cpu.avgLoad1min}`);
    this.log(`  Load Avg (5m): ${cpu.avgLoad5min}`);
    this.log(`  Load Avg (15m): ${cpu.avgLoad15min}`);

    // Request Stats
    this.log("\n📊 REQUEST STATISTICS", "cyan");
    const errorRate = this.calculateErrorRate();
    const errorColor = errorRate > 5 ? "red" : "green";
    this.log(`  Total Requests: ${this.requestCount}`);
    this.log(`  Errors: ${this.errorCount}`);
    this.log(`  Error Rate: ${errorRate}%`, errorColor);

    // Recommendations
    this.log("\n💡 RECOMMENDATIONS", "cyan");
    if (mem.usagePercent > 80) {
      this.log("  ⚠️  Memory usage is high - consider optimization", "yellow");
    }
    if (errorRate > 5) {
      this.log("  ⚠️  Error rate is elevated - check logs", "yellow");
    }
    if (apiStatus !== "healthy") {
      this.log("  ⚠️  API is not responding - restart may be needed", "red");
    }
    if (dbStatus !== "healthy") {
      this.log("  ⚠️  Database connection issues detected", "red");
    }
    if (
      mem.usagePercent <= 80 &&
      errorRate <= 5 &&
      apiStatus === "healthy" &&
      dbStatus === "healthy"
    ) {
      this.log("  ✅ All systems nominal", "green");
    }

    this.log("\n" + "═".repeat(60));
    this.log(`Last Updated: ${new Date().toISOString()}`);
    this.log("Press Ctrl+C to exit\n");
  }

  async monitor() {
    this.log(
      "Starting production monitoring... (updating every 10 seconds)",
      "green",
    );

    while (true) {
      await this.checkAPIHealth();
      await this.checkDatabaseHealth();
      this.getMemoryMetrics();

      this.printDashboard();

      // Wait 10 seconds before next check
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }
}

// Initialize and start monitor
const BASE_URL = process.env.API_URL || "http://localhost:5000";
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const monitor = new ProductionMonitor(BASE_URL, DATABASE_URL);
monitor.monitor().catch((err) => {
  console.error("Monitor error:", err);
  process.exit(1);
});

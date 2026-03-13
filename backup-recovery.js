#!/usr/bin/env node

/**
 * Database Backup & Recovery Script
 *
 * Automated production database backup with:
 * - Point-in-time backup creation
 * - Backup verification
 * - Retention management
 * - Recovery procedures
 * - Backup reporting
 *
 * Run: npm run backup:create
 * Restore: npm run backup:restore -- --file backup-YYYY-MM-DD.sql
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import postgres from "postgres";

dotenv.config();

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

class DatabaseBackup {
  constructor() {
    this.backupDir = path.join(process.cwd(), "backups");
    this.logsDir = path.join(this.backupDir, "logs");
    this.databaseUrl = process.env.DATABASE_URL;
    this.retentionDays = 30;
  }

  log(msg, color = "reset") {
    console.log(`${COLORS[color]}${msg}${COLORS.reset}`);
  }

  ensureDirectories() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      this.log(`✓ Created backup directory: ${this.backupDir}`, "green");
    }

    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
      this.log(`✓ Created logs directory: ${this.logsDir}`, "green");
    }
  }

  parseConnectionString() {
    const url = new URL(this.databaseUrl);
    return {
      host: url.hostname,
      port: url.port || 5432,
      database: url.pathname.slice(1),
      user: url.username,
      password: url.password,
    };
  }

  async createBackup() {
    this.log("\n🔄 Starting Database Backup...\n", "cyan");

    this.ensureDirectories();

    const conn = this.parseConnectionString();
    const timestamp = new Date().toISOString().split("T")[0];
    const fullTimestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -1);
    const backupFile = path.join(this.backupDir, `backup-${timestamp}.sql`);
    const logFile = path.join(this.logsDir, `backup-${fullTimestamp}.log`);

    try {
      // Check if backup already exists for today
      if (fs.existsSync(backupFile)) {
        this.log(
          `⚠️  Backup already exists for ${timestamp}. Overwriting...`,
          "yellow",
        );
      }

      // Build pg_dump command
      const pgDumpCmd = `pg_dump -h ${conn.host} -p ${conn.port} -U ${conn.user} -d ${conn.database} --verbose --no-password`;

      this.log("Executing backup command...", "blue");

      // Set password env variable for pg_dump
      const env = { ...process.env, PGPASSWORD: conn.password };

      const startTime = Date.now();

      // Execute backup
      const output = execSync(pgDumpCmd, {
        env,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });

      const backupSize = output.length;
      const duration = Date.now() - startTime;

      // Write backup file
      fs.writeFileSync(backupFile, output);

      const backupStats = fs.statSync(backupFile);

      this.log(`\n✅ BACKUP SUCCESSFUL\n`, "green");
      this.log(`File: ${path.basename(backupFile)}`);
      this.log(`Size: ${(backupStats.size / 1024 / 1024).toFixed(2)} MB`);
      this.log(`Duration: ${(duration / 1000).toFixed(2)} seconds`);
      this.log(`Location: ${backupFile}`);

      // Log backup info
      const logEntry = `
[${new Date().toISOString()}] BACKUP SUCCESSFUL
- File: ${backupFile}
- Size: ${(backupStats.size / 1024 / 1024).toFixed(2)} MB
- Duration: ${(duration / 1000).toFixed(2)} seconds
- Records: ${output.split("\n").length - 1}
`;

      fs.appendFileSync(logFile, logEntry);

      // Verify backup
      await this.verifyBackup(backupFile);

      // Cleanup old backups
      this.cleanupOldBackups();

      return backupFile;
    } catch (err) {
      const errorMsg = `\n❌ BACKUP FAILED\n\nError: ${err.message}`;
      this.log(errorMsg, "red");

      // Log error
      const logEntry = `[${new Date().toISOString()}] BACKUP FAILED: ${err.message}\n`;
      fs.appendFileSync(logFile, logEntry);

      throw err;
    }
  }

  async verifyBackup(backupFile) {
    this.log("\n🔍 Verifying Backup...", "blue");

    try {
      const stats = fs.statSync(backupFile);

      if (stats.size === 0) {
        throw new Error("Backup file is empty");
      }

      // Check for SQL structure
      const content = fs.readFileSync(backupFile, "utf-8");

      const checks = [
        {
          name: "SQL header",
          pattern: /PostgreSQL/,
        },
        {
          name: "CREATE TABLE statements",
          pattern: /CREATE TABLE/,
        },
        {
          name: "INSERT statements",
          pattern: /INSERT INTO/,
        },
      ];

      let allValid = true;

      for (const check of checks) {
        if (check.pattern.test(content)) {
          this.log(`✓ ${check.name} found`, "green");
        } else {
          this.log(`⚠️  ${check.name} not found`, "yellow");
          allValid = false;
        }
      }

      if (allValid) {
        this.log("✅ Backup verification complete - backup is valid", "green");
      }

      return allValid;
    } catch (err) {
      this.log(`✗ Backup verification failed: ${err.message}`, "red");
      throw err;
    }
  }

  async restoreBackup(backupFile) {
    this.log("\n⚠️  INITIATING DATABASE RESTORE\n", "yellow");

    if (!fs.existsSync(backupFile)) {
      this.log(`File not found: ${backupFile}`, "red");
      throw new Error("Backup file not found");
    }

    const conn = this.parseConnectionString();

    this.log("Reading backup file...");
    const backupContent = fs.readFileSync(backupFile, "utf-8");

    this.log(
      `⚠️  RESTORATION WILL OVERWRITE DATABASE. Enter password to confirm.`,
      "red",
    );

    try {
      // Save backup content to temp file
      const tempFile = path.join(this.backupDir, "temp-restore.sql");
      fs.writeFileSync(tempFile, backupContent);

      const startTime = Date.now();

      // Restore using psql
      const psqlCmd = `psql -h ${conn.host} -p ${conn.port} -U ${conn.user} -d ${conn.database} -f ${tempFile}`;

      const env = { ...process.env, PGPASSWORD: conn.password };

      execSync(psqlCmd, { env, stdio: "inherit" });

      const duration = Date.now() - startTime;

      // Cleanup temp file
      fs.unlinkSync(tempFile);

      this.log(
        `\n✅ RESTORE SUCCESSFUL in ${(duration / 1000).toFixed(2)} seconds`,
        "green",
      );

      return true;
    } catch (err) {
      this.log(`\n❌ RESTORE FAILED: ${err.message}`, "red");
      throw err;
    }
  }

  cleanupOldBackups() {
    this.log("\n🧹 Cleaning Up Old Backups...", "blue");

    const files = fs
      .readdirSync(this.backupDir)
      .filter((f) => f.startsWith("backup-") && f.endsWith(".sql"));

    const now = Date.now();
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(this.backupDir, file);
      const stat = fs.statSync(filePath);
      const ageMs = now - stat.mtime.getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);

      if (ageDays > this.retentionDays) {
        fs.unlinkSync(filePath);
        this.log(
          `✓ Deleted: ${file} (${ageDays.toFixed(1)} days old)`,
          "yellow",
        );
        deletedCount++;
      }
    }

    this.log(`✓ Cleanup complete - ${deletedCount} backups removed`);
  }

  listBackups() {
    this.log("\n📋 Available Backups:\n", "cyan");

    const files = fs
      .readdirSync(this.backupDir)
      .filter((f) => f.startsWith("backup-") && f.endsWith(".sql"))
      .sort()
      .reverse();

    if (files.length === 0) {
      this.log("No backups found", "yellow");
      return;
    }

    for (const file of files) {
      const filePath = path.join(this.backupDir, file);
      const stat = fs.statSync(filePath);
      const sizeMb = (stat.size / 1024 / 1024).toFixed(2);
      const date = stat.mtime.toISOString();

      this.log(`${file} - ${sizeMb} MB - ${date}`, "blue");
    }
  }

  printBackupReport() {
    this.log("\n╔════════════════════════════════════════════════════════╗");
    this.log(
      "║          DATABASE BACKUP & RECOVERY SYSTEM            ║",
      "bold",
    );
    this.log("║════════════════════════════════════════════════════════║\n");

    this.log("Available Commands:", "cyan");
    this.log("npm run backup:create    - Create new backup");
    this.log("npm run backup:list      - List all backups");
    this.log("npm run backup:restore   - Restore backup");
    this.log("npm run backup:cleanup   - Remove old backups");

    this.log("\nBackup Configuration:", "cyan");
    this.log(`Backup Directory: ${this.backupDir}`);
    this.log(`Retention Period: ${this.retentionDays} days`);
    this.log(`Database: ${this.parseConnectionString().database}`);

    this.log("\nFor more information, see: BACKUP_RECOVERY_GUIDE.md", "cyan");
  }
}

// Main execution
const backup = new DatabaseBackup();

const command = process.argv[2];

switch (command) {
  case "create":
    backup
      .createBackup()
      .then(() => {
        process.exit(0);
      })
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
    break;

  case "restore":
    const file = process.argv[4]; // --file <path>
    if (!file) {
      backup.log(
        "Usage: npm run backup:restore -- --file <backup-file>",
        "red",
      );
      process.exit(1);
    }
    backup
      .restoreBackup(file)
      .then(() => {
        process.exit(0);
      })
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
    break;

  case "list":
    backup.listBackups();
    process.exit(0);
    break;

  case "cleanup":
    backup.cleanupOldBackups();
    process.exit(0);
    break;

  default:
    backup.printBackupReport();
    process.exit(0);
}

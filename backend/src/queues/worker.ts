import { Worker, Queue } from "bullmq";
import IORedis from "ioredis";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { performELA } from "../ai/ela";
import { performOCR } from "../ai/ocr";
import { createAudit } from "../services/auditService";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const connection = new IORedis(redisUrl);
const prisma = new PrismaClient();

// Export queue so other services can enqueue jobs
export const analysisQueue = new Queue("certificate-analysis", { connection });

// AI analysis wrapper
async function runAnalysis(certPath: string, expectedNafda?: string) {
  const ela = await performELA(certPath);
  const ocr = await performOCR(certPath);

  let score = 0;
  const reasons: string[] = [];

  if (ela.maxDiff > 20) {
    score += 0.5;
    reasons.push("ELA high diff");
  } else if (ela.maxDiff > 8) {
    score += 0.2;
    reasons.push("ELA moderate diff");
  }

  if (!ocr.text || ocr.text.trim().length < 10) {
    score += 0.4;
    reasons.push("OCR insufficient");
  }

  if (expectedNafda && !ocr.text.includes(expectedNafda)) {
    score += 0.4;
    reasons.push("NAFDAC mismatch");
  }

  if (score > 1) score = 1;

  const status = score >= 0.7 ? "FAKE" : score >= 0.25 ? "SUSPICIOUS" : "CLEAN";
  return { score, status, reasons, ela, ocr };
}

// Worker
const worker = new Worker(
  "certificate-analysis",
  async (job) => {
    const { manufacturerId, certPath, expectedNafda } = job.data;
    console.log("Processing certificate analysis job", job.id, certPath);

    try {
      const result = await runAnalysis(certPath, expectedNafda);

      // Update manufacturer in DB
      await prisma.manufacturer.update({
        where: { id: manufacturerId },
        data: {
          aiScore: result.score,
          aiStatus: result.status,
        },
      });

      // Create audit log
      await createAudit(prisma, {
        actorId: manufacturerId,
        actorRole: "MANUFACTURER",
        action: "certificate_analyzed",
        meta: {
          score: result.score,
          status: result.status,
          reasons: result.reasons,
        },
      });

      return result;
    } catch (err) {
      console.error("Worker error", err);
      throw err;
    }
  },
  { connection }
);

// Worker events
worker.on("completed", (job, result) => console.log("Job completed", job.id));
worker.on("failed", (job, err) => console.error("Job failed", job?.id, err));
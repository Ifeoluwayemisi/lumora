import { Worker } from "bullmq";
import IORedis from "ioredis";
import { PrismaClient } from "@prisma/client";
import { performELA } from "../ai/ela";
import { performOCR } from "../ai/ocr";

const prisma = new PrismaClient();
const connection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

const worker = new Worker("certificate-analysis", async (job) => {
  const { manufacturerId, certPath, expectedNafda } = job.data;
  console.log("Processing certificate analysis for", manufacturerId, certPath);
  try {
    const ela = await performELA(certPath);
    const ocr = await performOCR(certPath);
    // simple heuristics
    let score = 0;
    const reasons: string[] = [];
    if (ela.maxDiff > 20) { score += 0.5; reasons.push("ELA high diff"); }
    if (!ocr.text || ocr.text.trim().length < 10) { score += 0.4; reasons.push("OCR insufficient"); }
    if (expectedNafda && !(ocr.text || "").includes(expectedNafda)) { score += 0.4; reasons.push("NAFDAC mismatch"); }
    if (score > 1) score = 1;
    const status = score >= 0.7 ? "FAKE" : score >= 0.25 ? "SUSPICIOUS" : "CLEAN";
    await prisma.manufacturer.update({ where: { id: manufacturerId }, data: { aiScore: score, aiStatus: status } });
    return { score, status, reasons, ela, ocr };
  } catch (err) {
    console.error("Worker error", err);
    throw err;
  }
}, { connection });

worker.on("completed", (job) => console.log("Job completed", job.id));
worker.on("failed", (job, err) => console.error("Job failed", job?.id, err));

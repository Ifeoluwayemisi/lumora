import { Queue } from "bullmq";
import IORedis from "ioredis";
const connection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379");
const queue = new Queue("certificate-analysis", { connection });
export async function enqueueCertificateAnalysis(data: { manufacturerId: string; certPath: string; expectedNafda?: string }) {
  const job = await queue.add("analyze", data, { attempts: 3, backoff: { type: "exponential", delay: 1000 } });
  return job;
}
